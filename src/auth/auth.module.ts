import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport'; // <-- Import
import { JwtModule } from '@nestjs/jwt';           // <-- Import
import { jwtConstants } from './constants';       // <-- Import
import { JwtStrategy } from './strategies/jwt.strategy'; // <-- Import
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'; // <-- Import
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule { }
