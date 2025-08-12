import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './Session';
import { User } from './User';
import { SessionParticipantAttributes, SessionParticipantCreationAttributes } from '../types';

@Table({ tableName: 'session_participants' })
export class SessionParticipant extends Model<
	SessionParticipantAttributes,
	SessionParticipantCreationAttributes
> implements SessionParticipantAttributes {
	declare id: number;

	@ForeignKey(() => Session)
	@Column({ type: DataType.INTEGER, allowNull: false })
	declare sessionId: number;

	@BelongsTo(() => Session)
	declare session?: Session;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	declare userId: number;

	@BelongsTo(() => User)
	declare user?: User;

	@Column(DataType.STRING)
	declare role?: string | null;

	@Column(DataType.DATE)
	declare createdAt?: Date;

	@Column(DataType.DATE)
	declare updatedAt?: Date;
}
