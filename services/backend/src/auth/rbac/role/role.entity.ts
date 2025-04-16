import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../users/users.entity';
import { Claim } from '../claims.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Role {
  @ApiProperty({ example: 1, description: 'Unique identifier of the role' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'admin', description: 'Name of the role' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: ['READ_OWN_USER', 'WRITE_OWN_USER'],
    description: 'List of claims associated with the role',
    type: [String],
    enum: Claim,
  })
  @Column('simple-array')
  claims: Claim[];

  @ApiProperty({
    description: 'Users associated with this role',
    type: () => [User],
  })
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
