import { EntitySubscriberInterface, EventSubscriber, In, InsertEvent, QueryRunner, UpdateEvent } from "typeorm";
import { sortedUniq } from "../../lib/utils/arrays";
import Label from "../entities/Label";
import Note from "../entities/Note";

const labelNamesForCache = (noteAttrs: Partial<Note>, queryRunner: QueryRunner): Promise<string[] | null> => {
  // If no labels are being set, don't update the cache.
  const labelsAttrs = noteAttrs.labels as Partial<Label>[];
  if (!labelsAttrs) return Promise.resolve(null);

  // If all labels are getting deleted, clear the label names cache as well.
  if (labelsAttrs.length === 0) return Promise.resolve([]);

  // The labels-to-set may include names, but they may just be a list of IDs. We
  // need to find the missing names if that's the case.
  const names: string[] = [];
  const idsWithoutNames: number[] = [];

  labelsAttrs.forEach((labelAttrs) => {
    if (labelAttrs.name) {
      names.push(labelAttrs.name);
    } else if (labelAttrs.id) {
      idsWithoutNames.push(labelAttrs.id);
    }
    // There's no fall-through here because if no ID was given and no name was
    // given then we must be trying to create the labels with a cascade. At the
    // moment, that's not supported. If it were, we'd have to set the cache
    // after the update, not before.
  });

  // If there are no names to look up, we'll just return the sorted unique names
  if (idsWithoutNames.length === 0) return Promise.resolve(sortedUniq(names.sort()));

  return queryRunner.manager
    .find(Label, { where: { id: In(idsWithoutNames) }, select: ["name"] })
    .then((labels) => labels.forEach(({ name }) => names.push(name)))
    .then(() => sortedUniq(names.sort()));
};

@EventSubscriber()
export default class NoteSubscriber implements EntitySubscriberInterface {
  listenTo(): typeof Note {
    return Note;
  }

  // NB: Entity subscribers don't fire their `beforeUpdate` hooks if only a
  // relation is changing, so we gotta update the cache manually on note update.
  // TODO: This is fragile for the above reason.
  beforeUpdate(event: UpdateEvent<Note>): void | Promise<Partial<Note>> {
    const noteAttrs = event.entity as Partial<Note>;
    if (!noteAttrs) return;

    return labelNamesForCache(noteAttrs, event.queryRunner).then((labelNames) => {
      if (labelNames) noteAttrs.labelNamesCache = labelNames;
      return noteAttrs;
    });
  }

  beforeInsert(event: InsertEvent<any>): void | Promise<any> {
    const noteAttrs = event.entity as Partial<Note>;
    if (!noteAttrs) return;

    return labelNamesForCache(noteAttrs, event.queryRunner).then((labelNames) => {
      if (labelNames) noteAttrs.labelNamesCache = labelNames;
      return noteAttrs;
    });
  }
}
