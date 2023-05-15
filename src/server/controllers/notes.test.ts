import "mocha";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Note from "../../orm/entities/Note";
import noteSeeder, { USER_NOTE_SEEDS } from "../../orm/seeders/noteSeeder";
import Role from "../../lib/auth/Role";
import truncateDatabase from "../../orm/utils/truncateDatabase";
import runSeeder from "../../orm/utils/runSeeder";
import { agent } from "supertest";
import { app } from "../..";
import HttpStatus from "../../lib/errors/HttpStatus";
import { signIn } from "../../testing/utils";
import { expect } from "chai";
import DataSerializer from "../../lib/serializers/DataSerializer";

const MY_USER_SEED = USER_NOTE_SEEDS.find(
  (seed) => (!seed.role || seed.role === Role.PEASANT) && seed.username && seed.notes.length,
);
if (!MY_USER_SEED) throw new Error("User note seeds should have a peasant user with a non-empty username and notes.");

const MY_USER = MY_USER_SEED.username!;
const MY_USER_NOTE_SEEDS = MY_USER_SEED.notes;

const OTHER_USER_SEED = USER_NOTE_SEEDS.find(
  (seed) =>
    (!seed.role || seed.role === Role.PEASANT) && seed.username && seed.username !== MY_USER && seed.notes.length,
);
if (!OTHER_USER_SEED)
  throw new Error("User note seeds should have a second (different) peasant user with a non-empty username and notes.");

const OTHER_USER = OTHER_USER_SEED.username!;
const OTHER_USER_NOTE_SEEDS = OTHER_USER_SEED.notes;

const ADMIN_USER_SEED = USER_NOTE_SEEDS.find((seed) => seed.role === Role.ADMIN && seed.username && seed.notes.length);
if (!ADMIN_USER_SEED) throw new Error("User note seeds should have an admin user with a non-empty username and notes.");

const ADMIN_USER = ADMIN_USER_SEED.username!;
const ADMIN_USER_NOTE_SEEDS = ADMIN_USER_SEED.notes;

const userRepository = appDataSource.getRepository(User);
const noteRepository = appDataSource.getRepository(Note);

const getUser = (username = MY_USER): Promise<User> => {
  return userRepository.findOneByOrFail({ username });
};

const getNotes = (username = MY_USER): Promise<Note[]> => {
  return noteRepository.findBy({ user: { username } });
};

describe("Notes controller", () => {
  let dirty = false;

  before(() => {
    return appDataSource
      .initialize()
      .then(() => truncateDatabase())
      .then(() => runSeeder(noteSeeder));
  });

  after(() => {
    return appDataSource.destroy();
  });

  afterEach(() => {
    if (dirty)
      return truncateDatabase()
        .then(() => runSeeder(noteSeeder))
        .then(() => {
          dirty = false;
        });
  });

  describe("getNotes test helper", () => {
    it("returns a list of the given user's notes", () => {
      expect(MY_USER_NOTE_SEEDS).not.to.be.empty;
      expect(OTHER_USER_NOTE_SEEDS).not.to.be.empty;
      expect(ADMIN_USER_NOTE_SEEDS).not.to.be.empty;

      return getNotes()
        .then((notes) => expect(notes.length).to.equal(MY_USER_NOTE_SEEDS.length))
        .then(() => getNotes(MY_USER))
        .then((notes) => expect(notes.length).to.equal(MY_USER_NOTE_SEEDS.length))
        .then(() => getNotes(OTHER_USER))
        .then((notes) => expect(notes.length).to.equal(OTHER_USER_NOTE_SEEDS.length))
        .then(() => getNotes(ADMIN_USER))
        .then((notes) => expect(notes.length).to.equal(ADMIN_USER_NOTE_SEEDS.length));
    });
  });

  describe("Index", () => {
    it("requires auth", () => {
      return agent(app).get("/notes").send().expect(HttpStatus.UNAUTHORIZED);
    });

    it("returns a list of your notes", () => {
      return signIn(MY_USER)
        .then(({ authed }) => authed.get("/notes").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data).to.be.an("array");
          expect(response.body.data.length).to.equal(MY_USER_NOTE_SEEDS.length);
        });
    });
  });

  describe("Show", () => {
    it("requires auth", () => {
      return getNotes().then(([{ id }]) => agent(app).get(`/notes/${id}`).send().expect(HttpStatus.UNAUTHORIZED));
    });

    it("requires you to own the note", () => {
      return getNotes(OTHER_USER).then(([{ id }]) =>
        signIn(MY_USER)
          .then(({ authed }) => authed.get(`/notes/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.NOT_FOUND);
          }),
      );
    });

    it("returns the note info", () => {
      return getNotes(MY_USER).then(([{ id }]) =>
        signIn(MY_USER)
          .then(({ authed }) => authed.get(`/notes/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.type).to.equal("notes");
            expect(response.body.data.attributes.title).to.equal(MY_USER_NOTE_SEEDS[0].title ?? "");
            expect(response.body.data.attributes.body).to.equal(MY_USER_NOTE_SEEDS[0].body ?? "");
          }),
      );
    });
  });

  describe("Create", () => {
    it("requires auth", () => {
      dirty = true;

      const noteData = {
        title: "foobar",
        body: "bazbam",
      };

      return DataSerializer.serialize(noteData)
        .then((serialized) => agent(app).post("/notes").send(serialized))
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
        });
    });

    it("creates a new note", () => {
      dirty = true;

      const noteData = {
        title: "foobar",
        body: "bazbam",
      };

      return noteRepository.count().then((originalCount) =>
        DataSerializer.serialize(noteData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.post("/notes").send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.CREATED);
            expect(response.body.data.attributes.title).to.equal(noteData.title);
            expect(response.body.data.attributes.body).to.equal(noteData.body);
            return noteRepository.count();
          })
          .then((finalCount) => {
            expect(finalCount).to.equal(originalCount + 1);
          }),
      );
    });

    it("does not allow one user to make a note for another user by including a userId field", () => {
      dirty = true;

      return getUser(OTHER_USER).then(({ id: otherUserId }) => {
        const noteData = {
          title: "foobar",
          body: "bazbam",
          userId: otherUserId,
        };

        return DataSerializer.serialize(noteData).then((serialized) =>
          signIn(MY_USER).then(({ authed, id: myUserId }) =>
            authed
              .post("/notes")
              .send(serialized)
              .then((response) => {
                expect(response.status).to.equal(HttpStatus.CREATED);
                const noteId = response.body.data.id as string;

                return noteRepository
                  .findOneBy({ id: noteId, user: { id: otherUserId } })
                  .then((note) => expect(note).to.be.null)
                  .then(() => noteRepository.findOneBy({ id: noteId, user: { id: myUserId } }))
                  .then((note) => expect(note).not.to.be.null);
              }),
          ),
        );
      });
    });

    it("does not allow one user to make a note for another user by including a nested user.id field", () => {
      dirty = true;

      return getUser(OTHER_USER).then(({ id: otherUserId }) => {
        const noteData = {
          title: "foobar",
          body: "bazbam",
          user: {
            id: otherUserId,
          },
        };

        return DataSerializer.serialize(noteData).then((serialized) =>
          signIn(MY_USER).then(({ authed, id: myUserId }) =>
            authed
              .post("/notes")
              .send(serialized)
              .then((response) => {
                expect(response.status).to.equal(HttpStatus.CREATED);
                const noteId = response.body.data.id as string;

                return noteRepository
                  .findOneBy({ id: noteId, user: { id: otherUserId } })
                  .then((note) => expect(note).to.be.null)
                  .then(() => noteRepository.findOneBy({ id: noteId, user: { id: myUserId } }))
                  .then((note) => expect(note).not.to.be.null);
              }),
          ),
        );
      });
    });
  });

  describe("Update", () => {
    it("requires auth", () => {
      dirty = true;

      getNotes(MY_USER).then(([note]) => {
        const { id, title, body } = note;

        const noteData = {
          title: title + " (old)",
          body: body + " oh yeah one more thing",
        };

        return DataSerializer.serialize(noteData)
          .then((serialized) => agent(app).patch(`/notes/${id}`).send(serialized))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
          });
      });
    });

    it("requires you to own the note", () => {
      dirty = true;

      getNotes(MY_USER).then(([note]) => {
        const { id, title, body } = note;

        const noteData = {
          title: title + " (old)",
          body: body + " oh yeah one more thing",
        };

        return DataSerializer.serialize(noteData)
          .then((serialized) => signIn(OTHER_USER).then(({ authed }) => authed.patch(`/notes/${id}`).send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.NOT_FOUND);
          });
      });
    });

    it("updates the note with a new title", () => {
      dirty = true;

      return getNotes(MY_USER).then(([note]) => {
        const { id, title, body } = note;

        const noteData = {
          title: title + " (old)",
        };

        return DataSerializer.serialize(noteData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${id}`).send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.attributes.title).to.equal(noteData.title);
            expect(response.body.data.attributes.body).to.equal(body);
          });
      });
    });

    it("updates the note with a new body", () => {
      dirty = true;

      return getNotes(MY_USER).then(([note]) => {
        const { id, title, body } = note;

        const noteData = {
          body: body + " oh yeah one more thing",
        };

        return DataSerializer.serialize(noteData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${id}`).send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.attributes.title).to.equal(title);
            expect(response.body.data.attributes.body).to.equal(noteData.body);
          });
      });
    });

    it("updates the note with a new title and body", () => {
      dirty = true;

      return getNotes(MY_USER).then(([note]) => {
        const { id, title, body } = note;

        const noteData = {
          title: title + " (old)",
          body: body + " oh yeah one more thing",
        };

        return DataSerializer.serialize(noteData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${id}`).send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.attributes.title).to.equal(noteData.title);
            expect(response.body.data.attributes.body).to.equal(noteData.body);
          });
      });
    });
  });

  describe("Destroy", () => {
    it("requires auth", () => {
      dirty = true;

      return getNotes(MY_USER).then(([note]) =>
        agent(app)
          .delete(`/notes/${note.id}`)
          .send()
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
          }),
      );
    });

    it("requires you to own the note", () => {
      dirty = true;

      return getNotes(MY_USER).then(([note]) =>
        signIn(OTHER_USER).then(({ authed }) =>
          authed
            .delete(`/notes/${note.id}`)
            .send()
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            }),
        ),
      );
    });

    it("deletes the note", () => {
      dirty = true;

      return noteRepository.count().then((originalCount) =>
        getNotes(MY_USER).then(([note]) =>
          signIn(MY_USER).then(({ authed }) =>
            authed
              .delete(`/notes/${note.id}`)
              .send()
              .expect(HttpStatus.OK)
              .then(() => noteRepository.count())
              .then((finalCount) => expect(finalCount).to.equal(originalCount - 1)),
          ),
        ),
      );
    });
  });
});
