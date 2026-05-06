// src/_helpers/db.ts
import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export interface Database {
    User: any;
    Department: any;
    Employee: any;
    Request: any;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    // this part we will create database only is not exist
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // this part will make database connect to sequelize
    const sequelize = new Sequelize(database, user, password, {dialect: 'mysql'});

    //initialize models
    const { default: userModel } = await import('../user/user.model');
    const { default: departmentModel } = await import('../departments/department.model');
    const { default: employeeModel } = await import('../employees/employee.model');
    const { default: requestModel } = await import('../requests/request.model');

    db.User = userModel(sequelize);
    db.Department = departmentModel(sequelize);
    db.Employee = employeeModel(sequelize);
    db.Request = requestModel(sequelize);

    // Sync models with database
    await sequelize.sync({ alter: true });

    console.log('Database initialized and models synced');
}

