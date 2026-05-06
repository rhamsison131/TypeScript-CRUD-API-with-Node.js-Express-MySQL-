"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../_helpers/db");
const SECRET_KEY = config_json_1.default.jwtSecret;
exports.authService = {
    login,
    register
};
async function login(params) {
    const { email, password } = params;
    const user = await db_1.db.User.scope('withHash').findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, SECRET_KEY, { expiresIn: '1h' });
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
async function register(params) {
    const existing = await db_1.db.User.findOne({ where: { email: params.email } });
    if (existing) {
        throw new Error(`Email "${params.email}" is already registered`);
    }
    const passwordHash = await bcryptjs_1.default.hash(params.password, 10);
    await db_1.db.User.create({
        title: params.title,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        passwordHash,
        role: params.role || 'User'
    });
    return { message: 'Registration successful' };
}
