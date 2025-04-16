import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../users/users.entity';
import { Claim } from '../claims.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('simple-array')
  claims: Claim[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
