"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
// src/departments/department.service.ts
const db_1 = require("../_helpers/db");
exports.departmentService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
async function getAll() {
    return await db_1.db.Department.findAll();
}
async function getById(id) {
    return await getDepartment(id);
}
async function create(params) {
    const existing = await db_1.db.Department.findOne({ where: { name: params.name } });
    if (existing) {
        throw new Error(`Department "${params.name}" already exists`);
    }
    await db_1.db.Department.create(params);
}
async function update(id, params) {
    const dept = await getDepartment(id);
    await dept.update(params);
}
async function _delete(id) {
    const dept = await getDepartment(id);
    await dept.destroy();
}
async function getDepartment(id) {
    const dept = await db_1.db.Department.findByPk(id);
    if (!dept)
        throw new Error('Department not found');
    return dept;
}
