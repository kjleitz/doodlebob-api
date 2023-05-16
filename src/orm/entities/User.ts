import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import Role from "../../lib/auth/Role";
import Note from "./Note";
import Label from "./Label";

@Entity()
export default class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Index({ unique: true, where: "email != ''" })
  @Column({ default: "" })
  email!: string;

  @Column({ type: "int", default: Role.PEASANT })
  role!: Role;

  @Column({ default: "" })
  passwordHash!: string;

  @OneToMany(() => Note, (note) => note.user)
  notes!: Note[];

  @OneToMany(() => Label, (label) => label.user)
  labels!: Label[];

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;
}
