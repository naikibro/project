import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertsTable1745318494028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "alerts" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "coordinates" JSONB NOT NULL,
        "locationContext" JSONB,
        "description" TEXT NOT NULL,
        "type" VARCHAR NOT NULL,
        "date" TIMESTAMP NOT NULL
      )
    `);

    // Add constraint for alert type enum
    await queryRunner.query(`
      ALTER TABLE "alerts" 
      ADD CONSTRAINT "chk_alert_type" 
      CHECK ("type" IN ('info', 'warning', 'error'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "alerts"`);
  }
}
