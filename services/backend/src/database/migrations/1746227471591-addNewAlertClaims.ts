import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewAlertClaims1746227471591 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE role 
      SET claims = claims || '["read:own:alert", "write:own:alert", "delete:own:alert"]' 
      WHERE name = 'User' OR name = 'Admin';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE role 
      SET claims = jsonb_set(
        claims::jsonb, 
        '{claims}', 
        (SELECT jsonb_agg(claim) FROM jsonb_array_elements(claims::jsonb) claim WHERE claim != 'read:own:alert' AND claim != 'write:own:alert' AND claim != 'delete:own:alert')
      )  
      WHERE name = 'User' OR name = 'Admin';
    `);
  }
}
