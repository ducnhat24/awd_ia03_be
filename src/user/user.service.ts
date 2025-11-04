import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }

        const salt = await bcrypt.genSalt();
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = this.usersRepository.create({
            name,
            email,
            password_hash,
        });

        try {
            await this.usersRepository.save(newUser);

            const { password_hash, ...result } = newUser;
            return {
                message: 'Đăng ký thành công!',
                user: result,
            };
        } catch (error) {
            throw new InternalServerErrorException('Đã xảy ra lỗi khi đăng ký');
        }
    }

    /**
     * Lấy user theo id, loại bỏ trường password_hash trước khi trả về
     */
    async findById(id: string) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) return null;
        const { password_hash, ...rest } = user as any;
        return rest;
    }

    //validate user for login
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
    }
}