// src/employees/employee.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface EmployeeAttributes {
    id: number;
    employeeId: string;
    userEmail: string;
    position: string;
    deptId: number;
    hireDate: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface EmployeeCreationAttributes
    extends Optional<EmployeeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Employee
    extends Model<EmployeeAttributes, EmployeeCreationAttributes>
    implements EmployeeAttributes {

    public id!: number;
    public employeeId!: string;
    public userEmail!: string;
    public position!: string;
    public deptId!: number;
    public hireDate!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof Employee {
    Employee.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            employeeId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            userEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            position: {
                type: DataTypes.STRING,
                allowNull: false
            },
            deptId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            hireDate: {
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
            modelName: 'Employee',
            tableName: 'employees',
            timestamps: true
        }
    );

    return Employee;
}