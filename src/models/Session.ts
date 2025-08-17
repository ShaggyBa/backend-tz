import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { SessionParticipant, Sticker, User } from '.';
import { SessionAttributes, SessionCreationAttributes } from '../types';

@Table({ tableName: 'sessions' })
export class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare name: string;

  @Column(DataType.DATE)
  declare createdAt?: Date;

  @Column(DataType.DATE)
  declare updatedAt?: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare ownerId: string;

  @HasMany(() => SessionParticipant)
  declare participants?: SessionParticipant[];

  @HasMany(() => Sticker)
  declare stickers?: Sticker[];

  @BelongsToMany(() => User, () => SessionParticipant)
  declare users?: User[];
}
