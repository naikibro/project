import { Controller, ForbiddenException, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { exec } from 'child_process';
import { promisify } from 'util';

@ApiTags('Database maintenance')
@Controller('db')
export class DatabaseController {
  @Get('update')
  @ApiOperation({
    summary: 'Run latest migrations',
    description:
      'Executes pending migrations on the connected database regardless of the current environment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migrations ran successfully.',
    schema: {
      example: {
        message: 'Migrations ran successfully',
        stdout: '...',
        stderr: '',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Migration failed.',
    schema: {
      example: { error: 'Migration failed', details: 'Error details here' },
    },
  })
  async update() {
    try {
      // Move the promisify call inside the method
      const execAsync = promisify(exec);
      const { stdout, stderr } = await execAsync('npm run migration:run');
      return {
        message: 'Migrations ran successfully',
        stdout,
        stderr,
      };
    } catch (error: unknown) {
      let details = 'Unknown error';
      if (error instanceof Error) {
        details = error.message;
      }
      return { error: 'Migration failed', details };
    }
  }

  @Post('update')
  @ApiOperation({
    summary: 'Run latest migrations (POST)',
    description:
      'Executes pending migrations on the connected database regardless of the current environment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migrations ran successfully.',
    schema: {
      example: {
        message: 'Migrations ran successfully',
        stdout: '...',
        stderr: '',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Migration failed.',
    schema: {
      example: { error: 'Migration failed', details: 'Error details here' },
    },
  })
  async updatePost() {
    try {
      const execAsync = promisify(exec);
      const { stdout, stderr } = await execAsync('npm run migration:run');
      return {
        message: 'Migrations ran successfully',
        stdout,
        stderr,
      };
    } catch (error: unknown) {
      let details = 'Unknown error';
      if (error instanceof Error) {
        details = error.message;
      }
      return { error: 'Migration failed', details };
    }
  }

  @Get('revert')
  @ApiOperation({
    summary: 'Revert latest migration',
    description:
      'Reverts the most recent migration on the connected database. This endpoint is available only in dev and test environments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration reverted successfully.',
    schema: {
      example: {
        message: 'Migration reverted successfully',
        stdout: '...',
        stderr: '',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden: Endpoint is only available in dev and test environments.',
    schema: { example: { error: 'Forbidden' } },
  })
  @ApiResponse({
    status: 500,
    description: 'Migration revert failed.',
    schema: {
      example: {
        error: 'Migration revert failed',
        details: 'Error details here',
      },
    },
  })
  async revert() {
    if (!(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev')) {
      throw new ForbiddenException(
        'Migrations endpoint is available only in dev and test environments',
      );
    }
    try {
      const execAsync = promisify(exec);
      const { stdout, stderr } = await execAsync('npm run migration:revert');
      return {
        message: 'Migration reverted successfully',
        stdout,
        stderr,
      };
    } catch (error: unknown) {
      let details = 'Unknown error';
      if (error instanceof Error) {
        details = error.message;
      }
      return { error: 'Migration revert failed', details };
    }
  }

  @Post('revert')
  @ApiOperation({
    summary: 'Revert latest migration (POST)',
    description:
      'Reverts the most recent migration on the connected database. This endpoint is available only in dev and test environments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration reverted successfully.',
    schema: {
      example: {
        message: 'Migration reverted successfully',
        stdout: '...',
        stderr: '',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden: Endpoint is only available in dev and test environments.',
    schema: { example: { error: 'Forbidden' } },
  })
  @ApiResponse({
    status: 500,
    description: 'Migration revert failed.',
    schema: {
      example: {
        error: 'Migration revert failed',
        details: 'Error details here',
      },
    },
  })
  async revertPost() {
    if (!(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev')) {
      throw new ForbiddenException(
        'Migrations endpoint is available only in dev and test environments',
      );
    }
    try {
      const execAsync = promisify(exec);
      const { stdout, stderr } = await execAsync('npm run migration:revert');
      return {
        message: 'Migration reverted successfully',
        stdout,
        stderr,
      };
    } catch (error: unknown) {
      let details = 'Unknown error';
      if (error instanceof Error) {
        details = error.message;
      }
      return { error: 'Migration revert failed', details };
    }
  }
}
