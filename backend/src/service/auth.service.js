import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/client.js';
import { envConfig } from '../config/env.config.js';

export class AuthService {
  async register({ firstName, lastName, email, password, phone, role = 'PHARMACIST' }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if email already registered
    const existingUser = await db.query(
      'SELECT id FROM "User" WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // 3. Insert user into PostgreSQL
    const result = await db.query(
      `INSERT INTO "User" ("firstName", "lastName", "name", "email", "password", "phone", "role")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING "id", "firstName", "lastName", "name", "email", "phone", "role", "createdAt"`,
      [firstName.trim(), lastName.trim(), fullName, normalizedEmail, hashedPassword, phone.trim(), role]
    );

    const user = result.rows[0];

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      envConfig.jwtSecret,
      { expiresIn: envConfig.jwtExpiresIn }
    );

    return { user, token };
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch user by email
    const result = await db.query(
      'SELECT * FROM "User" WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      envConfig.jwtSecret,
      { expiresIn: envConfig.jwtExpiresIn }
    );

    // Remove password from returned user object
    delete user.password;

    return { user, token };
  }
}

export const authService = new AuthService();

