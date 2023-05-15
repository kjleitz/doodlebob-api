import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import User from "./User";

@Entity()
export default class Note {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.notes)
  user!: User;

  @Column({ type: "text", default: "" })
  title!: string;

  @Column({ type: "text", default: "" })
  body!: string;

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;
}
