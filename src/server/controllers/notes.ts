import { z } from "zod";
import buildNote from "../../lib/builders/notes/buildNote";
import editNote from "../../lib/builders/notes/editNote";
import HttpStatus from "../../lib/errors/HttpStatus";
import NotFoundError from "../../lib/errors/http/NotFoundError";
import UnprocessableEntityError from "../../lib/errors/http/UnprocessableEntityError";
import NoteSerializer, { NoteLabelsRelator } from "../../lib/serializers/NoteSerializer";
import { toParagraph } from "../../lib/utils/strings";
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

const notes = new Controller();
const noteRepository = appDataSource.getRepository(Note);

const parseBodyAsSchema = <I>(requestBody: any, schema: z.ZodType<I>): I => {
  const parsed = schema.safeParse(requestBody);
  if (!parsed.success)
    throw new UnprocessableEntityError(toParagraph(parsed.error.issues.map((issue) => issue.message)), parsed.error);

  return parsed.data;
};

type LabelSetter = Pick<Label, "id">;

const labelSettersFromLinkages = (linkages?: NoteLabelResourceLinkage[]): LabelSetter[] | undefined => {
  return linkages?.map(({ id }) => ({ id: typeof id === "number" ? id : parseInt(id, 10) })).filter(({ id }) => id);
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
  const document = parseBodyAsSchema(req.body, NoteCreateResourceDocument);
  const { attributes, relationships } = document.data;
  const labelsToSet = labelSettersFromLinkages(relationships?.labels?.data);

  return buildNote(attributes, userId)
    .then((note) => {
      if (labelsToSet) note.labels = labelsToSet as Label[];
      return noteRepository.save(note);
    })
    .then((note) => {
      res.status(HttpStatus.CREATED);
      return note;
    })
    .then((note) => NoteSerializer.serialize(note, { relators: [NoteLabelsRelator] }));
});

notes.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const { id } = req.params;
  const userId = req.jwtUserClaims!.id;
  const document = parseBodyAsSchema(req.body, NoteUpdateResourceDocument);
  const { attributes, relationships } = document.data;
  const labelsToSet = labelSettersFromLinkages(relationships?.labels?.data);

  return noteRepository
    .findOneOrFail({ where: { id, user: { id: userId } }, relations: { labels: true } })
    .then((note) => {
      return note;
    })
    .then((note) => editNote(note, attributes))
    .then((edits) => {
      if (labelsToSet) edits.labels = labelsToSet as Label[];
      return noteRepository.save(edits);
    })
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
