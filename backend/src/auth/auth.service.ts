import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Placeholder for implementation in Phase 2
  async login(email: string, password: string) {
    return { access_token: 'placeholder' };
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    return { message: 'Register implemented in Phase 2' };
  }
}
