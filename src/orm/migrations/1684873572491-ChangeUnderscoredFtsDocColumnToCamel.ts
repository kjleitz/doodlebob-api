import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUnderscoredFtsDocColumnToCamel1684873572491 implements MigrationInterface {
  name = "ChangeUnderscoredFtsDocColumnToCamel1684873572491";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "public"."idx_gin_Note_on_fts_doc"
    `);
    await queryRunner.query(`
        ALTER TABLE "note"
        RENAME COLUMN "fts_doc" TO "ftsDoc"
    `);
    await queryRunner.query(`
        CREATE INDEX "idx_gin_Note_on_ftsDoc" ON "note" USING gin ("ftsDoc")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "public"."idx_gin_Note_on_ftsDoc"
    `);
    await queryRunner.query(`
        ALTER TABLE "note"
        RENAME COLUMN "ftsDoc" TO "fts_doc"
    `);
    await queryRunner.query(`
        CREATE INDEX "idx_gin_Note_on_fts_doc" ON "note" ("fts_doc")
    `);
  }
}
