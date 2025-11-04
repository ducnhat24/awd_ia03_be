import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    // Yêu cầu NestJS "tiêm" (inject) JwtService vào đây
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private userService: UserService,
        private jwtService: JwtService
    ) { }
    /**
     * Xử lý logic đăng nhập
     * @param loginDto Dữ liệu email/password từ frontend
     */
    async login(loginDto: any) {
        // 1. Tìm user trong database
        const user = await this.userService.validateUser(loginDto.email, loginDto.password);


        // 2. Tạo payload (nội dung) cho 2 loại token
        // Access token payload (chứa thông tin user)
        const accessTokenPayload = {
            sub: user.id, // 'sub' (subject) là quy ước chuẩn cho user ID
            email: user.email,
            created_at: user.createdAt,
            name: user.name,
        };

        // Refresh token payload (chỉ cần user ID)
        const refreshTokenPayload = {
            sub: user.id,
        };

        // 3. Ký (sign) và tạo ra 2 token
        const [accessToken, refreshToken] = await Promise.all([
            // Access Token (hết hạn 15m, như đã cài trong module)
            this.jwtService.signAsync(accessTokenPayload),

            // Refresh Token (cần cài thời gian hết hạn dài hơn)
            this.jwtService.signAsync(refreshTokenPayload, {
                secret: jwtConstants.secret, // Dùng cùng key bí mật
                expiresIn: '7d', // Hết hạn trong 7 ngày
            }),
        ]);

        // 4. Trả về cho frontend
        return {
            accessToken,
            refreshToken,
        };
    }

    /**
   * Tạo Access Token mới từ Refresh Token payload
   * @param userPayload Payload từ RefreshTokenStrategy (ví dụ: { userId: '123' })
   */
    async refreshAccessToken(userPayload: any) {
        // 1. (Dự án thật) Bạn sẽ kiểm tra xem userId có tồn tại
        // và refresh token có bị thu hồi (revoke) hay không.
        // Ở đây chúng ta bỏ qua, vì userPayload đã được xác thực là hợp lệ.

        // 2. Lấy thông tin user đầy đủ (giả lập)
        // Chúng ta cần thông tin đầy đủ để tạo Access Token "rich payload"
        const user = await this.usersRepository.findOne({ where: { id: userPayload.userId } });
        if (!user) {
            throw new UnauthorizedException('User không tồn tại');
        }

        // 3. Tạo Access Token payload mới (rich payload)
        const accessTokenPayload = {
            sub: user.id,
            email: user.email,
            created_at: user.createdAt,
            name: user.name,
        };

        // 4. Ký và trả về Access Token mới
        const accessToken = await this.jwtService.signAsync(accessTokenPayload);

        return {
            accessToken,
        };
    }

}