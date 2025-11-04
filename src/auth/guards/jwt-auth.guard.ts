
// src/auth/guards/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 'jwt' là tên mặc định của chiến lược (strategy) mà chúng ta đã đăng ký
export class JwtAuthGuard extends AuthGuard('jwt') { }