"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const employee_service_1 = require("./employee.service");
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
    employee_service_1.employeeService.getAll()
        .then(emps => res.json(emps))
        .catch(next);
}
function getById(req, res, next) {
    employee_service_1.employeeService.getById(Number(req.params.id))
        .then(emp => res.json(emp))
        .catch(next);
}
function create(req, res, next) {
    employee_service_1.employeeService.create(req.body)
        .then(() => res.json({ message: 'Employee created' }))
        .catch(next);
}
function update(req, res, next) {
    employee_service_1.employeeService.update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Employee updated' }))
        .catch(next);
}
function _delete(req, res, next) {
    employee_service_1.employeeService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'Employee deleted' }))
        .catch(next);
}
// Validation Schemas
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        employeeId: joi_1.default.string().required(),
        userEmail: joi_1.default.string().email().required(),
        position: joi_1.default.string().required(),
        deptId: joi_1.default.number().required(),
        hireDate: joi_1.default.string().required()
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
function updateSchema(req, res, next) {
    const schema = joi_1.default.object({
        employeeId: joi_1.default.string().empty(''),
        userEmail: joi_1.default.string().email().empty(''),
        position: joi_1.default.string().empty(''),
        deptId: joi_1.default.number().empty(''),
        hireDate: joi_1.default.string().empty('')
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
