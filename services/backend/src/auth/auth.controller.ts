import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { GoogleOauthGuard } from './google/google-oauth.guard';
import { User } from '../users/users.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth',
    description: 'Redirects to Google OAuth consent screen for authentication',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth() {
    return Promise.resolve({ message: 'Google authentication initiated' });
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Handles the OAuth callback from Google, sets access token cookie and redirects to frontend',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with access token cookie set',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired OAuth token',
  })
  async googleAuthRedirect(@Req() req: { user: User }, @Res() res: Response) {
    const { accessToken } = await this.authService.handleGoogleLogin({
      email: req.user.email,
      googleId: req.user.googleId ?? '',
      username: req.user.username ?? '',
      picture: req.user.profilePicture ?? '',
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.redirect(`${process.env.FRONTEND_URL}`);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User signup',
    description:
      'Registers a new user with the provided credentials and accepted policies.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            username: { type: 'string', example: 'testuser' },
            email: { type: 'string', example: 'test@example.com' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-05-22T12:34:56.789Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, e.g., invalid input or missing required fields',
  })
  @ApiBody({
    type: SignUpDto,
    examples: {
      example1: {
        summary: 'Valid signup request',
        value: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'StrongPassword123!',
          acceptedTerms: true,
          acceptedPrivacyPolicy: true,
        },
      },
    },
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User signin',
    description:
      'Authenticates a user and returns an access token along with user details.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                username: { type: 'string', example: 'testuser' },
                email: { type: 'string', example: 'test@example.com' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials provided' })
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const { accessToken, user } = await this.authService.signIn(signInDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ accessToken, user });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forgot password',
    description:
      'Sends a password reset link to the user email if the account exists.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent if email exists',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example:
                'If an account with this email exists, a password reset link will be sent.',
            },
          },
        },
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    },
  })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return {
      message:
        'If an account with this email exists, a password reset link will be sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Resets the user password using a provided valid token and new password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Password successfully reset' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
    examples: {
      example1: {
        summary: 'Valid reset password request',
        value: {
          token: 'password-reset-token',
          newPassword: 'NewStrongPassword123!',
        },
      },
    },
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return {
      message: 'Password has been successfully reset',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Clears the authentication cookie.',
  })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({ message: 'Logged out successfully' });
  }
}
