import buildLabel from "../../lib/builders/labels/buildLabel";
import editLabel from "../../lib/builders/labels/editLabel";
import HttpStatus from "../../lib/errors/HttpStatus";
import NotFoundError from "../../lib/errors/http/NotFoundError";
import createPaginator from "../../lib/pagination/createPaginator";
import pageDbOptions from "../../lib/pagination/pageDbOptions";
import NoteSerializer from "../../lib/serializers/NoteSerializer";
import { SortOrder } from "../../lib/sort/SortOptions";
import orderFromSortOptions from "../../lib/sort/orderFromSortOptions";
import { middleman } from "../../lib/utils/promises";
import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Note from "../../orm/entities/Note";
import Controller, { Verb } from "../Controller";
import authGate from "../middleware/gates/authGate";
import baseUrlForPagination from "../middleware/helpers/baseUrlForPagination";
import { LabelCreateResourceDocument, LabelUpdateResourceDocument } from "../schemata/jsonApiLabels";

const MAX_LABEL_NOTES_PAGE_SIZE = 100;

const labels = new Controller();
const labelRepository = appDataSource.getRepository(Label);
const noteRepository = appDataSource.getRepository(Note);

labels.on(Verb.GET, "/", [authGate], (req) => {
  const userId = req.jwtUserClaims!.id;
  const order = orderFromSortOptions(req.sort, "name", {
    createdAt: SortOrder.DESC,
    updatedAt: SortOrder.DESC,
    name: SortOrder.ASC,
  });

  return labelRepository.find({ where: { user: { id: userId } }, order });
});

labels.on(Verb.GET, "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims!.id;
  return labelRepository.findOneOrFail({ where: { id, user: { id: userId } } });
});

labels.on(Verb.GET, "/:id/notes", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims!.id;
  const { skip, take } = pageDbOptions(req.page, MAX_LABEL_NOTES_PAGE_SIZE);
  const order = orderFromSortOptions(req.sort, "createdAt", {
    createdAt: SortOrder.DESC,
    updatedAt: SortOrder.DESC,
    title: SortOrder.ASC,
    body: SortOrder.ASC,
  });

  return labelRepository
    .findOneOrFail({ where: { id, user: { id: userId } } })
    .then((label) =>
      noteRepository.findAndCount({
        where: { user: { id: userId }, labels: { id: label.id } },
        order,
        skip,
        take,
      }),
    )
    .then(([notes, count]) => {
      const paginator = createPaginator(baseUrlForPagination(req), req.page.index, take, count);
      return NoteSerializer.serialize(notes, { linkers: { paginator } });
    });
});

labels.on(Verb.POST, "/", [authGate], (req, res) => {
  const userId = req.jwtUserClaims!.id;
  const document = LabelCreateResourceDocument.parse(req.document);
  const { attributes } = document.data;

  return buildLabel(attributes, userId)
    .then((label) => labelRepository.save(label))
    .then(middleman(() => res.status(HttpStatus.CREATED)));
});

labels.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims!.id;
  const document = LabelUpdateResourceDocument.parse(req.document);
  const { attributes } = document.data;

  return labelRepository
    .findOneOrFail({ where: { id, user: { id: userId } } })
    .then((label) => editLabel(label, attributes))
    .then((edits) => labelRepository.save(edits));
});

labels.on(Verb.DELETE, "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims!.id;
  if (!userId) throw new NotFoundError("Label", id);

  return labelRepository
    .findOneOrFail({ where: { id, user: { id: userId } } })
    .then((label) => labelRepository.remove(label));
});

export default labels;
