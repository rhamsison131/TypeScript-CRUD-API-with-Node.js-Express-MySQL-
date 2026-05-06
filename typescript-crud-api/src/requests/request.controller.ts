// src/requests/requests.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { requestService } from './request.service';

const router = Router();

// ROUTES
router.get('/', getAll);
router.get('/email/:email', getByEmail);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id/status', updateStatus);
router.delete('/:id', _delete);

export default router;

// Route Handlers
function getAll(req: Request, res: Response, next: NextFunction): void {
    requestService.getAll()
        .then(requests => res.json(requests))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    requestService.getById(Number(req.params.id))
        .then(request => res.json(request))
        .catch(next);
}

function getByEmail(req: Request, res: Response, next: NextFunction): void {
    requestService.getByEmail(req.params.email as string)
        .then(requests => res.json(requests))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    requestService.create(req.body)
        .then(() => res.json({ message: 'Request created' }))
        .catch(next);
}

function updateStatus(req: Request, res: Response, next: NextFunction): void {
    requestService.updateStatus(Number(req.params.id), req.body.status)
        .then(() => res.json({ message: 'Request status updated' }))
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    requestService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'Request deleted' }))
        .catch(next);
}

// Validation Schemas
function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        type: Joi.string().valid('equipment', 'leave', 'resources').required(),
        items: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                qty: Joi.alternatives().try(Joi.string(), Joi.number()).required()
            })
        ).min(1).required(),
        employeeEmail: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}