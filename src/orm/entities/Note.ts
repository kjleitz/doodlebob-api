import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Label from "./Label";
import User from "./User";

@Entity()
@Index("idx_Note_on_user_createdAt", ["user", "createdAt"])
// TypeORM doesn't support GIN indices (yet?), so this had to be created
// "manually" in a migration. The `synchronize: false` option is meant to
// prevent it from being deleted when a new migration is generated. Sadly, this
// feature has seemingly been broken for _years_ and is not acknowledged by the
// maintainers (yet?). See:
//
//   - https://github.com/typeorm/typeorm/issues/7487#issuecomment-1557557822
//   - https://github.com/typeorm/typeorm/issues/7520#issuecomment-1557567569
//
// So, I'm leaving this here (even though it doesn't work) as a reminder. The
// real (hacky) work of preventing this index from being deleted with every new
// migration is done in `bin/preserve-fts-index`, which is run after generating
// a new migration with:
//
//   - `pnpm migration:generate`, or
//   - `pnpm docker:migration:generate`
//
@Index("idx_gin_Note_on_fts_doc", { synchronize: false })
export default class Note {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", default: "" })
  title!: string;

  @Column({ type: "text", default: "" })
  body!: string;

  @ManyToOne(() => User, (user) => user.notes)
  user!: User;

  // I'd prefer not to add `cascade: true` to this. Create new labels separately
  // before saving the note (i.e., always include the label ID for all labels
  // being set by this collection). Using `cascade: true` also has implications
  // for the `labelNamesCache`. See `src/orm/subscribers/NoteSubscriber.ts`.
  // Note: If setting labels, if the label names are available on all the list
  // items it will save the DB a query when the `labelNamesCache` is being
  // computed, so if you have the names already you might as well include them
  // instead of plucking just the `id` fields from the list.
  @ManyToMany(() => Label, (label) => label.notes)
  labels!: Label[];

  // This is a list of label names set whenever the note is saved with a list in
  // the `labels` field (whenever labels are being attached to it). This occurs
  // before update in `NoteSubscriber`. This cache WILL NOT UPDATE unless the
  // note is saved with a non-nullish value under `labels`. This field is used
  // primarily as search terms along with the title and body for full-text
  // search purposes.
  @Column({ type: "jsonb", default: [] })
  labelNamesCache!: string[];

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: "tsvector",
    generatedIdentity: "ALWAYS",
    generatedType: "STORED",
    asExpression: "to_tsvector('english', \"title\" || ' ' || \"body\" || ' ' || \"labelNamesCache\"::text)",
  })
  fts_doc!: string[];
}
