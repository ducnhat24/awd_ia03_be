// src/auth/auth.controller.ts

import { Controller, Post, Body, Get, UseGuards, Request, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // <-- Import Guard
import { RefreshTokenGuard } from './guards/refresh-token.strategy';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  /**
   * Endpoint: POST /auth/login
   * @param loginDto Dữ liệu frontend gửi lên (ví dụ: { email, password })
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // LoginDto provides validation for email/password via class-validator
    return this.authService.login(loginDto);
  }

  /**
 * Endpoint: POST /auth/register
 * Moved from UserController -> delegates to UserService.register
 */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  /**
   * Endpoint: GET /auth/me
   * Đây là endpoint được bảo vệ.
   */
  @UseGuards(JwtAuthGuard) // <-- Sử dụng "Người gác cổng" ở đây!
  @Get('me')
  getProfile(@Request() req) {
    // Cảm ơn JwtStrategy đã xác thực token và gán `req.user`.
    // Nhưng để đảm bảo trả về profile đầy đủ (bao gồm `name`),
    // chúng ta sẽ lấy user từ database thông qua UserService.
    // `req.user` có thể là payload hoặc một object user tùy implement của JwtStrategy,
    // nên chúng ta thử lấy id từ nhiều chỗ khác nhau.
    const possibleId = req.user?.id || req.user?.userId || req.user?.sub;
    if (!possibleId) {
      return req.user;
    }

    return this.userService.findById(possibleId);
  }

  @UseGuards(RefreshTokenGuard) // <-- Dùng Guard mới!
  @Get('refresh')
  refreshAccessToken(@Request() req) {
    // `req.user` lúc này là payload từ RefreshTokenStrategy
    // (ví dụ: { userId: '123-abc' })
    return this.authService.refreshAccessToken(req.user);
  }


}