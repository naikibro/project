import { Role } from "./Role.model";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  googleId: string;
  isActive: boolean;
  profilePicture: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  createdAt: Date;
  role: Role;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  profilePicture?: string | null;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  role: Role;
}
