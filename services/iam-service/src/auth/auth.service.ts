import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { signUpDto } from './dto/RegisterUserDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { signInDto } from './dto/LoginUserDto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService    
    ) {}

    async signUp(dto: signUpDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({where: {email: dto.email}})
            if (existingUser) {
                throw new ConflictException('user already exists')
            }
        
            if (dto.confirmPassword !== dto.password) {
                throw new UnauthorizedException("passwords don't match")
            }

            const hash = await bcrypt.hash(dto.password, 10)


            const create = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    email: dto.email,
                    password: hash
                }
            })

            return create
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('cretentials errors')
                }
            }
            throw error
        }
    }

    async signIn(dto: signInDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({where: {email: dto.email}})
            if (!existingUser) {
                throw new NotFoundException('user not found')
            }
            

            const undecoded = await bcrypt.compare(dto.password, existingUser.password)
            if (!undecoded) {
                throw new UnauthorizedException("passwords don't match")
            }

            const payload = {email: existingUser.email}
            const accessToken = await this.jwt.signAsync(payload, {
                expiresIn: '1h',
                secret: process.env.JWT_TOKEN
            })

            const refreshToken = await this.jwt.signAsync(payload, {
                expiresIn: '3h',
                secret: process.env.JWT_TOKEN
            })
        
            return {
                accessToken,
                refreshToken
            }
        } catch(error) {
            throw error
        }
    }


}
