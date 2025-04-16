import { Claim } from "./Claim.model";
import { User } from "./User.model";

export interface Role {
  id: number;
  name: string;
  claims: Claim[];
  users: User[];
}
