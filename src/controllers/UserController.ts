import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { User } from '../models';
import { UserCreationAttributes, CreateUserDTO, UpdateUserDTO } from '../types';   // z.infer types

export class UserController {
	constructor(private userModel: ModelStatic<User>) { }

	// POST /api/users
	create = async (req: Request<{}, {}, CreateUserDTO>, res: Response, next: NextFunction) => {
		try {
			const dto = req.body;
			// TODO: хешировать пароль перед сохранением
			const payload: UserCreationAttributes = {
				email: dto.email,
				name: dto.name ?? null,
				passwordHash: dto.password ?? ''
			};
			const user = await this.userModel.create(payload);
			return res.status(201).json(user);
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/users
	list = async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const users = await this.userModel.findAll();
			return res.json(users);
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/users/:id
	getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			if (!id) return res.status(400).json({ error: 'Missing id' });

			const user = await this.userModel.findByPk(id);
			if (!user) return res.status(404).json({ error: 'User not found' });
			return res.json(user);
		} catch (err) {
			return next(err);
		}
	};

	// PATCH /api/users/:id
	update = async (req: Request<{ id: string }, {}, UpdateUserDTO>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			console.log(id)
			if (!id) return res.status(400).json({ error: 'Missing id' });

			const dto = req.body;
			const user = await this.userModel.findByPk(id);
			if (!user) return res.status(404).json({ error: 'User not found' });

			const updated = await user.update({
				email: dto.email ?? user.email,
				name: dto.name ?? user.name,
				passwordHash: dto.password ? dto.password : user.passwordHash, // TODO: хешировать
				jwtToken: dto.jwtToken ?? user.jwtToken
			} as Partial<UserCreationAttributes>);

			return res.json(updated);
		} catch (err) {
			return next(err);
		}
	};

	// DELETE /api/users/:id
	delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			if (!id) return res.status(400).json({ error: 'Missing id' });

			const user = await this.userModel.findByPk(id);
			if (!user) return res.status(404).json({ error: 'User not found' });

			await user.destroy();
			return res.json({ message: 'Deleted' });
		} catch (err) {
			return next(err);
		}
	};
}
