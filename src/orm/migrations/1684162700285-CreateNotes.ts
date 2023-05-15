import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotes1684162700285 implements MigrationInterface {
    name = 'CreateNotes1684162700285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "note" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" text NOT NULL,
                "body" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "note"
            ADD CONSTRAINT "FK_5b87d9d19127bd5d92026017a7b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note" DROP CONSTRAINT "FK_5b87d9d19127bd5d92026017a7b"
        `);
        await queryRunner.query(`
            DROP TABLE "note"
        `);
    }

}
