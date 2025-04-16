import { SetMetadata } from '@nestjs/common';
import { Claim } from './claims.enum';

export const Claims = (...claims: Claim[]) => SetMetadata('claims', claims);
