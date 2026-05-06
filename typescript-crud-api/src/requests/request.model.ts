// src/requests/request.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface RequestAttributes {
    id: number;
    type: string;
    items: string;
    status: string;
    date: string;
    employeeEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RequestCreationAttributes
    extends Optional<RequestAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Request
    extends Model<RequestAttributes, RequestCreationAttributes>
    implements RequestAttributes {

    public id!: number;
    public type!: string;
    public items!: string;
    public status!: string;
    public date!: string;
    public employeeEmail!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof Request {
    Request.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            items: {
                type: DataTypes.TEXT, // store as JSON string
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Pending'
            },
            date: {
                type: DataTypes.STRING,
                allowNull: false
            },
            employeeEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            sequelize,
            modelName: 'Request',
            tableName: 'requests',
            timestamps: true
        }
    );

    return Request;
}