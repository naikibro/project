import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './auth.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('should return true when user has admin role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            roles: ['Admin'],
          },
        }),
      }),
    } as ExecutionContext;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user does not have admin role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            roles: ['User'],
          },
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Access denied. Admin only.',
    );
  });

  it('should throw ForbiddenException when user does not have admin role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Access denied. Admin only.',
    );
  });

  it('should throw ForbiddenException when user roles are not defined', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {},
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Access denied. Admin only.',
    );
  });
});
