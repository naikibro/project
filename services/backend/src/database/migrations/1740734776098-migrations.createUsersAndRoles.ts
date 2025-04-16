import * as dotenv from 'dotenv';
import { Role } from '@/auth/rbac/role/role.entity';
import * as bcrypt from 'bcrypt';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
dotenv.config();

export class CreateUsersAndRoles1740734776098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.createTable(
      new Table({
        name: 'role',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'claims', type: 'jsonb', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'username', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar', isNullable: true },
          { name: 'googleId', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'profilePicture', type: 'varchar', isNullable: true },
          { name: 'acceptedTerms', type: 'boolean', default: false },
          { name: 'acceptedPrivacyPolicy', type: 'boolean', default: false },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'role_id', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    const foreignKey = new TableForeignKey({
      columnNames: ['role_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'role',
      onDelete: 'SET NULL',
    });
    await queryRunner.createForeignKey('user', foreignKey);

    await queryRunner.query(
      `INSERT INTO role (name, claims) VALUES 
       ('Admin', '["read:any:user", "read:own:user", "write:own:user", "write:any:user", "delete:any:user", "omniscient"]'),
       ('User', '["read:own:user", "write:own:user"]')`,
    );

    const adminRole = (await queryRunner.query(
      `SELECT id FROM role WHERE name = 'Admin'`,
    )) as Role[];
    const userRole = (await queryRunner.query(
      `SELECT id FROM role WHERE name = 'User'`,
    )) as Role[];

    const password = process.env.ADMIN_USER_PASSWORD || 'ChangeMe1234*';
    const hashedPassword = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO "user" (username, email, password, role_id) VALUES 
       ('Naiki', 'naikibro@gmail.com', $1, $2)`,
      [hashedPassword, adminRole[0].id],
    );

    await queryRunner.query(
      `INSERT INTO "user" (username, email, password, role_id) VALUES 
       ('naikibro+test', 'naikibro+test@gmail.com', $1, $2)`,
      [hashedPassword, userRole[0].id],
    );

    await queryRunner.query(
      `INSERT INTO "user" (username, email, password, role_id) VALUES 
       ('naikibro+user', 'naikibro+user@gmail.com', $1, $2)`,
      [hashedPassword, userRole[0].id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user');
    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('role_id'),
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('user', foreignKey);
    }

    await queryRunner.dropTable('user');
    await queryRunner.dropTable('role');
  }
}
