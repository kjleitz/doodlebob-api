import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultToTitleAndBodyOnNotes1684164719353 implements MigrationInterface {
    name = 'AddDefaultToTitleAndBodyOnNotes1684164719353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note"
            ALTER COLUMN "title"
            SET DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE "note"
            ALTER COLUMN "body"
            SET DEFAULT ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note"
            ALTER COLUMN "body" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "note"
            ALTER COLUMN "title" DROP DEFAULT
        `);
    }

}
