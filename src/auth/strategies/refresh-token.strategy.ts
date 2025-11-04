// src/auth/strategies/refresh-token.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh', // <-- Tên định danh cho strategy này
) {
    constructor() {
        super({
            // Vẫn lấy token từ "Authorization: Bearer <token>"
            // Frontend SẼ PHẢI gửi Refresh Token ở đây
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    /**
     * Hàm này chạy sau khi token được xác thực là hợp lệ
     * Payload này là payload của Refresh Token (chỉ chứa 'sub')
     */
    async validate(payload: any) {
        // Trả về payload (chỉ chứa userId)
        return { userId: payload.sub };
    }
}