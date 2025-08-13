import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SessionParticipant } from '.';
import { Sticker } from './Sticker';
import { UserAttributes, UserCreationAttributes } from '../types';

@Table({ tableName: 'users' })
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	declare email: string;

	@Column(DataType.STRING)
	declare name?: string | null;

	@Column({ type: DataType.STRING, allowNull: false })
	declare passwordHash: string; // TODO заглушка для пароля

	@Column(DataType.STRING)
	declare jwtToken?: string; // TODO заглушка для токена

	@Column(DataType.DATE)
	declare createdAt?: Date;

	@Column(DataType.DATE)
	declare updatedAt?: Date;

	@HasMany(() => Sticker)
	declare stickers?: Sticker[];

	@HasMany(() => SessionParticipant)
	declare sessions?: SessionParticipant[];
}
