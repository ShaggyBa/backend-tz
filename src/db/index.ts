import { Sequelize } from 'sequelize-typescript';
import { User, Sticker, Session, SessionParticipant } from '../models/index.js';
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const configEnv: dotEnv.DotenvConfigOutput = dotEnv.config();
dotenvExpand.expand(configEnv);

const connectionString: string | undefined = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

export const sequelize: Sequelize = new Sequelize(connectionString, {
	dialect: 'postgres',
	protocol: 'postgres',
	logging: process.env.NODE_ENV === 'production' ? false : console.log,
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	models: [User, Sticker, Session, SessionParticipant],
	dialectOptions: process.env.NODE_ENV === 'production'
		? { ssl: { rejectUnauthorized: false } }
		: {}
});

export async function connectDB(): Promise<void> {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
		throw error;
	}
}