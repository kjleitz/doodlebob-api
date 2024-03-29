import { expect } from "chai";
import "mocha";
import { agent } from "supertest";
import { app } from "../..";
import Role from "../../lib/auth/Role";
import HttpStatus from "../../lib/errors/HttpStatus";
import LabelSerializer from "../../lib/serializers/LabelSerializer";
import { uniq } from "../../lib/utils/arrays";
import { isNullish } from "../../lib/utils/checks";
import appDataSource from "../../orm/config/appDataSource";
import Label from "../../orm/entities/Label";
import Note from "../../orm/entities/Note";
import User from "../../orm/entities/User";
import labelSeeder, { USER_LABELED_NOTE_SEEDS } from "../../orm/seeders/labelSeeder";
import runSeeder from "../../orm/utils/runSeeder";
import truncateDatabase from "../../orm/utils/truncateDatabase";
import { signIn } from "../../testing/utils";
import { NoteCollectionDocument } from "../schemata/jsonApiNotes";
import { LabelCollectionDocument } from "../schemata/jsonApiLabels";

const MY_USER_SEED = USER_LABELED_NOTE_SEEDS.find(
  (seed) =>
    (isNullish(seed.role) || seed.role === Role.PEASANT) &&
    seed.username &&
    seed.notes.length &&
    seed.notes.some(({ labels }) => labels.length),
);
if (!MY_USER_SEED)
  throw new Error(
    "Label seeds should have a peasant user with a non-empty username and notes where some notes have labels.",
  );

const MY_USER = MY_USER_SEED.username!;
const MY_USER_NOTE_LABEL_SEEDS = uniq(
  MY_USER_SEED.notes.flatMap(({ labels }) => labels.map((name) => ({ name }))),
  ({ name }) => name,
);

const OTHER_USER_SEED = USER_LABELED_NOTE_SEEDS.find(
  (seed) =>
    (isNullish(seed.role) || seed.role === Role.PEASANT) &&
    seed.username &&
    seed.username !== MY_USER &&
    seed.notes.length &&
    seed.notes.some(({ labels }) => labels.length),
);
if (!OTHER_USER_SEED)
  throw new Error(
    "Label seeds should have a second (different) peasant user with a non-empty username and notes where some notes have labels.",
  );

const OTHER_USER = OTHER_USER_SEED.username!;
const OTHER_USER_NOTE_LABEL_SEEDS = uniq(
  OTHER_USER_SEED.notes.flatMap(({ labels }) => labels.map((name) => ({ name }))),
  ({ name }) => name,
);

const ADMIN_USER_SEED = USER_LABELED_NOTE_SEEDS.find(
  (seed) =>
    seed.role === Role.ADMIN && seed.username && seed.notes.length && seed.notes.some(({ labels }) => labels.length),
);
if (!ADMIN_USER_SEED)
  throw new Error(
    "Label seeds should have an admin user with a non-empty username and notes where some notes have labels.",
  );

const ADMIN_USER = ADMIN_USER_SEED.username!;
const ADMIN_USER_NOTE_LABEL_SEEDS = uniq(
  ADMIN_USER_SEED.notes.flatMap(({ labels }) => labels.map((name) => ({ name }))),
  ({ name }) => name,
);

const userRepository = appDataSource.getRepository(User);
const labelRepository = appDataSource.getRepository(Label);
const noteRepository = appDataSource.getRepository(Note);

const getUser = (username = MY_USER): Promise<User> => {
  return userRepository.findOneByOrFail({ username });
};

const getLabels = (username = MY_USER): Promise<Label[]> => {
  return labelRepository.findBy({ user: { username } });
};

describe("Labels controller", () => {
  let dirty = false;

  before(() => {
    return appDataSource
      .initialize()
      .then(() => truncateDatabase())
      .then(() => runSeeder(labelSeeder));
  });

  after(() => {
    return appDataSource.destroy();
  });

  afterEach(() => {
    if (dirty)
      return truncateDatabase()
        .then(() => runSeeder(labelSeeder))
        .then(() => {
          dirty = false;
        });
  });

  describe("getLabels test helper", () => {
    it("returns a list of the given user's labels", () => {
      expect(MY_USER_NOTE_LABEL_SEEDS).not.to.be.empty;
      expect(OTHER_USER_NOTE_LABEL_SEEDS).not.to.be.empty;
      expect(ADMIN_USER_NOTE_LABEL_SEEDS).not.to.be.empty;

      return getLabels()
        .then((labels) => expect(labels.length).to.equal(MY_USER_NOTE_LABEL_SEEDS.length))
        .then(() => getLabels(MY_USER))
        .then((labels) => expect(labels.length).to.equal(MY_USER_NOTE_LABEL_SEEDS.length))
        .then(() => getLabels(OTHER_USER))
        .then((labels) => expect(labels.length).to.equal(OTHER_USER_NOTE_LABEL_SEEDS.length))
        .then(() => getLabels(ADMIN_USER))
        .then((labels) => expect(labels.length).to.equal(ADMIN_USER_NOTE_LABEL_SEEDS.length));
    });
  });

  describe("Index", () => {
    it("requires auth", () => {
      return agent(app).get("/labels").send().expect(HttpStatus.UNAUTHORIZED);
    });

    it("returns a list of your labels", () => {
      return signIn(MY_USER)
        .then(({ authed }) => authed.get("/labels").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data).to.be.an("array");
          expect(response.body.data.length).to.equal(MY_USER_NOTE_LABEL_SEEDS.length);
        });
    });

    it("sorts the returned labels by name by default", () => {
      return signIn(MY_USER)
        .then(({ authed }) => authed.get("/labels").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          const document = response.body as LabelCollectionDocument;
          expect(document.data).to.be.an("array");
          expect(document.data.length).to.equal(MY_USER_NOTE_LABEL_SEEDS.length);
          expect(document.data.length).to.be.greaterThan(5);
          let prevName = document.data[0].attributes.name;
          for (let i = 1; i < document.data.length; i++) {
            const { name } = document.data[i].attributes;
            expect([prevName, name].sort()).to.deep.equal([prevName, name]);
            prevName = name;
          }
        });
    });

    it("sorts the returned labels by given preference", () => {
      return signIn(MY_USER)
        .then(({ authed }) => authed.get("/labels?sort=-name").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          const document = response.body as LabelCollectionDocument;
          expect(document.data).to.be.an("array");
          expect(document.data.length).to.equal(MY_USER_NOTE_LABEL_SEEDS.length);
          expect(document.data.length).to.be.greaterThan(5);
          let prevName = document.data[0].attributes.name;
          for (let i = 1; i < document.data.length; i++) {
            const { name } = document.data[i].attributes;
            expect([prevName, name].sort()).to.deep.equal([name, prevName]);
            prevName = name;
          }
        });
    });
  });

  describe("Show", () => {
    it("requires auth", () => {
      return getLabels().then(([{ id }]) => agent(app).get(`/labels/${id}`).send().expect(HttpStatus.UNAUTHORIZED));
    });

    it("requires you to own the label", () => {
      return getLabels(OTHER_USER).then(([{ id }]) =>
        signIn(MY_USER)
          .then(({ authed }) => authed.get(`/labels/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.NOT_FOUND);
          }),
      );
    });

    it("returns the label info", () => {
      return getLabels(MY_USER).then(([{ id, name }]) =>
        signIn(MY_USER)
          .then(({ authed }) => authed.get(`/labels/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.type).to.equal("labels");
            expect(response.body.data.attributes.name).to.equal(name);
          }),
      );
    });

    describe("Nested notes", () => {
      it("requires auth", () => {
        return getLabels().then(([{ id }]) =>
          agent(app).get(`/labels/${id}/notes`).send().expect(HttpStatus.UNAUTHORIZED),
        );
      });

      it("requires you to own the label", () => {
        return getLabels(OTHER_USER).then(([{ id }]) =>
          signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            }),
        );
      });

      it("returns the notes under that label", () => {
        return getLabels(MY_USER).then(([{ id }]) =>
          signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              expect(response.body.data).to.be.an("array");
              expect(response.body.data.length).not.to.equal(0);
              expect(response.body.data[0].type).to.equal("notes");
              expect(response.body.data[0].attributes.title).to.be.a("string");
              expect(response.body.data[0].attributes.body).to.be.a("string");
            }),
        );
      });

      it("searches the notes under that label if a query is supplied", () => {
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "Song");
          expect(label).not.to.be.undefined;
          const id = label!.id;

          return signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes?filter[q]=dancing%20places%20-cat`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              const document = response.body as NoteCollectionDocument;
              expect(document.data).to.be.an("array");
              expect(document.data.length).to.equal(1);
              expect(document.data[0].attributes.title).to.match(/genius piece I wrote/i);
              expect(document.data[0].attributes.body).to.match(/there's a place in france/i);
              expect(document.data[0].attributes.body).not.to.match(/cat/i);
            });
        });
      });

      it("excludes notes with terms preceded by the minus operator from the search of your notes under that label", () => {
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "Cat");
          expect(label).not.to.be.undefined;
          const id = label!.id;

          return signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes?filter[q]=-dog`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              const document = response.body as NoteCollectionDocument;
              expect(document.data).to.be.an("array");
              expect(document.data.length).not.to.equal(0);
              for (let item of document.data) {
                expect(item.attributes.title).not.to.match(/dog/i);
                expect(item.attributes.body).not.to.match(/dog/i);
              }
            });
        });
      });

      it("incorporates label text when searching your notes under that label", () => {
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "Song");
          expect(label).not.to.be.undefined;
          const id = label!.id;

          return signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes?filter[q]=music`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              const document = response.body as NoteCollectionDocument;
              expect(document.data).to.be.an("array");
              expect(document.data.length).not.to.equal(0);

              const placeInFranceNote = document.data.find((item) => item.attributes.body.match(/place in france/i));
              expect(placeInFranceNote).not.to.be.undefined;
              expect(placeInFranceNote!.attributes.title).not.to.match(/music/i);
              expect(placeInFranceNote!.attributes.body).not.to.match(/music/i);
            });
        });
      });

      it("excludes notes not under that label when searching your notes under that label", () => {
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "Song");
          expect(label).not.to.be.undefined;
          const id = label!.id;

          return signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes?filter[q]=cat`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              const document = response.body as NoteCollectionDocument;
              expect(document.data).to.be.an("array");
              expect(document.data.length).to.equal(0);
            });
        });
      });

      it("does not return notes of other users who have matching label names when searching your notes under that label", () => {
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "TODO");
          expect(label).not.to.be.undefined;
          const id = label!.id;

          return signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes?filter[q]=mom`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              const document = response.body as NoteCollectionDocument;
              expect(document.data).to.be.an("array");
              expect(document.data.length).not.to.equal(0);
              for (let item of document.data) {
                expect(item.attributes.title).not.to.match(/private doodlebob instance/i);
                expect(item.attributes.body).not.to.match(/private doodlebob instance/i);
              }
            });
        });
      });

      it("returns sorted notes under that label according to sort options", () => {
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "Cat");
          expect(label).not.to.be.undefined;
          const id = label!.id;

          return signIn(MY_USER)
            .then(({ authed }) => authed.get(`/labels/${id}/notes?sort=-title`).send())
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              const document = response.body as NoteCollectionDocument;
              expect(document.data).to.be.an("array");
              expect(document.data[0].type).to.equal("notes");
              expect(document.data[0].attributes.title).to.be.a("string");
              expect(document.data[0].attributes.body).to.be.a("string");
              expect(document.data.length).to.be.greaterThan(5);
              let prevTitle = document.data[0].attributes.title;
              for (let i = 1; i < document.data.length; i++) {
                const { title } = document.data[i].attributes;
                expect([prevTitle, title].sort()).to.deep.equal([title, prevTitle]);
                prevTitle = title;
              }
            });
        });
      });

      it("paginates the notes under that label", () => {
        expect(MY_USER).to.equal("label.peasant.1");
        return getLabels(MY_USER).then((labels) => {
          const label = labels.find(({ name }) => name === "Cat");
          expect(label).not.to.be.undefined;
          const { id } = label!;

          return noteRepository.count({ where: { labels: { id } } }).then((count) => {
            expect(count).to.be.greaterThan(2);

            return signIn(MY_USER)
              .then(({ authed }) =>
                authed
                  .get(`/labels/${id}/notes`)
                  .query({ page: { index: 0, size: 2 } })
                  .send(),
              )
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
                expect(document.links!.prev).to.be.null;
                expect(document.links!.next).to.be.a("string");
                expect(document.links!.next).to.match(/page\[index\]=1/);
                expect(document.links!.next).to.match(/page\[size\]=2/);
              });
          });
        });
      });
    });
  });

  describe("Create", () => {
    it("requires auth", () => {
      dirty = true;

      const labelData: { name: string } = {
        name: "Foobar",
      };

      return LabelSerializer.serialize(labelData)
        .then((serialized) => agent(app).post("/labels").send(serialized))
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
        });
    });

    it("creates a new label", () => {
      dirty = true;

      const labelData: { name: string } = {
        name: "Foobar",
      };

      return labelRepository.count().then((originalCount) =>
        LabelSerializer.serialize(labelData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.post("/labels").send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.CREATED);
            expect(response.body.data.attributes.name).to.equal(labelData.name);
            return labelRepository.count();
          })
          .then((finalCount) => {
            expect(finalCount).to.equal(originalCount + 1);
          }),
      );
    });

    it("does not allow one user to make a label for another user by including a userId field", () => {
      dirty = true;

      return getUser(OTHER_USER).then(({ id: otherUserId }) => {
        const labelData: { name: string; userId: string } = {
          name: "Foobar",
          userId: otherUserId,
        };

        return LabelSerializer.serialize(labelData).then((serialized) =>
          signIn(MY_USER).then(({ authed, id: myUserId }) =>
            authed
              .post("/labels")
              .send(serialized)
              .then((response) => {
                expect(response.status).to.equal(HttpStatus.CREATED);
                const labelId = parseInt(response.body.data.id as string, 10);

                return labelRepository
                  .findOneBy({ id: labelId, user: { id: otherUserId } })
                  .then((label) => expect(label).to.be.null)
                  .then(() => labelRepository.findOneBy({ id: labelId, user: { id: myUserId } }))
                  .then((label) => expect(label).not.to.be.null);
              }),
          ),
        );
      });
    });

    it("does not allow one user to make a label for another user by including a nested user.id field", () => {
      dirty = true;

      return getUser(OTHER_USER).then(({ id: otherUserId }) => {
        const labelData: Partial<Label> = {
          name: "Foobar",
          user: {
            id: otherUserId,
          } as User,
        };

        return LabelSerializer.serialize(labelData).then((serialized) =>
          signIn(MY_USER).then(({ authed, id: myUserId }) =>
            authed
              .post("/labels")
              .send(serialized)
              .then((response) => {
                expect(response.status).to.equal(HttpStatus.CREATED);
                const labelId = parseInt(response.body.data.id as string, 10);

                return labelRepository
                  .findOneBy({ id: labelId, user: { id: otherUserId } })
                  .then((label) => expect(label).to.be.null)
                  .then(() => labelRepository.findOneBy({ id: labelId, user: { id: myUserId } }))
                  .then((label) => expect(label).not.to.be.null);
              }),
          ),
        );
      });
    });
  });

  describe("Update", () => {
    it("requires auth", () => {
      dirty = true;

      getLabels(MY_USER).then(([label]) => {
        const { id, name } = label;

        const labelData: { name: string } = {
          name: name + " (old)",
        };

        return LabelSerializer.serialize(labelData)
          .then((serialized) => agent(app).patch(`/labels/${id}`).send(serialized))
          .then((response) => expect(response.status).to.equal(HttpStatus.UNAUTHORIZED))
          .then(() => labelRepository.findOneBy({ id }))
          .then((label) => {
            expect(label?.name).not.to.be.undefined;
            expect(label?.name).to.equal(name);
            expect(label?.name).not.to.equal(labelData.name);
          });
      });
    });

    it("requires you to own the label", () => {
      dirty = true;

      getLabels(MY_USER).then(([label]) => {
        const { id, name } = label;

        const labelData: { name: string } = {
          name: name + " (old)",
        };

        return LabelSerializer.serialize(labelData)
          .then((serialized) => signIn(OTHER_USER).then(({ authed }) => authed.patch(`/labels/${id}`).send(serialized)))
          .then((response) => expect(response.status).to.equal(HttpStatus.NOT_FOUND))
          .then(() => labelRepository.findOneBy({ id }))
          .then((label) => {
            expect(label?.name).not.to.be.undefined;
            expect(label?.name).to.equal(name);
            expect(label?.name).not.to.equal(labelData.name);
          });
      });
    });

    it("updates the label with a new name", () => {
      dirty = true;

      return getLabels(MY_USER).then(([label]) => {
        const { id, name } = label;

        const labelData: { name: string } = {
          name: name + "old",
        };

        return LabelSerializer.serialize(labelData)
          .then((serialized) => signIn(MY_USER).then(({ authed }) => authed.patch(`/labels/${id}`).send(serialized)))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.attributes.name).to.equal(labelData.name);
          });
      });
    });
  });

  describe("Destroy", () => {
    it("requires auth", () => {
      dirty = true;

      return getLabels(MY_USER).then(([label]) =>
        agent(app)
          .delete(`/labels/${label.id}`)
          .send()
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
          }),
      );
    });

    it("requires you to own the label", () => {
      dirty = true;

      return labelRepository.count().then((originalCount) =>
        getLabels(MY_USER).then(([label]) =>
          signIn(OTHER_USER)
            .then(({ authed }) => authed.delete(`/labels/${label.id}`).send().expect(HttpStatus.NOT_FOUND))
            .then(() => labelRepository.count())
            .then((finalCount) => expect(finalCount).to.equal(originalCount)),
        ),
      );
    });

    it("deletes the label", () => {
      dirty = true;

      return labelRepository.count().then((originalCount) =>
        getLabels(MY_USER).then(([label]) =>
          signIn(MY_USER).then(({ authed }) =>
            authed
              .delete(`/labels/${label.id}`)
              .send()
              .expect(HttpStatus.OK)
              .then(() => labelRepository.count())
              .then((finalCount) => expect(finalCount).to.equal(originalCount - 1)),
          ),
        ),
      );
    });
  });
});
