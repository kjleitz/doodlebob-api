import { MigrationInterface, QueryRunner } from "typeorm";

export class LabelIndicesTweaks1684678176814 implements MigrationInterface {
    name = 'LabelIndicesTweaks1684678176814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."idx_Label_on_id_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "idx_uniq_Label_on_name_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "idx_uniq_Label_on_user_name" UNIQUE ("userId", "name")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "label" DROP CONSTRAINT "idx_uniq_Label_on_user_name"
        `);
        await queryRunner.query(`
            ALTER TABLE "label"
            ADD CONSTRAINT "idx_uniq_Label_on_name_user" UNIQUE ("name", "userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_Label_on_id_user" ON "label" ("id", "userId")
        `);
    }

}
