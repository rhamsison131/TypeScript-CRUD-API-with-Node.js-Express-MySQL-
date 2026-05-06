"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const request_service_1 = require("./request.service");
const router = (0, express_1.Router)();
// ROUTES
router.get('/', getAll);
router.get('/email/:email', getByEmail);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id/status', updateStatus);
router.delete('/:id', _delete);
exports.default = router;
// Route Handlers
function getAll(req, res, next) {
    request_service_1.requestService.getAll()
        .then(requests => res.json(requests))
        .catch(next);
}
function getById(req, res, next) {
    request_service_1.requestService.getById(Number(req.params.id))
        .then(request => res.json(request))
        .catch(next);
}
function getByEmail(req, res, next) {
    request_service_1.requestService.getByEmail(req.params.email)
        .then(requests => res.json(requests))
        .catch(next);
}
function create(req, res, next) {
    request_service_1.requestService.create(req.body)
        .then(() => res.json({ message: 'Request created' }))
        .catch(next);
}
function updateStatus(req, res, next) {
    request_service_1.requestService.updateStatus(Number(req.params.id), req.body.status)
        .then(() => res.json({ message: 'Request status updated' }))
        .catch(next);
}
function _delete(req, res, next) {
    request_service_1.requestService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'Request deleted' }))
        .catch(next);
}
// Validation Schemas
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        type: joi_1.default.string().valid('equipment', 'leave', 'resources').required(),
        items: joi_1.default.array().items(joi_1.default.object({
            name: joi_1.default.string().required(),
            qty: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.number()).required()
        })).min(1).required(),
        employeeEmail: joi_1.default.string().email().required()
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
