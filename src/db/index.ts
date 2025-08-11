import { Sequelize } from 'sequelize';
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';


const configEnv = dotEnv.config();
dotenvExpand.expand(configEnv);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

export const sequelize = new Sequelize(connectionString, {
	dialect: 'postgres',
	protocol: 'postgres',
	logging: process.env.NODE_ENV === 'production' ? false : console.log,
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	dialectOptions: process.env.NODE_ENV === 'production'
		? { ssl: { rejectUnauthorized: false } }
		: {}
});
