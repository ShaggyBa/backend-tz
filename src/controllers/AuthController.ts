import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { User } from '../models';
import { UserCreationAttributes } from '../types';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { hashPassword, comparePasswords } from '../utils/password';
import "dotenv/config";
import { timeToNum } from '../utils/timeToNum';

export class AuthController {
	constructor(private userModel: ModelStatic<User>) { }

	// POST /api/auth/register
	register = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, name, password } = req.body as { email: string; name?: string; password: string };

			if (!email || !password) return res.status(400).json({ error: 'email and password required' });

			const existing = await this.userModel.findOne({ where: { email } });
			if (existing) return res.status(409).json({ error: 'User already exists' });

			const passwordHash = await hashPassword(password);
			const payload: UserCreationAttributes = { email, name: name ?? null, passwordHash };

			const user = await this.userModel.create(payload);

			const access = signAccessToken({ userId: user.id });
			const refresh = signRefreshToken({ userId: user.id });

			await user.update({ jwtToken: refresh });

			res.cookie('refreshToken', refresh, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: timeToNum(process.env.JWT_REFRESH_EXPIRES) || 7 * 24 * 60 * 60,
			});

			const { passwordHash: _ph, ...safe } = user.toJSON() as any;
			return res.status(201).json({ user: safe, accessToken: access, refreshToken: refresh });
		} catch (err) {
			return next(err);
		}
	};

	// POST /api/auth/login
	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body as { email: string; password: string };
			if (!email || !password) return res.status(400).json({ error: 'email and password required' });

			const user = await this.userModel.findOne({ where: { email } });
			if (!user) return res.status(401).json({ error: 'Invalid credentials' });

			const valid = await comparePasswords(password, user.passwordHash);
			if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

			const access = signAccessToken({ userId: user.id });
			const refresh = signRefreshToken({ userId: user.id });

			await user.update({ jwtToken: refresh });

			res.cookie('refreshToken', refresh, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: timeToNum(process.env.JWT_REFRESH_EXPIRES) || 7 * 24 * 60 * 60
			});

			const { passwordHash: _ph, ...safe } = user.toJSON() as any;
			return res.json({ user: safe, accessToken: access, refreshToken: refresh });
		} catch (err) {
			return next(err);
		}
	};

	// POST /api/auth/refresh
	refresh = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const refreshToken = req.body.refreshToken ?? req.cookies?.refreshToken;
			if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

			const payload = verifyToken(refreshToken);
			if (!payload) return res.status(401).json({ error: 'Invalid refresh token' });

			const user = await User.findByPk(payload.userId);
			if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

			if (!user.jwtToken || user.jwtToken !== refreshToken) {
				return res.status(401).json({ error: 'Refresh token revoked' });
			}

			const newAccess = signAccessToken({ userId: user.id });
			const newRefresh = signRefreshToken({ userId: user.id });

			await user.update({ jwtToken: newRefresh });

			res.cookie('refreshToken', newRefresh, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: timeToNum(process.env.JWT_REFRESH_EXPIRES) || 7 * 24 * 60 * 60
			});

			return res.json({ accessToken: newAccess, refreshToken: newRefresh });
		} catch (err) {
			next(err);
		}
	};
	// POST /api/auth/logout
	logout = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).userId;
			if (!userId) return res.status(401).json({ error: 'Unauthorized' });

			const user = await this.userModel.findByPk(userId);
			if (!user) return res.status(404).json({ error: 'User not found' });

			await user.update({ jwtToken: null });

			res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });


			return res.json({ ok: true });
		} catch (err) {
			next(err);
		}
	};
}
