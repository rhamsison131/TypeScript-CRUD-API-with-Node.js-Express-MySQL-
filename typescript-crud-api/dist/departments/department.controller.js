"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const department_service_1 = require("./department.service");
const router = (0, express_1.Router)();
// ROUTES
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);
exports.default = router;
// Route Handlers
function getAll(req, res, next) {
    department_service_1.departmentService.getAll()
        .then(depts => res.json(depts))
        .catch(next);
}
function getById(req, res, next) {
    department_service_1.departmentService.getById(Number(req.params.id))
        .then(dept => res.json(dept))
        .catch(next);
}
function create(req, res, next) {
    department_service_1.departmentService.create(req.body)
        .then(() => res.json({ message: 'Department created' }))
        .catch(next);
}
function update(req, res, next) {
    department_service_1.departmentService.update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Department updated' }))
        .catch(next);
}
function _delete(req, res, next) {
    department_service_1.departmentService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'Department deleted' }))
        .catch(next);
}
// Validation Schemas
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().empty('')
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
function updateSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().empty(''),
        description: joi_1.default.string().empty('')
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
