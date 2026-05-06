"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./_middleware/errorHandler");
const auth_1 = require("./_middleware/auth");
const db_1 = require("./_helpers/db");
const users_controller_1 = __importDefault(require("./user/users.controller"));
const auth_controller_1 = __importDefault(require("./auth/auth.controller"));
const department_controller_1 = __importDefault(require("./departments/department.controller"));
const employee_controller_1 = __importDefault(require("./employees/employee.controller"));
const request_controller_1 = __importDefault(require("./requests/request.controller"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500']
}));
app.use(express_1.default.static('public'));
// API ROUTES
app.use('/auth', auth_controller_1.default);
app.use('/users', auth_1.authenticateToken, users_controller_1.default);
app.use('/departments', auth_1.authenticateToken, department_controller_1.default);
app.use('/employees', auth_1.authenticateToken, employee_controller_1.default);
app.use('/requests', auth_1.authenticateToken, request_controller_1.default);
// 🔓 FOR TESTING ONLY:
// 👉 Erase "//" below to make all routes PUBLIC (no JWT required)
// 👉 Also comment the protected routes above
// app.use('/users', usersController);
// app.use('/departments', departmentsController);
// app.use('/employees', employeesController);
// app.use('/requests', requestsController);
//Global Error Handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start Server + Initialize Database
const PORT = process.env.PORT || 4000;
(0, db_1.initialize)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🔐 Test with: POST /users with { email, password, ... }`);
    });
})
    .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});
