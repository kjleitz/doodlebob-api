import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderByPerformanceTweaks1684527052597 implements MigrationInterface {
  name = "OrderByPerformanceTweaks1684527052597";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX "idx_Note_on_user_createdAt" ON "note" ("userId", "createdAt")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."idx_Note_on_user_createdAt"
        `);
  }
}
