import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  Index,
} from "typeorm";
import User from "./User";
import Label from "./Label";

@Entity()
@Index("idx_Note_on_user_createdAt", ["user", "createdAt"])
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

  @ManyToMany(() => Label, (label) => label.notes)
  labels!: Label[];

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "tsvector", generatedType: "STORED", asExpression: "to_tsvector('english', title || ' ' || body)" })
  fts_doc!: string[];
}
