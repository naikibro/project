import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { roles?: string[] } }>();
    const user = request.user;

    if (user && user.roles && user.roles.includes('Admin')) {
      return true;
    }

    throw new ForbiddenException('Access denied. Admin only.');
  }
}
