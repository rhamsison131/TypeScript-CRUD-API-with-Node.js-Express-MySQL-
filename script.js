// Stores the currently logged in user
let currentUser = null;

// Routes that require login
const login_hash = ['#/userProfile', '#/request'];

// Routes that require admin role
const admin_hash = ['#/accounts', '#/employees', '#/departments'];

// Change the URL hash to navigate to a different page/section
function navigateTo(hash) {
    window.location.hash = hash;
}

// helper function to get auth headers
function authHeaders() {
    const token = sessionStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Display the current user's profile information when the profile page is opened
function renderProfile() {
    const NameDisplay = document.getElementById('usernameDisplay');
    const profileClass = document.getElementById('profile-class');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileRole = document.getElementById('profile-role');

    if (NameDisplay) {
        NameDisplay.innerText = currentUser.Fname;
        profileClass.innerText = currentUser.role;
        profileName.innerText = currentUser.Fname + " " + currentUser.Lname;
        profileEmail.innerText = currentUser.email;
        profileRole.innerText = currentUser.role;
    }
}

// Update the authentication state of the application
function setAuthState(user) {
    currentUser = user;
    const body = document.body;
    body.classList.remove('not-authenticated', 'authenticated', 'is-admin');

    if (currentUser) {
        body.classList.add('authenticated');
        renderProfile();
        if (currentUser.role === 'admin') {
            body.classList.add('is-admin');
        }
    } else {
        body.classList.add('not-authenticated');
        sessionStorage.removeItem('auth_token'); // sessionStorage
        sessionStorage.removeItem('current_user'); // sessionStorage
    }

    handleRouting();
}

function handleRouting() {
    const hash = window.location.hash || '#/';
    console.log("location:" + hash);

    if ((login_hash.includes(hash) || admin_hash.includes(hash)) && !currentUser) {
        navigateTo('#/');
        return;
    }

    if (admin_hash.includes(hash) && currentUser.role !== 'admin') {
        navigateTo('#/userProfile');
        return;
    }

    const pages = document.querySelectorAll(".page");
    const verifyAlert = document.getElementById("verified-alert");

    pages.forEach(page => page.classList.remove('active'));

    let sectionId;
    if (hash === '#/' || hash === '') {
        sectionId = "homePage";
    } else if (hash === '#/register') {
        sectionId = "registerPage";
    } else if (hash.includes('#/login')) {
        sectionId = 'loginPage';
    } else if (hash === '#/verify') {
        sectionId = 'verifyPage';
    } else if (hash === '#/userProfile') {
        sectionId = 'profilePage';
    } else if (hash === '#/employees') {
        sectionId = 'employeesPage';
        renderEmployees();
        populateDeptDropdown();
    } else if (hash === '#/departments') {
        sectionId = 'departments';
        renderDepartments();
    } else if (hash === '#/accounts') {
        sectionId = 'accounts';
        renderAccounts();
    } else if (hash === '#/request') {
        sectionId = 'requests';
        renderRequests();
    }

    if (verifyAlert) {
        if (hash.includes('verified=true')) {
            verifyAlert.style.display = 'block';
        } else {
            verifyAlert.style.display = 'none';
        }
    }

    const activePage = document.getElementById(sectionId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

// Restore session on page load
window.addEventListener('load', () => {
    const token = sessionStorage.getItem('auth_token'); // 👈 sessionStorage
    const savedUser = sessionStorage.getItem('current_user'); // 👈 sessionStorage

    if (!window.location.hash || window.location.hash === '#') {
        window.location.replace('#/');
    }

    if (token && savedUser) {
        setAuthState(JSON.parse(savedUser));
    } else {
        setAuthState(null);
    }
});
window.addEventListener('hashchange', handleRouting);

// ====[ AUTHENTICATION ]====
// Register
async function registration(event) {
    event.preventDefault();
    const inputTitle = document.getElementById('title').value;
    const inputFname = document.getElementById('fname').value;
    const inputLname = document.getElementById('lname').value;
    const inputEmail = document.getElementById('email').value;
    const inputPassword = document.getElementById('password').value;
    const inputConfirmPassword = document.getElementById('confirmPassword').value;
    const regForm = document.getElementById('regFrom');

    if (inputPassword !== inputConfirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (inputPassword.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/users', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                title: inputTitle,
                firstName: inputFname,
                lastName: inputLname,
                email: inputEmail,
                password: inputPassword,
                confirmPassword: inputConfirmPassword,
                role: 'User'
            })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('unverified_email', inputEmail); // 👈 sessionStorage
            document.getElementById('showEmail').innerText = inputEmail;
            regForm.reset();
            navigateTo('#/verify');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
}

// Login
async function login(event) {
    event.preventDefault();
    const userEmail = document.getElementById('loginEmail').value;
    const userPassword = document.getElementById('loginPassword').value;
    const loginForm = document.getElementById('loginForm');

    try {
        const response = await fetch('http://localhost:4000/auth/login', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                email: userEmail,
                password: userPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            const user = {
                Fname: data.user.firstName,
                Lname: data.user.lastName,
                email: data.user.email,
                role: data.user.role === 'Admin' ? 'admin' : 'user',
                verified: true,
                id: data.user.id
            };

            sessionStorage.setItem('auth_token', data.token); // 👈 sessionStorage
            sessionStorage.setItem('current_user', JSON.stringify(user)); // 👈 sessionStorage
            showLoginToast();
            setAuthState(user);
            loginForm.reset();
            navigateTo('#/userProfile');
        } else {
            alert(data.message || 'Invalid email or password');
            loginForm.reset();
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('auth_token'); // 👈 sessionStorage
    sessionStorage.removeItem('current_user'); // 👈 sessionStorage
    setAuthState(null);
    navigateTo('#/');
}

// Verify email
function verifyEmail() {
    const findEmail = sessionStorage.getItem('unverified_email'); // 👈 sessionStorage

    if (findEmail) {
        sessionStorage.removeItem('unverified_email'); // 👈 sessionStorage
        console.log("Account verified:" + findEmail);
        navigateTo('#/login?verified=true');
    } else {
        alert('No email to verify');
    }
}

// Toast message for successful login
function showLoginToast() {
    const loginToast = document.getElementById('login-toast');
    const showToast = new bootstrap.Toast(loginToast, {
        autohide: true,
        delay: 1000
    });
    showToast.show();
    console.log("show toast");
}

// Edit profile
function editProfile() {
    alert("changed to Edit profile page!");
}

// ====[ DEPARTMENTS FUNCTIONALITIES (depFunc) ]====
async function renderDepartments() {
    const tableBody = document.getElementById('department-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Loading...</td></tr>';

    try {
        const response = await fetch('http://localhost:4000/departments', {
            headers: authHeaders()
        });
        const depts = await response.json();

        tableBody.innerHTML = '';

        depts.forEach((dept) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dept.name}</td>
                <td>${dept.description || 'No description available'}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary" onclick="editDepartment(${dept.id})">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Failed to load departments</td></tr>';
        console.error(err);
    }
}

let editingDeptId = null;

function openAddDepartment() {
    editingDeptId = null;
    document.getElementById('department-modal-title').innerText = "Add Department";
    document.getElementById('departmentForm').reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('department-modal')).show();
}

async function editDepartment(id) {
    try {
        const response = await fetch(`http://localhost:4000/departments/${id}`, {
            headers: authHeaders()
        });
        const dept = await response.json();

        editingDeptId = id;
        document.getElementById('department-modal-title').innerText = "Edit Department";
        document.getElementById('deptName').value = dept.name;
        document.getElementById('deptDescription').value = dept.description || '';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('department-modal')).show();
    } catch (err) {
        alert('Failed to load department');
        console.error(err);
    }
}

async function saveDepartment() {
    const name = document.getElementById('deptName').value.trim();
    const description = document.getElementById('deptDescription').value.trim();

    if (!name) {
        alert("Department name is required.");
        return;
    }

    try {
        const url = editingDeptId
            ? `http://localhost:4000/departments/${editingDeptId}`
            : 'http://localhost:4000/departments';

        const method = editingDeptId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: authHeaders(),
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            renderDepartments();
            bootstrap.Modal.getInstance(document.getElementById('department-modal')).hide();
            document.getElementById('departmentForm').reset();
            editingDeptId = null;
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to save department');
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
}

async function deleteDepartment(id) {
    if (confirm("Are you sure you want to delete this department?")) {
        try {
            const response = await fetch(`http://localhost:4000/departments/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });

            if (response.ok) {
                renderDepartments();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete department');
            }
        } catch (err) {
            alert('Server error. Is the backend running?');
            console.error(err);
        }
    }
}

// ====[ ACCOUNTS FUNCTIONALITIES (accFunc) ]====
async function renderAccounts() {
    const tableBody = document.getElementById('account-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const response = await fetch('http://localhost:4000/users', {
            headers: authHeaders()
        });
        const users = await response.json();

        tableBody.innerHTML = '';

        users.forEach((acc, index) => {
            const isSelf = currentUser && acc.email === currentUser.email;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${acc.firstName} ${acc.lastName}<br><small class="text-muted">${acc.email}</small></td>
                <td><span class="badge bg-secondary">${acc.role}</span></td>
                <td><span class="text-success">&#9989;</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="openEditAccount(${acc.id})">Edit</button>
                        <button class="btn btn-outline-warning" onclick="resetPassword(${acc.id}, '${acc.email}')">Reset Password</button>
                        <button class="btn btn-outline-danger" ${isSelf ? 'disabled' : ''} onclick="deleteAccount(${acc.id}, '${acc.email}')">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load accounts</td></tr>';
        console.error(err);
    }
}

let editingAccountId = null;

window.openEditAccount = async function (id) {
    try {
        const response = await fetch(`http://localhost:4000/users/${id}`, {
            method: 'GET',
            headers: authHeaders()
        });
        const acc = await response.json();

        editingAccountId = id;

        document.getElementById('accFname').value = acc.firstName;
        document.getElementById('accLname').value = acc.lastName;
        document.getElementById('accEmail').value = acc.email;
        document.getElementById('accEmail').readOnly = true;
        document.getElementById('accPassword').value = '';
        document.getElementById('accRole').value = acc.role === 'Admin' ? 'admin' : 'user';
        document.getElementById('isVerified').checked = true;

        document.querySelector('#account-modal .modal-title').innerText = "Edit Account";
        bootstrap.Modal.getOrCreateInstance(document.getElementById('account-modal')).show();
    } catch (err) {
        alert('Failed to load account details');
        console.error(err);
    }
};

async function addAccount() {
    const accFname = document.getElementById('accFname').value;
    const accLname = document.getElementById('accLname').value;
    const accEmail = document.getElementById('accEmail').value;
    const accPassword = document.getElementById('accPassword').value;
    const accConfirmPassword = document.getElementById('accConfirmPassword').value;
    const accRole = document.getElementById('accRole').value;

    // EDIT mode
    if (editingAccountId) {
        try {
            const response = await fetch(`http://localhost:4000/users/${editingAccountId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    firstName: accFname,
                    lastName: accLname,
                    role: accRole === 'admin' ? 'Admin' : 'User'
                })
            });

            if (response.ok) {
                editingAccountId = null;
                document.getElementById('accEmail').readOnly = false;
                document.querySelector('#account-modal .modal-title').innerText = "Add/Edit Account";
                renderAccounts();
                bootstrap.Modal.getInstance(document.getElementById('account-modal')).hide();
                document.getElementById('accountForm').reset();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update account');
            }
        } catch (err) {
            alert('Server error. Is the backend running?');
            console.error(err);
        }
        return;
    }

    // ADD mode
    if (accPassword.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
    }

    if (accPassword !== accConfirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/users', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                title: 'Mr',
                firstName: accFname,
                lastName: accLname,
                email: accEmail,
                password: accPassword,
                confirmPassword: accConfirmPassword,
                role: accRole === 'admin' ? 'Admin' : 'User'
            })
        });

        const data = await response.json();

        if (response.ok) {
            renderAccounts();
            bootstrap.Modal.getInstance(document.getElementById('account-modal')).hide();
            document.getElementById('accountForm').reset();
        } else {
            alert(data.message || 'Failed to add account');
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
}

function openAddAccount() {
    editingAccountId = null;
    document.getElementById('accountForm').reset();
    document.getElementById('accEmail').readOnly = false;
    document.querySelector('#account-modal .modal-title').innerText = "Add Account";
    bootstrap.Modal.getOrCreateInstance(document.getElementById('account-modal')).show();
}

let resettingAccountId = null;

window.resetPassword = function (id, email) {
    resettingAccountId = id;
    document.getElementById('resetPasswordForm').reset();
    document.querySelector('#reset-password-modal .modal-title').innerText = `Reset Password: ${email}`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('reset-password-modal')).show();
};

window.submitResetPassword = async function () {
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('newConfirmPassword').value;

    if (newPw.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
    }

    if (newPw !== confirmPw) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/users/${resettingAccountId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                password: newPw,
                confirmPassword: confirmPw
            })
        });

        if (response.ok) {
            alert("Password updated successfully!");
            bootstrap.Modal.getInstance(document.getElementById('reset-password-modal')).hide();
            document.getElementById('resetPasswordForm').reset();
            resettingAccountId = null;
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to reset password');
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
};

window.deleteAccount = async function (id, email) {
    if (currentUser && email === currentUser.email) {
        alert("You cannot delete your own account while logged in.");
        return;
    }

    const confirmed = confirm(`Are you sure you want to permanently delete the account: ${email}?`);

    if (confirmed) {
        try {
            const response = await fetch(`http://localhost:4000/users/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });

            if (response.ok) {
                alert("Account deleted.");
                renderAccounts();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete account');
            }
        } catch (err) {
            alert('Server error. Is the backend running?');
            console.error(err);
        }
    }
};

// ====[ EMPLOYEES FUNCTIONALITIES (empFunc) ]====
async function renderEmployees() {
    const tableBody = document.getElementById('employee-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const [empResponse, deptResponse, userResponse] = await Promise.all([
            fetch('http://localhost:4000/employees', { headers: authHeaders() }),
            fetch('http://localhost:4000/departments', { headers: authHeaders() }),
            fetch('http://localhost:4000/users', { headers: authHeaders() })
        ]);

        const employees = await empResponse.json();
        const departments = await deptResponse.json();
        const users = await userResponse.json();

        tableBody.innerHTML = '';

        if (employees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No employees found</td></tr>';
            return;
        }

        employees.forEach(emp => {
            const user = users.find(u => u.email === emp.userEmail);
            const dept = departments.find(d => d.id == emp.deptId);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${emp.employeeId}</td>
                <td>
                    <b>${user ? user.firstName + ' ' + user.lastName : 'Unknown'}</b><br>
                    <small class="text-muted">${emp.userEmail}</small>
                </td>
                <td>${emp.position}</td>
                <td>${dept ? dept.name : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${emp.id})">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load employees</td></tr>';
        console.error(err);
    }
}

async function populateDeptDropdown() {
    const deptSelect = document.getElementById('employeeDepartment');
    if (!deptSelect) return;

    deptSelect.innerHTML = '';

    try {
        const response = await fetch('http://localhost:4000/departments', {
            headers: authHeaders()
        });
        const departments = await response.json();

        departments.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept.id;
            opt.textContent = dept.name;
            deptSelect.appendChild(opt);
        });
    } catch (err) {
        console.error('Failed to load departments for dropdown', err);
    }
}

window.saveEmployee = async function () {
    const empId = document.getElementById('employeeId').value;
    const email = document.getElementById('employeeEmail').value;
    const pos = document.getElementById('employeePosition').value;
    const dept = document.getElementById('employeeDepartment').value;
    const hireDate = document.getElementById('hire-date')?.value || "";

    if (!empId || !email || !pos || !dept || !hireDate) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const userResponse = await fetch('http://localhost:4000/users', {
            headers: authHeaders()
        });
        const users = await userResponse.json();
        const userExists = users.some(u => u.email === email);

        if (!userExists) {
            alert("Error: No account found with this email. Create the account first.");
            return;
        }

        const response = await fetch('http://localhost:4000/employees', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                employeeId: empId,
                userEmail: email,
                position: pos,
                deptId: Number(dept),
                hireDate: hireDate
            })
        });

        const data = await response.json();

        if (response.ok) {
            renderEmployees();
            const modalEl = document.getElementById('employee-modal');
            const modalInst = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();
            document.getElementById('employeeForm').reset();
            alert("Employee saved successfully!");
        } else {
            alert(data.message || 'Failed to save employee');
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
};

window.deleteEmployee = async function (id) {
    if (confirm("Permanently remove this employee record?")) {
        try {
            const response = await fetch(`http://localhost:4000/employees/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });

            if (response.ok) {
                renderEmployees();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete employee');
            }
        } catch (err) {
            alert('Server error. Is the backend running?');
            console.error(err);
        }
    }
};

// for status badges
function getStatusBadge(status) {
    if (status === 'Approved') return 'bg-success';
    if (status === 'Rejected') return 'bg-danger';
    return 'bg-warning text-dark';
}

// ====[ REQUEST FUNCTIONALITIES (reqFunc) ]====
window.addRequestItemRow = function () {
    const container = document.getElementById('dynamic-items-container');
    const rowId = Date.now();

    const html = `
        <div class="row g-2 mb-2 align-items-center" id="row-${rowId}">
            <div class="col-8">
                <input type="text" class="form-control form-control-sm item-name" placeholder="Item Name" required>
            </div>
            <div class="col-3">
                <input type="number" class="form-control form-control-sm item-qty" value="1" min="1">
            </div>
            <div class="col-1 text-end">
                <button type="button" class="btn-close" style="font-size:0.6rem" onclick="document.getElementById('row-${rowId}').remove()"></button>
            </div>
        </div>`;

    container.insertAdjacentHTML('beforeend', html);
};

window.openRequestModal = function () {
    const container = document.getElementById('dynamic-items-container');
    container.querySelectorAll('.row').forEach(row => row.remove());
    addRequestItemRow();
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('request-modal'));
    modal.show();
};

window.renderRequests = async function () {
    const userView = document.getElementById('user-request-view');
    const adminView = document.getElementById('admin-request-view');
    const emptyView = document.getElementById('empty-request-view');
    const tableView = document.getElementById('table-request-view');
    const userTable = document.getElementById('user-request-table');
    const adminTable = document.getElementById('admin-request-table');
    const hideRequest = document.getElementById('request-add');

    if (!emptyView || !tableView || !currentUser) return;

    try {
        if (currentUser.role === 'admin') {
            userView.style.display = 'none';
            adminView.style.display = 'block';
            hideRequest.style.display = 'none';

            const response = await fetch('http://localhost:4000/requests', {
                headers: authHeaders()
            });
            const allRequests = await response.json();

            adminTable.innerHTML = '';

            if (allRequests.length === 0) {
                adminTable.innerHTML = '<tr><td colspan="6" class="text-center">No requests found</td></tr>';
                return;
            }

            allRequests.forEach(req => {
                const badge = getStatusBadge(req.status);
                const items = req.items.map(item => `${item.name} (x${item.qty})`).join(', ');

                const row = `<tr>
                    <td><small>${req.employeeEmail}</small></td>
                    <td>${req.date}</td>
                    <td>${req.type}</td>
                    <td>${items}</td>
                    <td><span class="badge ${badge}">${req.status}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-success" onclick="processRequest(${req.id}, 'Approved')"
                                ${req.status !== 'Pending' ? 'disabled' : ''}>Approve</button>
                            <button class="btn btn-danger" onclick="processRequest(${req.id}, 'Rejected')"
                                ${req.status !== 'Pending' ? 'disabled' : ''}>Reject</button>
                        </div>
                    </td>
                </tr>`;
                adminTable.insertAdjacentHTML('beforeend', row);
            });

        } else {
            adminView.style.display = 'none';
            userView.style.display = 'block';

            const response = await fetch(`http://localhost:4000/requests/email/${currentUser.email}`, {
                headers: authHeaders()
            });
            const userRequests = await response.json();

            if (userRequests.length === 0) {
                emptyView.style.display = 'block';
                tableView.style.display = 'none';
            } else {
                emptyView.style.display = 'none';
                tableView.style.display = 'block';
                hideRequest.style.display = 'block';
                userTable.innerHTML = '';

                userRequests.forEach(req => {
                    const badge = getStatusBadge(req.status);
                    const items = req.items.map(item => `${item.name} (x${item.qty})`).join(', ');
                    const row = `<tr>
                        <td>${req.date}</td>
                        <td>${req.type}</td>
                        <td>${items}</td>
                        <td><span class="badge ${badge}">${req.status}</span></td>
                    </tr>`;
                    userTable.insertAdjacentHTML('beforeend', row);
                });
            }
        }
    } catch (err) {
        console.error('Failed to load requests', err);
    }
};

window.processRequest = async function (id, newStatus) {
    try {
        const response = await fetch(`http://localhost:4000/requests/${id}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            renderRequests();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update request status');
        }
    } catch (err) {
        alert('Server error. Is the backend running?');
        console.error(err);
    }
};

const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const names = document.querySelectorAll('.item-name');
        const qtys = document.querySelectorAll('.item-qty');
        const items = [];

        names.forEach((input, i) => {
            if (input.value.trim() !== "") {
                items.push({ name: input.value.trim(), qty: qtys[i].value });
            }
        });

        if (items.length === 0) return alert("Please add at least one item.");

        try {
            const response = await fetch('http://localhost:4000/requests', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    type: document.getElementById('requestType').value,
                    items: items,
                    employeeEmail: currentUser.email
                })
            });

            const data = await response.json();

            if (response.ok) {
                renderRequests();
                bootstrap.Modal.getInstance(document.getElementById('request-modal')).hide();
                this.reset();
            } else {
                alert(data.message || 'Failed to submit request');
            }
        } catch (err) {
            alert('Server error. Is the backend running?');
            console.error(err);
        }
    });
}