import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLabels1684202875998 implements MigrationInterface {
    name = 'CreateLabels1684202875998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "label" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "UQ_3a0b2b75822cb7ac9bfb20ecc3d" UNIQUE ("name", "userId"),
                CONSTRAINT "PK_5692ac5348861d3776eb5843672" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "label_notes_note" (
                "labelId" integer NOT NULL,
                "noteId" uuid NOT NULL,
                CONSTRAINT "PK_6ac47d9fad6214c1ba5819733da" PRIMARY KEY ("labelId", "noteId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3db91257cef77e036faf80dd3d" ON "label_notes_note" ("labelId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f74b3c8b0fb7f176cad6093c3e" ON "label_notes_note" ("noteId")
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "FK_e5d0325ea0283e5f316dee36a08" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "label_notes_note"
            ADD CONSTRAINT "FK_3db91257cef77e036faf80dd3d2" FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "label_notes_note"
            ADD CONSTRAINT "FK_f74b3c8b0fb7f176cad6093c3e9" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "label_notes_note" DROP CONSTRAINT "FK_f74b3c8b0fb7f176cad6093c3e9"
        `);
        await queryRunner.query(`
            ALTER TABLE "label_notes_note" DROP CONSTRAINT "FK_3db91257cef77e036faf80dd3d2"
        `);
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "FK_e5d0325ea0283e5f316dee36a08"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f74b3c8b0fb7f176cad6093c3e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3db91257cef77e036faf80dd3d"
        `);
        await queryRunner.query(`
            DROP TABLE "label_notes_note"
        `);
        await queryRunner.query(`
            DROP TABLE "label"
        `);
    }

}
