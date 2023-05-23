import { In } from "typeorm";
import buildNote from "../../lib/builders/notes/buildNote";
import editNote from "../../lib/builders/notes/editNote";
import HttpStatus from "../../lib/errors/HttpStatus";
import NotFoundError from "../../lib/errors/http/NotFoundError";
import createPaginator from "../../lib/pagination/createPaginator";
import pageDbOptions from "../../lib/pagination/pageDbOptions";
import NoteSerializer, { NoteLabelsRelator } from "../../lib/serializers/NoteSerializer";
import { SortOrder } from "../../lib/sort/SortOptions";
import orderFromSortOptions from "../../lib/sort/orderFromSortOptions";
import { sortedUniq } from "../../lib/utils/arrays";
import { middleman } from "../../lib/utils/promises";
import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Note from "../../orm/entities/Note";
import Controller, { Verb } from "../Controller";
import authGate from "../middleware/gates/authGate";
import baseUrlForPagination from "../middleware/helpers/baseUrlForPagination";
import {
  NoteCreateResourceDocument,
  NoteLabelResourceLinkage,
  NoteUpdateResourceDocument,
} from "../schemata/jsonApiNotes";

const MAX_NOTES_PAGE_SIZE = 100;

const notes = new Controller();
const noteRepository = appDataSource.getRepository(Note);
const labelRepository = appDataSource.getRepository(Label);

const permitLabelSetters = (
  labelLinkages: NoteLabelResourceLinkage[] | undefined,
  userId: string,
): Promise<Label[] | null> => {
  if (!labelLinkages) return Promise.resolve(null); // do not delete all labels
  if (labelLinkages.length === 0) return Promise.resolve([]); // delete all labels

  const desiredLabelIds = labelLinkages.map(({ id }) => parseInt(id, 10));

  // Only allow labels to be set on the note which have been created by the
  // author of the note (the logged-in user).
  return labelRepository
    .find({ where: { id: In(desiredLabelIds), user: { id: userId } } })
    .then((labels) => (labels.length ? labels : null));
};

notes.on(Verb.GET, "/", [authGate], (req) => {
  const userId = req.jwtUserClaims!.id;
  const { skip, take } = pageDbOptions(req.page, MAX_NOTES_PAGE_SIZE);
  const order = orderFromSortOptions(req.sort, "createdAt", {
    createdAt: SortOrder.DESC,
    updatedAt: SortOrder.DESC,
    title: SortOrder.ASC,
    body: SortOrder.ASC,
  });

  return noteRepository.findAndCount({ where: { user: { id: userId } }, order, skip, take }).then(([notes, count]) => {
    const paginator = createPaginator(baseUrlForPagination(req), req.page.index, take, count);
    return NoteSerializer.serialize(notes, { linkers: { paginator } });
  });
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
  const document = NoteCreateResourceDocument.parse(req.document);
  const { attributes, relationships } = document.data;
  const labelLinkages = relationships?.labels?.data;

  return buildNote(attributes, userId)
    .then((note) =>
      permitLabelSetters(labelLinkages, userId).then((labelSetters) => {
        if (labelSetters) note.labels = labelSetters;
        return noteRepository.save(note);
      }),
    )
    .then(middleman(() => res.status(HttpStatus.CREATED)))
    .then((note) => NoteSerializer.serialize(note, { relators: [NoteLabelsRelator] }));
});

notes.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const { id } = req.params;
  const userId = req.jwtUserClaims!.id;
  const document = NoteUpdateResourceDocument.parse(req.document);
  const { attributes, relationships } = document.data;
  const labelLinkages = relationships?.labels?.data;

  return noteRepository
    .findOneOrFail({ where: { id, user: { id: userId } }, relations: { labels: true } })
    .then((note) => editNote(note, attributes))
    .then((edits) =>
      permitLabelSetters(labelLinkages, userId).then((labelSetters) => {
        if (labelSetters) edits.labels = labelSetters;

        // Entity subscribers don't fire their `beforeUpdate` hooks if only a
        // relation is changing, so we gotta update the cache manually on
        // note update in case all we're doing is adding/removing labels on the
        // note.
        // TODO: This is fragile. There is also, theoretically, a race condition
        // here. We grab the original labels along with the note, then set them
        // again when we save the record. Right in the middle of that, a new
        // label could be associated with the record and then this would
        // steamroll that new label. It's pretty unlikely, though, I think. Come
        // back to it.
        edits.labelNamesCache = sortedUniq(edits.labels.map(({ name }) => name).sort());

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
