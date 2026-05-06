"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestService = void 0;
// src/requests/request.service.ts
const db_1 = require("../_helpers/db");
exports.requestService = {
    getAll,
    getById,
    getByEmail,
    create,
    updateStatus,
    delete: _delete
};
async function getAll() {
    const requests = await db_1.db.Request.findAll();
    return requests.map(parseItems);
}
async function getById(id) {
    return parseItems(await getRequest(id));
}
async function getByEmail(email) {
    const requests = await db_1.db.Request.findAll({ where: { employeeEmail: email } });
    return requests.map(parseItems);
}
async function create(params) {
    await db_1.db.Request.create({
        ...params,
        items: JSON.stringify(params.items), // store items as JSON string
        status: 'Pending',
        date: new Date().toLocaleDateString()
    });
}
async function updateStatus(id, status) {
    const req = await getRequest(id);
    await req.update({ status });
}
async function _delete(id) {
    const req = await getRequest(id);
    await req.destroy();
}
async function getRequest(id) {
    const req = await db_1.db.Request.findByPk(id);
    if (!req)
        throw new Error('Request not found');
    return req;
}
// parse items from JSON string back to array
function parseItems(req) {
    try {
        req.items = JSON.parse(req.items);
    }
    catch {
        req.items = [];
    }
    return req;
}
