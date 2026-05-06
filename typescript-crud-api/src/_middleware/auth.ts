import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config.json';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ message: 'Access token required' });
        return;
    }

    jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ message: 'Invalid or expired token' });
            return;
        }
        (req as any).user = decoded;
        next();
    });
}

export function authorizeRole(role: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;
        if (user.role !== role) {
            res.status(403).json({ message: 'Access denied: insufficient permissions' });
            return;
        }
        next();
    };
}