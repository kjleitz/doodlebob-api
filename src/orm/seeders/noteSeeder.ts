import Role from "../../lib/auth/Role";
import buildNote from "../../lib/builders/notes/buildNote";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";
import { NoteCreateAttributes } from "../../server/schemata/jsonApiNotes";
import { UserAdminCreateAttributes } from "../../server/schemata/jsonApiUsers";
import Label from "../entities/Label";
import Note from "../entities/Note";
import User from "../entities/User";
import Seeder from "./Seeder";

const LABEL_SEEDS = [{ name: "Song" }]; // this is for the "...there's a place in france..." note

export const USER_NOTE_SEEDS: (UserAdminCreateAttributes & { notes: NoteCreateAttributes[] })[] = [
  {
    username: "note.admin",
    email: "note.admin@admin.com",
    role: Role.ADMIN,
    password: "p4ssw0rd",
    notes: [
      {
        title: "TODO",
        body: "- add mom as user\n- make new private doodlebob instance",
      },
    ],
  },
  {
    username: "note.peasant.1",
    email: "note.peasant.1@peasant.com",
    password: "p4ssw0rd",
    notes: [
      {
        body: "get gift for cat",
      },
      {
        title: "inspired story",
        body: "there once was a man from nantucket...",
      },
      {
        body: "cat obedience school",
      },
      {
        body: "clothes for cat",
      },
      {
        title: "genius piece I wrote last night",
        body: "there's a place in france where the naked ladies dance...",
        // labels: [{ name: "Song" }] // this is added in the seeder
      },
      {
        body: "feed cat",
      },
      {
        body: "cat translator",
      },
      {
        body: "cat name: dog (mom's idea)",
      },
      {
        title: "stuck in my head",
        body: "up your butt and around the corner...",
      },
      {
        body: "get vet for dog (cat)",
      },
    ],
  },
  {
    username: "note.peasant.2",
    email: "note.peasant.2@peasant.com",
    password: "p4ssw0rd",
    notes: [
      {
        body: "Remember to do that thing",
      },
      {
        title: "",
        body: "",
      },
      {
        title: "Birthday plans",
        body: "- sleep\n- play video games",
      },
    ],
  },
];

const noteSeeder: Seeder<Note[]> = (entityManager) => {
  const userRepository = entityManager.getRepository(User);
  const noteRepository = entityManager.getRepository(Note);
  const labelRepository = entityManager.getRepository(Label);

  const noteSaves = Promise.all(
    USER_NOTE_SEEDS.map((userSeed) =>
      buildUserAdmin(userSeed)
        .then((user) => userRepository.save(user))
        .then((user) => {
          const labelSaves = Promise.all(
            LABEL_SEEDS.map((labelAttrs) => labelRepository.save({ ...labelAttrs, user })),
          );

          return labelSaves.then((labels) => {
            const songLabel = labels.find(({ name }) => name === "Song");
            if (!songLabel) throw new Error("Where'd the song label go?");

            return Promise.all(
              userSeed.notes.map((noteSeed) =>
                buildNote(noteSeed, user.id).then((note) => {
                  if (note.body.match(/place in france/i)) note.labels = [songLabel];
                  return noteRepository.save(note);
                }),
              ),
            );
          });
        }),
    ),
  );

  return noteSaves.then((noteses) => noteses.flat());
};

export default noteSeeder;
