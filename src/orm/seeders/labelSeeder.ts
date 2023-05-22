import Role from "../../lib/auth/Role";
import buildLabel from "../../lib/builders/labels/buildLabel";
import buildNote from "../../lib/builders/notes/buildNote";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";
import { NoteCreateAttributes } from "../../server/schemata/jsonApiNotes";
import { UserAdminCreateAttributes } from "../../server/schemata/jsonApiUsers";
import Label from "../entities/Label";
import Note from "../entities/Note";
import User from "../entities/User";
import Seeder from "./Seeder";

export const USER_LABELED_NOTE_SEEDS: (UserAdminCreateAttributes & {
  notes: (NoteCreateAttributes & { labels: string[] })[];
})[] = [
  {
    username: "label.admin",
    email: "label.admin@admin.com",
    role: Role.ADMIN,
    password: "p4ssw0rd",
    notes: [
      {
        title: "TODO",
        body: "- add mom as user\n- make new private doodlebob instance",
        labels: ["TODO", "Mom"],
      },
    ],
  },
  {
    username: "label.peasant.1",
    email: "label.peasant.1@peasant.com",
    password: "p4ssw0rd",
    notes: [
      {
        body: "get gift for cat",
        labels: ["Gift", "Cat"],
      },
      {
        title: "inspired story",
        body: "there once was a man from nantucket...",
        labels: ["Writing"],
      },
      {
        body: "cat obedience school",
        labels: ["Cat", "TODO"],
      },
      {
        body: "clothes for cat",
        labels: ["Cat", "TODO", "Mom"],
      },
      {
        title: "genius song I wrote last night",
        body: "there's a place in france where the naked ladies dance...",
        labels: ["Writing", "Music"],
      },
      {
        body: "Hi, I'm writing to inform you that I\n\nHello, I just wanted to make sure\n\nHello, you may already be aware, but",
        labels: [],
      },
      {
        body: "feed cat",
        labels: ["Cat", "TODO"],
      },
      {
        body: "cat translator",
        labels: ["Cat", "App idea"],
      },
      {
        body: "cat name: dog",
        labels: ["Cat", "Names", "Dog"],
      },
      {
        title: "stuck in my head",
        body: "up your butt and around the corner...",
        labels: ["Writing", "Memory"],
      },
      {
        body: "get vet for dog (cat)",
        labels: ["Cat", "TODO", "Dog"],
      },
    ],
  },
  {
    username: "label.peasant.2",
    email: "label.peasant.2@peasant.com",
    password: "p4ssw0rd",
    notes: [
      {
        body: "Remember to do that thing",
        labels: ["TODO"],
      },
      {
        title: "",
        body: "",
        labels: [],
      },
      {
        title: "Birthday plans, baby",
        body: "- sleep\n- play video games",
        labels: ["Birthday"],
      },
    ],
  },
];

const labelSeeder: Seeder<Label[]> = async (entityManager) => {
  const userRepository = entityManager.getRepository(User);
  const noteRepository = entityManager.getRepository(Note);
  const labelRepository = entityManager.getRepository(Label);

  const notesSaves = USER_LABELED_NOTE_SEEDS.map(async (userSeed) => {
    const user = await buildUserAdmin(userSeed);
    const savedUser = await userRepository.save(user);

    const noteSaves = userSeed.notes.map(async (noteSeed) => {
      const labelNames = noteSeed.labels;
      const labelSaves = labelNames.map((name) => buildLabel({ name }, savedUser.id));
      const labels = await Promise.all(labelSaves);
      const insertResult = await labelRepository.upsert(labels, ["name", "user"]);
      const labelsToSet = insertResult.identifiers as Label[];
      const note = await buildNote(noteSeed, savedUser.id);
      note.labels = labelsToSet;
      return noteRepository.save(note);
    });

    return Promise.all(noteSaves);
  });

  const noteses = await Promise.all(notesSaves);
  const notes = noteses.flat();
  const labelses = notes.map(({ labels }) => labels);
  const labels = labelses.flat();

  return labels;
};

export default labelSeeder;
