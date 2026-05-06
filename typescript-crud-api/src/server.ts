// src/server.ts
import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './_middleware/errorHandler';
import { authenticateToken, authorizeRole } from './_middleware/auth';
import { initialize } from './_helpers/db';
import usersController from './user/users.controller';
import authController from './auth/auth.controller';
import departmentsController from './departments/department.controller';
import employeesController from './employees/employee.controller';
import requestsController from './requests/request.controller';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500']
}));
app.use(express.static('public'));
    
// API ROUTES
app.use('/auth', authController);
app.use('/users', authenticateToken, usersController);
app.use('/departments', authenticateToken, departmentsController);
app.use('/employees', authenticateToken, employeesController);
app.use('/requests', authenticateToken, requestsController);

// 🔓 FOR TESTING ONLY:
// 👉 Erase "//" below to make all routes PUBLIC (no JWT required)
// 👉 Also comment the protected routes above

// app.use('/users', usersController);
// app.use('/departments', departmentsController);
// app.use('/employees', employeesController);
// app.use('/requests', requestsController);

//Global Error Handler (must be last)
app.use(errorHandler);


// Start Server + Initialize Database
const PORT = process.env.PORT || 4000;

initialize()
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