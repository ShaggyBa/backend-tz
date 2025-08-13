import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './Session';
import { User } from './User';
import { SessionParticipantAttributes, SessionParticipantCreationAttributes } from '../types';

@Table({ tableName: 'session_participants' })
export class SessionParticipant extends Model<
	SessionParticipantAttributes,
	SessionParticipantCreationAttributes
> implements SessionParticipantAttributes {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => Session)
	@Column({ type: DataType.UUID, allowNull: false })
	declare sessionId: string;

	@BelongsTo(() => Session)
	declare session?: Session;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID, allowNull: false })
	declare userId: string;

	@BelongsTo(() => User)
	declare user?: User;

	@Column(DataType.STRING)
	declare role?: string | null;

	@Column(DataType.DATE)
	declare createdAt?: Date;

	@Column(DataType.DATE)
	declare updatedAt?: Date;
}
