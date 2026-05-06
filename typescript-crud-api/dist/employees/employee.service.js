"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = void 0;
// src/employees/employee.service.ts
const db_1 = require("../_helpers/db");
exports.employeeService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
async function getAll() {
    return await db_1.db.Employee.findAll();
}
async function getById(id) {
    return await getEmployee(id);
}
async function create(params) {
    const existing = await db_1.db.Employee.findOne({ where: { employeeId: params.employeeId } });
    if (existing) {
        throw new Error(`Employee ID "${params.employeeId}" already exists`);
    }
    await db_1.db.Employee.create(params);
}
async function update(id, params) {
    const emp = await getEmployee(id);
    await emp.update(params);
}
async function _delete(id) {
    const emp = await getEmployee(id);
    await emp.destroy();
}
async function getEmployee(id) {
    const emp = await db_1.db.Employee.findByPk(id);
    if (!emp)
        throw new Error('Employee not found');
    return emp;
}
