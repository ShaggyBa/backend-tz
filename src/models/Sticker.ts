import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Session, User } from '.';
import { StickerAttributes, StickerCreationAttributes } from '../types';

@Table({ tableName: 'stickers' })
export class Sticker
  extends Model<StickerAttributes, StickerCreationAttributes>
  implements StickerAttributes
{
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

  @Column({ type: DataType.STRING, allowNull: false })
  declare text: string;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  declare x: number;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  declare y: number;

  @Column(DataType.STRING)
  declare color?: string | null;

  @Column(DataType.DATE)
  declare createdAt?: Date;

  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
