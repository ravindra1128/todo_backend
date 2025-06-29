import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mysecret';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Missing token' })
        return
    };

    try {
        const user = jwt.verify(token, SECRET);
        (req as any).user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
