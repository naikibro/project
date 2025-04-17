import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetFeatures1744861351339
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN "passwordResetToken" varchar,
            ADD COLUMN "passwordResetExpires" timestamp
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN "passwordResetToken",
            DROP COLUMN "passwordResetExpires"
        `);
  }
}
