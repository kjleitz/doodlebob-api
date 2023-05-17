import buildLabel from "../../lib/builders/labels/buildLabel";
import editLabel from "../../lib/builders/labels/editLabel";
import HttpStatus from "../../lib/errors/HttpStatus";
import NotFoundError from "../../lib/errors/http/NotFoundError";
import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Controller, { Verb } from "../Controller";
import authGate from "../middleware/gates/authGate";
import parseBodyAsSchema from "../middleware/helpers/parseBodyAsSchema";
import { LabelCreateResourceDocument, LabelUpdateResourceDocument } from "../schemata/jsonApiLabels";

const labels = new Controller();
const labelRepository = appDataSource.getRepository(Label);

labels.on(Verb.GET, "/", [authGate], (req) => {
  const userId = req.jwtUserClaims?.id;
  // TODO: pagination
  return labelRepository.find({ where: { user: { id: userId } } });
});

labels.on(Verb.GET, "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims!.id;
  return labelRepository.findOneOrFail({ where: { id, user: { id: userId } } });
});

labels.on(Verb.POST, "/", [authGate], (req, res) => {
  const userId = req.jwtUserClaims!.id;
  const document = parseBodyAsSchema(req.body, LabelCreateResourceDocument);
  const { attributes } = document.data;

  return buildLabel(attributes, userId)
    .then((label) => labelRepository.save(label))
    .then((label) => {
      res.status(HttpStatus.CREATED);
      return label;
    });
});

labels.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims!.id;
  const document = parseBodyAsSchema(req.body, LabelUpdateResourceDocument);
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
