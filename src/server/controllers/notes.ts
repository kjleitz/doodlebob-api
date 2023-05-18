import { In } from "typeorm";
import buildNote from "../../lib/builders/notes/buildNote";
import editNote from "../../lib/builders/notes/editNote";
import HttpStatus from "../../lib/errors/HttpStatus";
import NotFoundError from "../../lib/errors/http/NotFoundError";
import NoteSerializer, { NoteLabelsRelator } from "../../lib/serializers/NoteSerializer";
import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Note from "../../orm/entities/Note";
import Controller, { Verb } from "../Controller";
import authGate from "../middleware/gates/authGate";
import {
  NoteCreateResourceDocument,
  NoteLabelResourceLinkage,
  NoteUpdateResourceDocument,
} from "../schemata/jsonApiNotes";
import { middleman } from "../../lib/utils/promises";

const notes = new Controller();
const noteRepository = appDataSource.getRepository(Note);
const labelRepository = appDataSource.getRepository(Label);

const permitLabelSetters = (
  labelLinkages: NoteLabelResourceLinkage[] | undefined,
  userId: string,
): Promise<Pick<Label, "id">[] | null> => {
  if (!labelLinkages) return Promise.resolve(null); // do not delete all labels
  if (labelLinkages.length === 0) return Promise.resolve([]); // delete all labels

  const desiredLabelIds = labelLinkages.map(({ id }) => parseInt(id, 10));

  // Only allow labels to be set on the note which have been created by the
  // author of the note (the logged-in user).
  return labelRepository
    .find({ select: { id: true }, where: { id: In(desiredLabelIds), user: { id: userId } } })
    .then((labels) => (labels.length ? labels : null));
};

notes.on(Verb.GET, "/", [authGate], (req) => {
  const userId = req.jwtUserClaims!.id;
  // TODO: pagination
  return noteRepository.find({ where: { user: { id: userId } } });
});

notes.on(Verb.GET, "/:id", [authGate], (req) => {
  const { id } = req.params;
  const userId = req.jwtUserClaims!.id;
  return noteRepository
    .findOneOrFail({ where: { id, user: { id: userId } }, relations: { labels: true } })
    .then((note) => NoteSerializer.serialize(note, { relators: [NoteLabelsRelator] }));
});

notes.on(Verb.POST, "/", [authGate], (req, res) => {
  const userId = req.jwtUserClaims!.id;
  const document = NoteCreateResourceDocument.parse(req.body);
  const { attributes, relationships } = document.data;
  const labelLinkages = relationships?.labels?.data;

  return buildNote(attributes, userId)
    .then((note) =>
      permitLabelSetters(labelLinkages, userId).then((labelSetters) => {
        if (labelSetters) note.labels = labelSetters as Label[];
        return noteRepository.save(note);
      }),
    )
    .then(middleman(() => res.status(HttpStatus.CREATED)))
    .then((note) => NoteSerializer.serialize(note, { relators: [NoteLabelsRelator] }));
});

notes.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const { id } = req.params;
  const userId = req.jwtUserClaims!.id;
  const document = NoteUpdateResourceDocument.parse(req.body);
  const { attributes, relationships } = document.data;
  const labelLinkages = relationships?.labels?.data;

  return noteRepository
    .findOneOrFail({ where: { id, user: { id: userId } }, relations: { labels: true } })
    .then((note) => editNote(note, attributes))
    .then((edits) =>
      permitLabelSetters(labelLinkages, userId).then((labelSetters) => {
        if (labelSetters) edits.labels = labelSetters as Label[];
        return noteRepository.save(edits);
      }),
    )
    .then((note) => NoteSerializer.serialize(note, { relators: [NoteLabelsRelator] }));
});

notes.on(Verb.DELETE, "/:id", [authGate], (req) => {
  const { id } = req.params;
  const userId = req.jwtUserClaims!.id;
  if (!userId) throw new NotFoundError("Note", id);

  return noteRepository
    .findOneOrFail({ where: { id, user: { id: userId } } })
    .then((note) => noteRepository.remove(note));
});

export default notes;
