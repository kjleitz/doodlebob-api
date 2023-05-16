import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Controller, { Verb } from "../Controller";
import authGate from "../middleware/gates/authGate";
import UnprocessableEntityError from "../../lib/errors/http/UnprocessableEntityError";
import Resource from "ts-japi/lib/models/resource.model";
import HttpStatus from "../../lib/errors/HttpStatus";
import LabelCreateAttributes from "../../lib/permitters/labels/LabelCreateAttributes";
import { validateLabelCreateData } from "../../lib/validators/validateLabelCreateData";
import deserializeLabelCreate from "../../lib/deserializers/labels/deserializeLabelCreate";
import buildLabel from "../../lib/builders/labels/buildLabel";
import UnauthorizedError from "../../lib/errors/http/UnauthorizedError";
import LabelUpdateAttributes from "../../lib/permitters/labels/LabelUpdateAttributes";
import { validateLabelUpdateData } from "../../lib/validators/validateLabelUpdateData";
import deserializeLabelUpdate from "../../lib/deserializers/labels/deserializeLabelUpdate";
import editLabel from "../../lib/builders/labels/editLabel";
import NotFoundError from "../../lib/errors/http/NotFoundError";

const labels = new Controller();
const labelRepository = appDataSource.getRepository(Label);

labels.on(Verb.GET, "/", [authGate], (req) => {
  const userId = req.jwtUserClaims?.id;
  // TODO: pagination
  return labelRepository.find({ where: { user: { id: userId } } });
});

labels.on(Verb.GET, "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.jwtUserClaims?.id;
  if (!userId) throw new UnauthorizedError();

  return labelRepository.findOneOrFail({ where: { id, user: { id: userId } } });
});

labels.on(Verb.POST, "/", [authGate], (req, res) => {
  const data = req.body.data as Resource<LabelCreateAttributes>;
  if (!data || !data.attributes) throw new UnprocessableEntityError();

  const userId = req.jwtUserClaims!.id;
  if (!userId) throw new UnauthorizedError();

  validateLabelCreateData(data.attributes);

  const attrs = deserializeLabelCreate(data);

  return buildLabel(attrs, userId)
    .then((label) => labelRepository.save(label))
    .then((label) => {
      res.status(HttpStatus.CREATED);
      return label;
    });
});

labels.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const id = parseInt(req.params.id, 10);
  const data = req.body.data as Resource<LabelUpdateAttributes>;
  if (!data || !data.attributes) throw new UnprocessableEntityError();

  validateLabelUpdateData(data.attributes);

  const attrs = deserializeLabelUpdate(data);

  return labelRepository
    .findOneByOrFail({ id })
    .then((label) => editLabel(label, attrs))
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
