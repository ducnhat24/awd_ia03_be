import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async register(createUserDto: CreateUserDto) {
        const { email, password } = createUserDto;

        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }

        const salt = await bcrypt.genSalt();
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = this.usersRepository.create({
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
}