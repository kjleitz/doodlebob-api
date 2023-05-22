import { MigrationInterface, QueryRunner } from "typeorm";

export class NoteLabelNamesCache1684782650572 implements MigrationInterface {
  name = "NoteLabelNamesCache1684782650572";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "note"
            ADD "labelNamesCache" jsonb NOT NULL DEFAULT '[]'
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_gin_Note_on_fts_doc"
        `);
    await queryRunner.query(`
            ALTER TABLE "note" DROP COLUMN "fts_doc"
        `);
    await queryRunner.query(
      `
            DELETE FROM "typeorm_metadata"
            WHERE "type" = $1
                AND "name" = $2
                AND "database" = $3
                AND "schema" = $4
                AND "table" = $5
        `,
      ["GENERATED_COLUMN", "fts_doc", "doodlebob-development", "public", "note"],
    );
    await queryRunner.query(`
            ALTER TABLE "note"
            ADD "fts_doc" tsvector GENERATED ALWAYS AS (
                    to_tsvector(
                        'english',
                        "title" || ' ' || "body" || ' ' || "labelNamesCache"::text
                    )
                ) STORED NOT NULL
        `);
    await queryRunner.query(
      `
            INSERT INTO "typeorm_metadata"(
                    "database",
                    "schema",
                    "table",
                    "type",
                    "name",
                    "value"
                )
            VALUES ($1, $2, $3, $4, $5, $6)
        `,
      [
        "doodlebob-development",
        "public",
        "note",
        "GENERATED_COLUMN",
        "fts_doc",
        "to_tsvector('english', \"title\" || ' ' || \"body\" || ' ' || \"labelNamesCache\"::text)",
      ],
    );
    await queryRunner.query(`
            CREATE INDEX "idx_gin_Note_on_fts_doc" ON "note" ("fts_doc")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."idx_gin_Note_on_fts_doc"
        `);
    await queryRunner.query(
      `
            DELETE FROM "typeorm_metadata"
            WHERE "type" = $1
                AND "name" = $2
                AND "database" = $3
                AND "schema" = $4
                AND "table" = $5
        `,
      ["GENERATED_COLUMN", "fts_doc", "doodlebob-development", "public", "note"],
    );
    await queryRunner.query(`
            ALTER TABLE "note" DROP COLUMN "fts_doc"
        `);
    await queryRunner.query(
      `
            INSERT INTO "typeorm_metadata"(
                    "database",
                    "schema",
                    "table",
                    "type",
                    "name",
                    "value"
                )
            VALUES ($1, $2, $3, $4, $5, $6)
        `,
      [
        "doodlebob-development",
        "public",
        "note",
        "GENERATED_COLUMN",
        "fts_doc",
        "to_tsvector('english', title || ' ' || body)",
      ],
    );
    await queryRunner.query(`
            ALTER TABLE "note"
            ADD "fts_doc" tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_gin_Note_on_fts_doc" ON "note" ("fts_doc")
        `);
    await queryRunner.query(`
            ALTER TABLE "note" DROP COLUMN "labelNamesCache"
        `);
  }
}
