"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
exports.default = default_1;
// src/employees/employee.model.ts
const sequelize_1 = require("sequelize");
class Employee extends sequelize_1.Model {
}
exports.Employee = Employee;
function default_1(sequelize) {
    Employee.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        employeeId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userEmail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        position: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        deptId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        hireDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Employee',
        tableName: 'employees',
        timestamps: true
    });
    return Employee;
}
