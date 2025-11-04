import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants'; // Import key bí mật
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    // Trả về object user đầy đủ (không gồm password_hash)
    async validate(payload: any) {
        const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
        if (!user) return { userId: payload.sub, email: payload.email };

        const { password_hash, ...rest } = user as any;
        return rest; // sẽ được gán vào req.user
    }
}