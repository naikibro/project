import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertRatingsTable1746414919057
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the alert_ratings table
    await queryRunner.query(`
            CREATE TABLE "alert_ratings" (
                "id" SERIAL PRIMARY KEY,
                "alert_id" INTEGER NOT NULL,
                "upvotes" INTEGER NOT NULL DEFAULT 0,
                "downvotes" INTEGER NOT NULL DEFAULT 0,
                CONSTRAINT "fk_alert_ratings_alert" 
                    FOREIGN KEY ("alert_id") 
                    REFERENCES "alerts"("id") 
                    ON DELETE CASCADE
            )
        `);

    // Create an index on alert_id for better query performance
    await queryRunner.query(`
            CREATE INDEX "idx_alert_ratings_alert_id" 
            ON "alert_ratings"("alert_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_alert_ratings_alert_id"
        `);

    // Drop the table
    await queryRunner.query(`
            DROP TABLE IF EXISTS "alert_ratings"
        `);
  }
}
