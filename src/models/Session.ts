import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { SessionParticipant } from './SessionParticipant';
import { Sticker } from './Sticker';
import { SessionAttributes, SessionCreationAttributes } from '../types';


@Table({ tableName: 'sessions' })
export class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
	declare id: number;

	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	declare name: string;

	@Column(DataType.DATE)
	declare createdAt?: Date;

	@Column(DataType.DATE)
	declare updatedAt?: Date;

	@HasMany(() => SessionParticipant)
	declare participants?: SessionParticipant[];

	@HasMany(() => Sticker)
	declare stickers?: Sticker[];
}
