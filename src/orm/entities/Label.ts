import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Note from "./Note";

@Entity()
@Unique("idx_uniq_Label_on_user_name", ["user", "name"])
export default class Label {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => User, (user) => user.labels, { nullable: false, onDelete: "CASCADE" })
  user!: User;

  @ManyToMany(() => Note, (note) => note.labels)
  @JoinTable()
  notes!: Note[];

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;
}
