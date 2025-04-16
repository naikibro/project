import { JwtAuthGuard } from './jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should allow access in non-HTTP contexts', async () => {
    const context = {
      getType: () => 'graphql', // ✅ Mock GraphQL/WebSocket test case
    } as ExecutionContext;

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should deny access if user is missing', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(
      'Invalid or missing authentication token',
    );
  });

  it('should throw UnauthorizedException on error', () => {
    expect(() => guard.handleRequest(new Error('Some error'), false)).toThrow(
      'Invalid or missing authentication token',
    );
  });
});
