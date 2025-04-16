import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountDeletionRights1741769339840
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE role 
      SET claims = claims || '["delete:own:user"]' 
      WHERE name = 'User' OR name = 'Admin';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE role 
      SET claims = jsonb_set(
        claims::jsonb, 
        '{claims}', 
        (SELECT jsonb_agg(claim) FROM jsonb_array_elements(claims::jsonb) claim WHERE claim != 'delete:own:user')
      ) 
      WHERE name = 'User' OR name = 'Admin';
    `);
  }
}
