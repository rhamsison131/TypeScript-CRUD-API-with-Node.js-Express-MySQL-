"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const auth_service_1 = require("./auth.service");
const router = (0, express_1.Router)();
router.post('/login', loginSchema, login);
router.post('/register', registerSchema, register);
exports.default = router;
// ================
// LOGIN
// ================
function loginSchema(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.empty': 'Email is required',
            'any.required': 'Email is required',
            'string.email': 'Email must be a valid email'
        }),
        password: joi_1.default.string().min(1).required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
    });
    const options = {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: false
    };
    const { error, value } = schema.validate(req.body || {}, options);
    if (error) {
        next(`Validation error: ${error.details.map((d) => d.message).join(', ')}`);
        return;
    }
    req.body = value;
    next();
}
async function login(req, res, next) {
    try {
        const result = await auth_service_1.authService.login(req.body);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
// ================
// REGISTER
// ================
function registerSchema(req, res, next) {
    const schema = joi_1.default.object({
        title: joi_1.default.string().required().messages({
            'string.empty': 'Title is required',
            'any.required': 'Title is required'
        }),
        firstName: joi_1.default.string().required().messages({
            'string.empty': 'First name is required',
            'any.required': 'First name is required'
        }),
        lastName: joi_1.default.string().required().messages({
            'string.empty': 'Last name is required',
            'any.required': 'Last name is required'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.empty': 'Email is required',
            'any.required': 'Email is required',
            'string.email': 'Email must be a valid email'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required',
            'string.min': 'Password must be at least 6 characters'
        }),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required().messages({
            'string.empty': 'Confirm password is required',
            'any.required': 'Confirm password is required',
            'any.only': 'Passwords do not match'
        }),
        role: joi_1.default.string().valid('Admin', 'User').default('User').messages({
            'any.only': 'Role must be Admin or User'
        })
    });
    const options = {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: false
    };
    const { error, value } = schema.validate(req.body || {}, options);
    if (error) {
        next(`Validation error: ${error.details.map((d) => d.message).join(', ')}`);
        return;
    }
    req.body = value;
    next();
}
async function register(req, res, next) {
    try {
        const result = await auth_service_1.authService.register(req.body);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
}
