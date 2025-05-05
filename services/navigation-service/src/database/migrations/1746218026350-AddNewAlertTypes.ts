import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewAlertTypes1746218026350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the enum type with all values
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alerts_type_enum') THEN
          CREATE TYPE "alerts_type_enum" AS ENUM (
            'info', 'warning', 'error',
            'accident', 'traffic_jam', 'road_closed', 'police_control', 'obstacle_on_road'
          );
        END IF;
      END
      $$;
    `);

    // 2. Drop the old check constraint if it exists
    await queryRunner.query(`
      ALTER TABLE "alerts" DROP CONSTRAINT IF EXISTS "chk_alert_type";
    `);

    // 3. Change the column type from VARCHAR to enum
    await queryRunner.query(`
      ALTER TABLE "alerts"
      ALTER COLUMN "type" TYPE "alerts_type_enum"
      USING "type"::text::"alerts_type_enum";
    `);
  }

  public async down(): Promise<void> {
    // To revert, you would need to change the column back to VARCHAR and drop the enum type.
    // This is left empty for safety.
  }
}
