import config from '../../config.json';
import { createConnection } from 'mysql2/promise';
import console from 'node:console';
import { Sequelize, type ModelCtor, type Model } from 'sequelize';

export interface Database {
    User: ModelCtor<Model<any, any>>;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    try {
        // Create a connection to the MySQL server
        const connection = await createConnection({
            host,
            port,
            user,
            password,
            database
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();

        // Initialize Sequelize
        const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });
        
        const {default: UserModel} = await import('../users/user.model');
        db.User = UserModel(sequelize);

        await sequelize.sync({ alter: true });
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed', error);
        throw error;
    }
}