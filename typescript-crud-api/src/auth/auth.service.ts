import config from '../../config.json';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../_helpers/db';
import { UserCreationAttributes } from '../user/user.model';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './auth.types';

const SECRET_KEY = config.jwtSecret;
export const authService = {
    login,
    register
};

async function login(params: LoginRequest): Promise<LoginResponse> {
    const { email, password } = params;

    const user = await db.User.scope('withHash').findOne({ where: { email } });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    return {
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }
    };
}

async function register(params: RegisterRequest): Promise<RegisterResponse> {
    const existing = await db.User.findOne({ where: { email: params.email } });
    if (existing) {
        throw new Error(`Email "${params.email}" is already registered`);
    }

    const passwordHash = await bcrypt.hash(params.password, 10);

    await db.User.create({
        title: params.title,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        passwordHash,
        role: params.role || 'User'
    } as UserCreationAttributes);

    return { message: 'Registration successful' };
}