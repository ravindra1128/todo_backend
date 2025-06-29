import { Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mysecret';

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || name.trim() === '' || password.trim() === '' || email.trim() === '') {
        res.status(400).json({ message: 'All fields are required' });
    }

    try {

        const isExistigUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if(!isExistigUser.rowCount || isExistigUser?.rowCount > 0 ) { 
            res.status(409).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
            [email, hashedPassword, name]
        );
        res.status(201).json({
            user: result.rows[0],
            message: 'User created successfully'
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if(!email || password.trim() === '' || email.trim() === '') {
        res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const result  = await pool.query('SELECT * from users WHERE email = $1',[email]);
        if(result.rowCount === 0) {
            res.status(404).json({message:"User not found with this email"})
        }
        const user = result.rows[0];

        const pwdMatch = await bcrypt.compare(password, user.password)
        if(!pwdMatch) res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({id: user.id, email: user.email}, SECRET)
        res.status(200).json({token: token, messsage: "User login succesfuly"})
    } catch (err) {
        console.error('Error login user:', err);
        res.status(500).json({ message: 'Server error' });
    }
}