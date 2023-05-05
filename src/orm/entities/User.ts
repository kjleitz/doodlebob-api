import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import Role from "../../lib/auth/Role";

@Entity()
// @Index(["name"], {unique: true}, "WHERE (key is NOT IN(conditional_col_b));")
// @Index(["email"], { unique: true, where: "email != ''" })
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

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;
}
