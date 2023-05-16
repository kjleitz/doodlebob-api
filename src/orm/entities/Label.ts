import {
  Column,
  CreateDateColumn,
  Entity,
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
@Unique(["name", "user"])
export default class Label {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => User, (user) => user.labels)
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
