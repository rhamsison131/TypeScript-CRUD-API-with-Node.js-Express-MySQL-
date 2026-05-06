"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.authorizeRole = authorizeRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_json_1 = __importDefault(require("../../config.json"));
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({ message: 'Access token required' });
        return;
    }
    jsonwebtoken_1.default.verify(token, config_json_1.default.jwtSecret, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: 'Invalid or expired token' });
            return;
        }
        req.user = decoded;
        next();
    });
}
function authorizeRole(role) {
    return (req, res, next) => {
        const user = req.user;
        if (user.role !== role) {
            res.status(403).json({ message: 'Access denied: insufficient permissions' });
            return;
        }
        next();
    };
}
