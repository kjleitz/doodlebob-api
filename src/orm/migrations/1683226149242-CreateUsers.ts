import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1683226149242 implements MigrationInterface {
  name = "CreateUsers1683226149242";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "email" character varying NOT NULL DEFAULT '',
                "role" integer NOT NULL DEFAULT '10',
                "passwordHash" character varying NOT NULL DEFAULT '',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_d7692154acb8e5cdb515d8fbbb" ON "user" ("email")
            WHERE email != ''
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d7692154acb8e5cdb515d8fbbb"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
  }
}
