import appDataSource from "../../orm/config/appDataSource";
import Note from "../../orm/entities/Note";
import Controller, { Verb } from "../Controller";
import authGate from "../middleware/gates/authGate";
import UnprocessableEntityError from "../../lib/errors/http/UnprocessableEntityError";
import Resource from "ts-japi/lib/models/resource.model";
import HttpStatus from "../../lib/errors/HttpStatus";
import NoteCreateAttributes from "../../lib/permitters/notes/NoteCreateAttributes";
import { validateNoteCreateData } from "../../lib/validators/validateNoteCreateData";
import deserializeNoteCreate from "../../lib/deserializers/notes/deserializeNoteCreate";
import buildNote from "../../lib/builders/notes/buildNote";
import UnauthorizedError from "../../lib/errors/http/UnauthorizedError";
import NoteUpdateAttributes from "../../lib/permitters/notes/NoteUpdateAttributes";
import { validateNoteUpdateData } from "../../lib/validators/validateNoteUpdateData";
import deserializeNoteUpdate from "../../lib/deserializers/notes/deserializeNoteUpdate";
import editNote from "../../lib/builders/notes/editNote";
import NotFoundError from "../../lib/errors/http/NotFoundError";

const notes = new Controller();
const noteRepository = appDataSource.getRepository(Note);

notes.on(Verb.GET, "/", [authGate], (req) => {
  const userId = req.jwtUserClaims?.id;
  // TODO: pagination
  return noteRepository.find({ where: { user: { id: userId } } });
});

notes.on(Verb.GET, "/:id", [authGate], (req) => {
  const { id } = req.params;
  const userId = req.jwtUserClaims?.id;
  if (!userId) throw new UnauthorizedError();

  return noteRepository.findOneOrFail({ where: { id, user: { id: userId } } });
});

notes.on(Verb.POST, "/", [authGate], (req, res) => {
  const data = req.body.data as Resource<NoteCreateAttributes>;
  if (!data || !data.attributes) throw new UnprocessableEntityError();

  const userId = req.jwtUserClaims!.id;
  if (!userId) throw new UnauthorizedError();

  validateNoteCreateData(data.attributes);

  const attrs = deserializeNoteCreate(data);

  return buildNote(attrs, userId)
    .then((note) => noteRepository.save(note))
    .then((note) => {
      res.status(HttpStatus.CREATED);
      return note;
    });
});

notes.on([Verb.PATCH, Verb.PUT], "/:id", [authGate], (req) => {
  const { id } = req.params;
  const data = req.body.data as Resource<NoteUpdateAttributes>;
  if (!data || !data.attributes) throw new UnprocessableEntityError();

  validateNoteUpdateData(data.attributes);

  const attrs = deserializeNoteUpdate(data);

  return noteRepository
    .findOneByOrFail({ id })
    .then((note) => editNote(note, attrs))
    .then((edits) => noteRepository.save(edits));
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
