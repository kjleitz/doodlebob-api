import Role from "../../lib/auth/Role";
import buildNote from "../../lib/builders/notes/buildNote";
import NoteCreateAttributes from "../../lib/permitters/notes/NoteCreateAttributes";
import UserAdminCreateAttributes from "../../lib/permitters/users/UserAdminCreateAttributes";
import Seeder from "./Seeder";
import User from "../entities/User";
import Note from "../entities/Note";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";

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
        title: "genius song I wrote last night",
        body: "there's a place in france where the naked ladies dance...",
      },
      {
        body: "feed cat",
      },
      {
        body: "cat translator",
      },
      {
        body: "cat name: dog",
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
  const saves = USER_NOTE_SEEDS.map((userSeed) =>
    buildUserAdmin(userSeed)
      .then((user) => userRepository.save(user))
      .then((user) =>
        Promise.all(
          userSeed.notes.map((noteSeed) => buildNote(noteSeed, user.id).then((note) => noteRepository.save(note))),
        ),
      ),
  );
  return Promise.all(saves).then((noteses) => noteses.flat());
};

export default noteSeeder;
