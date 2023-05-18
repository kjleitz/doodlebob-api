import { MigrationInterface, QueryRunner } from "typeorm";

export class TweakLabelIndicesAndColumnProperties1684431300644 implements MigrationInterface {
    name = 'TweakLabelIndicesAndColumnProperties1684431300644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "FK_e5d0325ea0283e5f316dee36a08"
        `);
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "UQ_3a0b2b75822cb7ac9bfb20ecc3d"
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ALTER COLUMN "userId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_Label_on_id_user" ON "label" ("id", "userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "idx_uniq_Label_on_name_user" UNIQUE ("name", "userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "FK_e5d0325ea0283e5f316dee36a08" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "FK_e5d0325ea0283e5f316dee36a08"
        `);
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "idx_uniq_Label_on_name_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_Label_on_id_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ALTER COLUMN "userId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "UQ_3a0b2b75822cb7ac9bfb20ecc3d" UNIQUE ("name", "userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "FK_e5d0325ea0283e5f316dee36a08" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
