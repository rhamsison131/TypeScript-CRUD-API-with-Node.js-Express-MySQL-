// src/requests/request.service.ts
import { db } from '../_helpers/db';
import { Request, RequestCreationAttributes } from './request.model';

export const requestService = {
    getAll,
    getById,
    getByEmail,
    create,
    updateStatus,
    delete: _delete
};

async function getAll(): Promise<Request[]> {
    const requests = await db.Request.findAll();
    return requests.map(parseItems);
}

async function getById(id: number): Promise<Request> {
    return parseItems(await getRequest(id));
}

async function getByEmail(email: string): Promise<Request[]> {
    const requests = await db.Request.findAll({ where: { employeeEmail: email } });
    return requests.map(parseItems);
}

async function create(params: RequestCreationAttributes): Promise<void> {
    await db.Request.create({
        ...params,
        items: JSON.stringify(params.items), // store items as JSON string
        status: 'Pending',
        date: new Date().toLocaleDateString()
    });
}

async function updateStatus(id: number, status: string): Promise<void> {
    const req = await getRequest(id);
    await req.update({ status });
}

async function _delete(id: number): Promise<void> {
    const req = await getRequest(id);
    await req.destroy();
}

async function getRequest(id: number): Promise<Request> {
    const req = await db.Request.findByPk(id);
    if (!req) throw new Error('Request not found');
    return req;
}

// parse items from JSON string back to array
function parseItems(req: any): any {
    try {
        req.items = JSON.parse(req.items);
    } catch {
        req.items = [];
    }
    return req;
}