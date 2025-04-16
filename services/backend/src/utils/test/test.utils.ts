import { Claim } from '../../auth/rbac/claims.enum';
import { Role } from '../../auth/rbac/role/role.entity';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = uuidv5.DNS;

export function idOf(arg: string): string {
  return uuidv5(arg, NAMESPACE);
}

export const testUserRole: Role = {
  id: 2,
  name: 'testUserRole',
  claims: [Claim.DELETE_OWN_USER, Claim.READ_OWN_USER, Claim.WRITE_OWN_USER],
  users: [],
};

export const testAdminRole: Role = {
  id: 1,
  name: 'Admin',
  claims: [
    Claim.DELETE_OWN_USER,
    Claim.READ_OWN_USER,
    Claim.WRITE_OWN_USER,
    Claim.READ_ANY_USER,
    Claim.WRITE_ANY_USER,
    Claim.OMNISCIENT,
  ],
  users: [],
};
