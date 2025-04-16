import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { Claim } from './claims.enum';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredClaims: Claim[] | undefined = this.reflector.get<Claim[]>(
      'claims',
      context.getHandler(),
    );

    if (!requiredClaims || requiredClaims.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    if (!user || !user.role || !user.role.claims) {
      throw new ForbiddenException('Access denied');
    }

    const userClaims = new Set(user.role.claims);
    const hasPermission = requiredClaims.every((claim) =>
      userClaims.has(claim),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }

    return true;
  }
}
