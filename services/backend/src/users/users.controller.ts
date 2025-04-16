import {
  Controller,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  UnauthorizedException,
  Body,
  Put,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Claims } from 'src/auth/rbac/claims.decorator';
import { Claim } from 'src/auth/rbac/claims.enum';
import { RbacGuard } from 'src/auth/rbac/rbac.guard';
import { UsersService } from './users.service';
import { UserDto } from './dto/users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Claims(Claim.READ_OWN_USER)
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile of the currently authenticated user based on the provided JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile returned successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UserDto',
        },
        examples: {
          userProfile: {
            summary: 'User profile',
            value: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com',
              // additional properties as defined in UserDto...
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  getUserProfile(@Req() req: { user: { email: string } }) {
    return this.usersService.getUserByEmail(req.user.email);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Claims(Claim.READ_ANY_USER)
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Returns a list of all registered users. Accessible only to users with elevated permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserDto' },
        },
        examples: {
          usersList: {
            summary: 'Users list',
            value: [
              { id: 1, username: 'testuser', email: 'test@example.com' },
              { id: 2, username: 'anotheruser', email: 'another@example.com' },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Claims(Claim.WRITE_OWN_USER)
  @ApiOperation({
    summary: 'Update current user',
    description:
      'Updates the profile of the currently authenticated user. Only allowed fields may be updated.',
  })
  @ApiBody({
    description: 'Updated user details',
    type: UserDto,
    examples: {
      updateUser: {
        summary: 'Update current user',
        value: {
          username: 'updatedTestUser',
          email: 'test@example.com',
          // additional updatable properties...
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/UserDto' },
        examples: {
          updatedUser: {
            summary: 'Updated user profile',
            value: {
              id: 1,
              username: 'updatedTestUser',
              email: 'test@example.com',
              // additional properties...
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  updateUser(@Req() req: { user: { email: string } }, @Body() user: UserDto) {
    return this.usersService.updateUserByEmail(req.user.email, user);
  }

  @Put(':username')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Claims(Claim.WRITE_ANY_USER)
  @ApiOperation({
    summary: 'Update a user by username',
    description:
      'Updates the profile of a specified user. This is allowed only for users with administrative privileges.',
  })
  @ApiBody({
    description: 'Updated user details',
    type: UserDto,
    examples: {
      updateUserByUsername: {
        summary: 'Update user by username',
        value: {
          username: 'updatedUsername',
          email: 'updated@example.com',
          // additional updatable properties...
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/UserDto' },
        examples: {
          updatedUser: {
            summary: 'Updated user profile',
            value: {
              id: 2,
              username: 'updatedUsername',
              email: 'updated@example.com',
              // additional properties...
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  updateUserByUsername(
    @Body() user: UserDto,
    @Param('username') username: string,
  ) {
    return this.usersService.updateUser(username, user);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Claims(Claim.DELETE_OWN_USER)
  @ApiOperation({
    summary: 'Delete current user',
    description:
      'Deletes the account of the currently authenticated user. The provided email must match the authenticated user’s email.',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully (no content returned)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  deleteUser(
    @Req() req: { user: { email: string } },
    @Body('email') email?: string,
  ) {
    const authenticatedEmail = req.user.email;
    if (email && email !== authenticatedEmail) {
      throw new UnauthorizedException('You can only delete your own account');
    }
    return this.usersService.deleteUserByEmail(authenticatedEmail);
  }

  @Delete(':username')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Claims(Claim.DELETE_ANY_USER)
  @ApiOperation({
    summary: 'Delete a user by username',
    description:
      'Deletes the account of a specified user. This endpoint is available only to administrators.',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully (no content returned)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  deleteUserByUsername(
    @Req() req: { user: { email: string } },
    @Body('id') id: string,
  ) {
    return this.usersService.deleteUser(id);
  }
}
