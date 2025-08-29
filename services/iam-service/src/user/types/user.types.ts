import { User as PrismaUser, Roles } from '@prisma/client';

export type User = PrismaUser & {
  roles: Roles[];
};

export type CreateUserInput = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'refreshToken'
> & {
  password: string;
};

export type UpdateUserInput = Partial<
  Omit<CreateUserInput, 'email' | 'password'>
>;

export type UserResponse = Omit<User, 'password' | 'refreshToken'>;
