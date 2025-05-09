import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertUserRatingTable1746466391520
  implements MigrationInterface
{
  /* TODO : please create the required migration for the alert user rating table */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the alert_user_ratings table
    await queryRunner.query(`
      CREATE TABLE "alert_user_ratings" (
        "id" SERIAL PRIMARY KEY,
        "alert_id" INTEGER NOT NULL,
        "user_id" VARCHAR NOT NULL,
        "is_upvote" BOOLEAN NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_alert_user_ratings_alert" 
          FOREIGN KEY ("alert_id") 
          REFERENCES "alerts"("id") 
          ON DELETE CASCADE,
        CONSTRAINT "uq_alert_user_rating" 
          UNIQUE ("alert_id", "user_id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "idx_alert_user_ratings_alert_id" 
      ON "alert_user_ratings"("alert_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_alert_user_ratings_user_id" 
      ON "alert_user_ratings"("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_alert_user_ratings_user_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_alert_user_ratings_alert_id"
    `);

    // Drop the table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "alert_user_ratings"
    `);
  }
}
