import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() credentials: { email: string; password: string }) {
    return this.authService.login(credentials.email, credentials.password);
  }

  @Post('register')
  register(
    @Body() data: { email: string; password: string; firstName: string; lastName: string }
  ) {
    return this.authService.register(data.email, data.password, data.firstName, data.lastName);
  }
}
