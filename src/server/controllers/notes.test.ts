import { expect } from "chai";
import "mocha";
import { agent } from "supertest";
import { app } from "../..";
import Role from "../../lib/auth/Role";
import HttpStatus from "../../lib/errors/HttpStatus";
import NoteSerializer, { NoteLabelsRelator } from "../../lib/serializers/NoteSerializer";
import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Note from "../../orm/entities/Note";
import User from "../../orm/entities/User";
import noteSeeder, { USER_NOTE_SEEDS } from "../../orm/seeders/noteSeeder";
import runSeeder from "../../orm/utils/runSeeder";
import truncateDatabase from "../../orm/utils/truncateDatabase";
import { signIn } from "../../testing/utils";
import { NoteCollectionDocument, NoteResourceDocument } from "../schemata/jsonApiNotes";

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
const labelRepository = appDataSource.getRepository(Label);

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

    it("paginates the list of your notes", () => {
      return getNotes().then((notes) => {
        const count = notes.length;
        expect(count).to.equal(MY_USER_NOTE_SEEDS.length);
        expect(count).to.be.greaterThan(4);
        const size = 2;
        const index = Math.ceil(count / size) - 1; // last page

        return signIn(MY_USER)
          .then(({ authed }) => authed.get("/notes").query({ page: { index, size } }).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            const document = response.body as NoteCollectionDocument;
            expect(document.data).to.be.an("array");
            expect(document.data.length).to.equal(2);
            expect(document.data[0].type).to.equal("notes");
            expect(document.data[0].attributes.title).to.be.a("string");
            expect(document.data[0].attributes.body).to.be.a("string");
            expect(document.links).not.to.be.undefined;
            expect(document.links!.first).to.be.a("string");
            expect(document.links!.last).to.be.a("string");
            expect(document.links!.prev).to.be.a("string");
            expect(document.links!.prev).to.match(new RegExp(`page\\[index\\]=${Math.max(index - 1, 0)}`));
            expect(document.links!.prev).to.match(/page\[size\]=2/);
            expect(document.links!.next).to.be.null;
          });
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

      return NoteSerializer.serialize(noteData)
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
        NoteSerializer.serialize(noteData)
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

    it("labels a new note simultaneously on create with some existing labels", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);

        return labelRepository.save(labels).then((savedLabels) => {
          // return labelRepository.save(labels).then((savedLabels) => {
          const noteData = {
            title: "foobar",
            body: "bazbam",
            labels: savedLabels,
          };

          return NoteSerializer.serialize(noteData, { relators: [NoteLabelsRelator] })
            .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.post("/notes").send(serialized)))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.CREATED);
              const document = response.body as NoteResourceDocument;
              expect(document.data.attributes.title).to.equal(noteData.title);
              expect(document.data.attributes.body).to.equal(noteData.body);
              expect(document.data.relationships).not.to.be.undefined;
              expect(document.data.relationships!.labels).not.to.be.undefined;
              expect(document.data.relationships!.labels!.data.length).to.equal(2);
              return noteRepository.findOneOrFail({ where: { id: document.data.id! }, relations: { labels: true } });
            })
            .then((note) => {
              expect(note.labels).not.to.be.undefined;
              expect(note.labels.length).to.equal(2);
              const noteLabelNames = note.labels.map(({ name }) => name).sort();
              const labelNames = labelsData.map(({ name }) => name).sort();
              expect(noteLabelNames).to.deep.equal(labelNames);
            });
        });
      });
    });

    it("does not create the note with labels from a different user", () => {
      dirty = true;

      return Promise.all([getUser(MY_USER), getUser(OTHER_USER)]).then(([myUser, otherUser]) => {
        const labelsData = [
          { name: "Foo", user: myUser },
          { name: "Bar", user: otherUser },
        ];
        const labels = labelRepository.create(labelsData);

        return labelRepository.save(labels).then((savedLabels) => {
          const noteData = {
            title: "foobar",
            body: "bazbam",
            labels: savedLabels.map(({ id }) => ({ id } as Label)),
          };

          return NoteSerializer.serialize(noteData, { relators: [NoteLabelsRelator] })
            .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.post("/notes").send(serialized)))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.CREATED);
              const document = response.body as NoteResourceDocument;
              expect(document.data.relationships).not.to.be.undefined;
              expect(document.data.relationships!.labels).not.to.be.undefined;
              expect(document.data.relationships!.labels!.data.length).to.equal(1);
              return noteRepository.findOneOrFail({ where: { id: document.data.id! }, relations: { labels: true } });
            })
            .then((note) => {
              expect(note.labels).not.to.be.undefined;
              expect(note.labels.length).to.equal(1);
              expect(note.labels[0].name).to.equal("Foo");
            });
        });
      });
    });

    it("does not allow one user to make a note for another user by including a userId field", () => {
      dirty = true;

      return getUser(OTHER_USER).then(({ id: otherUserId }) => {
        const noteData = {
          title: "foobar",
          body: "bazbam",
          userId: otherUserId,
        };

        return NoteSerializer.serialize(noteData).then((serialized) =>
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
          } as User,
        };

        return NoteSerializer.serialize(noteData).then((serialized) =>
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

        return NoteSerializer.serialize(noteData)
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

        return NoteSerializer.serialize(noteData)
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

        return NoteSerializer.serialize(noteData)
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

        return NoteSerializer.serialize(noteData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${id}`).send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.attributes.title).to.equal(title);
            expect(response.body.data.attributes.body).to.equal(noteData.body);
          });
      });
    });

    it("updates the note with labels", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            const { id, title, body } = note;

            const noteData = {
              labels: savedLabels,
            };

            return NoteSerializer.serialize(noteData, { relators: [NoteLabelsRelator] })
              .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${id}`).send(serialized)))
              .then((response) => {
                expect(response.status).to.equal(HttpStatus.OK);
                const document = response.body as NoteResourceDocument;
                expect(document.data.attributes.title).to.equal(title);
                expect(document.data.attributes.body).to.equal(body);
                expect(document.data.relationships).not.to.be.undefined;
                expect(document.data.relationships!.labels).not.to.be.undefined;
                expect(document.data.relationships!.labels!.data.length).to.equal(2);
                return noteRepository.findOneOrFail({ where: { id: document.data.id! }, relations: { labels: true } });
              })
              .then((note) => {
                expect(note.labels).not.to.be.undefined;
                expect(note.labels.length).to.equal(2);
                const noteLabelNames = note.labels.map(({ name }) => name).sort();
                const labelNames = labelsData.map(({ name }) => name).sort();
                expect(noteLabelNames).to.deep.equal(labelNames);
              });
          });
        });
      });
    });

    it("does not update the note with labels from a different user", () => {
      dirty = true;

      return Promise.all([getUser(MY_USER), getUser(OTHER_USER)]).then(([myUser, otherUser]) => {
        const labelsData = [
          { name: "Foo", user: myUser },
          { name: "Bar", user: otherUser },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            const noteData = {
              labels: savedLabels.map(({ id }) => ({ id } as Label)),
            };

            return NoteSerializer.serialize(noteData, { relators: [NoteLabelsRelator] })
              .then((serialized) =>
                signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
              )
              .then((response) => {
                expect(response.status).to.equal(HttpStatus.OK);
                const document = response.body as NoteResourceDocument;
                expect(document.data.relationships).not.to.be.undefined;
                expect(document.data.relationships!.labels).not.to.be.undefined;
                expect(document.data.relationships!.labels!.data.length).to.equal(1);
                return noteRepository.findOneOrFail({ where: { id: document.data.id! }, relations: { labels: true } });
              })
              .then((note) => {
                expect(note.labels).not.to.be.undefined;
                expect(note.labels.length).to.equal(1);
                expect(note.labels[0].name).to.equal("Foo");
              });
          });
        });
      });
    });

    it("overwrites the note's labels", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
          { name: "Baz", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels.slice(0, 2);

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const newLabelsNoteData = {
                labels: savedLabels.slice(2),
              };

              expect(newLabelsNoteData.labels.length).to.equal(1);

              return NoteSerializer.serialize(newLabelsNoteData, { relators: [NoteLabelsRelator] })
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.OK);
                  const document = response.body as NoteResourceDocument;
                  expect(document.data.relationships).not.to.be.undefined;
                  expect(document.data.relationships!.labels).not.to.be.undefined;
                  expect(document.data.relationships!.labels!.data.length).to.equal(1);
                  return noteRepository.findOneOrFail({
                    where: { id: document.data.id! },
                    relations: { labels: true },
                  });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(1);
                  const noteLabelNames = foundNote.labels.map(({ name }) => name).sort();
                  const labelNames = newLabelsNoteData.labels.map(({ name }) => name).sort();
                  expect(noteLabelNames).to.deep.equal(labelNames);
                });
            });
          });
        });
      });
    });

    it("does NOT overwrite the note's labels if none were included, even if the relator IS attached to the serializer", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels;

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const noteDataForUpdate = {
                title: note.title + " ...and I still have my labels!",
              };

              return NoteSerializer.serialize(noteDataForUpdate, { relators: [NoteLabelsRelator] })
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.OK);
                  const document = response.body as NoteResourceDocument;
                  expect(document.data.relationships).not.to.be.undefined;
                  expect(document.data.relationships!.labels).not.to.be.undefined;
                  expect(document.data.relationships!.labels!.data.length).to.equal(2);
                  return noteRepository.findOneOrFail({
                    where: { id: document.data.id! },
                    relations: { labels: true },
                  });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(2);
                  const noteLabelNames = foundNote.labels.map(({ name }) => name).sort();
                  const labelNames = labelsData.map(({ name }) => name).sort();
                  expect(noteLabelNames).to.deep.equal(labelNames);
                });
            });
          });
        });
      });
    });

    it("does NOT overwrite the note's labels if none were included, especially if the relator is NOT attached to the serializer", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels;

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const noteDataForUpdate = {
                title: note.title + " ...and I still have my labels!",
              };

              return NoteSerializer.serialize(noteDataForUpdate)
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.OK);
                  const document = response.body as NoteResourceDocument;
                  expect(document.data.relationships).not.to.be.undefined;
                  expect(document.data.relationships!.labels).not.to.be.undefined;
                  expect(document.data.relationships!.labels!.data.length).to.equal(2);
                  return noteRepository.findOneOrFail({
                    where: { id: document.data.id! },
                    relations: { labels: true },
                  });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(2);
                  const noteLabelNames = foundNote.labels.map(({ name }) => name).sort();
                  const labelNames = labelsData.map(({ name }) => name).sort();
                  expect(noteLabelNames).to.deep.equal(labelNames);
                });
            });
          });
        });
      });
    });

    it("does NOT overwrite the note's labels if they were included as `null`, even if the relator IS attached to the serializer", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels;

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const noteDataForUpdate = {
                title: note.title + " ...and I still have my labels!",
                labels: null as unknown as any[],
              };

              return NoteSerializer.serialize(noteDataForUpdate, { relators: [NoteLabelsRelator] })
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.UNPROCESSABLE_ENTITY);
                  return noteRepository.findOneOrFail({ where: { id: savedNote.id }, relations: { labels: true } });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(2);
                  const noteLabelNames = foundNote.labels.map(({ name }) => name).sort();
                  const labelNames = labelsData.map(({ name }) => name).sort();
                  expect(noteLabelNames).to.deep.equal(labelNames);
                });
            });
          });
        });
      });
    });

    it("does NOT overwrite the note's labels if they were included as `null`, especially if the relator is NOT attached to the serializer", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels;

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const noteDataForUpdate = {
                title: note.title + " ...and I still have my labels!",
                labels: null as unknown as any[],
              };

              return NoteSerializer.serialize(noteDataForUpdate)
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.OK);
                  const document = response.body as NoteResourceDocument;
                  expect(document.data.relationships).not.to.be.undefined;
                  expect(document.data.relationships!.labels).not.to.be.undefined;
                  expect(document.data.relationships!.labels!.data.length).to.equal(2);
                  return noteRepository.findOneOrFail({
                    where: { id: document.data.id! },
                    relations: { labels: true },
                  });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(2);
                  const noteLabelNames = foundNote.labels.map(({ name }) => name).sort();
                  const labelNames = labelsData.map(({ name }) => name).sort();
                  expect(noteLabelNames).to.deep.equal(labelNames);
                });
            });
          });
        });
      });
    });

    it("does NOT overwrite the note's labels if an empty array is included, if the relator is NOT attached to the serializer", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels;

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const noteDataForUpdate = {
                title: note.title + " ...and I still have my labels!",
                labels: [],
              };

              return NoteSerializer.serialize(noteDataForUpdate)
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.OK);
                  const document = response.body as NoteResourceDocument;
                  expect(document.data.relationships).not.to.be.undefined;
                  expect(document.data.relationships!.labels).not.to.be.undefined;
                  expect(document.data.relationships!.labels!.data.length).to.equal(2);
                  return noteRepository.findOneOrFail({
                    where: { id: document.data.id! },
                    relations: { labels: true },
                  });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(2);
                  const noteLabelNames = foundNote.labels.map(({ name }) => name).sort();
                  const labelNames = labelsData.map(({ name }) => name).sort();
                  expect(noteLabelNames).to.deep.equal(labelNames);
                });
            });
          });
        });
      });
    });

    it("DOES overwrite the note's labels if an empty array is included, if the relator IS attached to the serializer", () => {
      dirty = true;

      return getUser(MY_USER).then((user) => {
        const labelsData = [
          { name: "Foo", user },
          { name: "Bar", user },
        ];
        const labels = labelRepository.create(labelsData);
        return labelRepository.save(labels).then((savedLabels) => {
          return getNotes(MY_USER).then(([note]) => {
            note.labels = savedLabels;

            return noteRepository.save(note).then((savedNote) => {
              expect(savedNote.labels.length).to.equal(2);

              const noteDataForUpdate = {
                title: note.title + " ...and I still have my labels!",
                labels: [],
              };

              return NoteSerializer.serialize(noteDataForUpdate, { relators: [NoteLabelsRelator] })
                .then((serialized) =>
                  signIn(MY_USER).then(({ authed }) => authed.patch(`/notes/${note.id}`).send(serialized)),
                )
                .then((response) => {
                  expect(response.status).to.equal(HttpStatus.OK);
                  const document = response.body as NoteResourceDocument;
                  expect(document.data.relationships).not.to.be.undefined;
                  expect(document.data.relationships!.labels).not.to.be.undefined;
                  expect(document.data.relationships!.labels!.data.length).to.equal(0);
                  return noteRepository.findOneOrFail({
                    where: { id: document.data.id! },
                    relations: { labels: true },
                  });
                })
                .then((foundNote) => {
                  expect(foundNote.labels).not.to.be.undefined;
                  expect(foundNote.labels.length).to.equal(0);
                });
            });
          });
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

        return NoteSerializer.serialize(noteData)
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
