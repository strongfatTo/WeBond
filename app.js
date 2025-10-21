const API_URL = 'http://localhost:3000';
let currentUser = null;
let currentToken = null;
let currentTask = null;
let messageInterval = null;

// Initialize
window.onload = function() {
    loadAuthState();
    updateUI();
};

function loadAuthState() {
    const savedUser = localStorage.getItem('webond_user');
    const savedToken = localStorage.getItem('webond_token');
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        currentToken = savedToken;
    }
}

function updateUI() {
    if (currentUser) {
        document.getElementById('authButton').classList.add('hidden');
        document.getElementById('userDisplay').classList.remove('hidden');
        document.getElementById('logoutButton').classList.remove('hidden');
        document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
        document.getElementById('userAvatar').textContent = currentUser.firstName[0];
        document.getElementById('dashboardContent').classList.add('hidden');
        document.getElementById('dashboardLoggedIn').classList.remove('hidden');
        loadDashboardData();
    } else {
        document.getElementById('authButton').classList.remove('hidden');
        document.getElementById('userDisplay').classList.add('hidden');
        document.getElementById('logoutButton').classList.add('hidden');
        document.getElementById('dashboardContent').classList.remove('hidden');
        document.getElementById('dashboardLoggedIn').classList.add('hidden');
    }
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    if (pageId === 'browse') loadTasks();
    if (pageId === 'chat') loadChatList();
    if (pageId === 'wallet') loadWallet();
}

// Auth Functions
function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function showAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabs[0].classList.add('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabs[1].classList.add('active');
    }
}

async function login(e) {
    e.preventDefault();
    const data = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
    };

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            currentUser = result.user;
            currentToken = result.accessToken;
            localStorage.setItem('webond_user', JSON.stringify(currentUser));
            localStorage.setItem('webond_token', currentToken);
            closeAuthModal();
            updateUI();
            showStatus('authStatus', '✅ Login successful!', 'success');
        } else {
            showStatus('authStatus', `❌ ${result.error || 'Login failed'}`, 'error');
        }
    } catch (error) {
        showStatus('authStatus', `❌ Error: ${error.message}`, 'error');
    }
}

async function register(e) {
    e.preventDefault();
    const data = {
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        role: document.getElementById('regRole').value,
    };

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            currentUser = result.user;
            currentToken = result.accessToken;
            localStorage.setItem('webond_user', JSON.stringify(currentUser));
            localStorage.setItem('webond_token', currentToken);
            closeAuthModal();
            updateUI();
            showStatus('authStatus', '✅ Registration successful!', 'success');
        } else {
            showStatus('authStatus', `❌ ${result.error || 'Registration failed'}`, 'error');
        }
    } catch (error) {
        showStatus('authStatus', `❌ Error: ${error.message}`, 'error');
    }
}

function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('webond_user');
    localStorage.removeItem('webond_token');
    updateUI();
    showPage('dashboard');
}

// Dashboard
async function loadDashboardData() {
    if (!currentToken) return;
    
    try {
        const response = await fetch(`${API_URL}/api/tasks`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const result = await response.json();
        const tasks = result.tasks || [];
        
        const myTasks = tasks.filter(t => 
            t.raiserId === currentUser.id || t.solverId === currentUser.id
        );
        
        document.getElementById('myTasksCount').textContent = myTasks.length;
        document.getElementById('dashboardBalance').textContent = '1,250.00';
        
        const recentHTML = myTasks.slice(0, 3).map(task => `
            <div class="transaction-item">
                <div>
                    <strong>${task.title}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-light);">${task.status}</div>
                </div>
                <span class="badge ${task.status}">${task.status}</span>
            </div>
        `).join('');
        
        document.getElementById('recentTasks').innerHTML = recentHTML || '<p style="color: var(--text-light);">No recent tasks</p>';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Tasks
async function loadTasks() {
    const status = document.getElementById('filterStatus').value;
    const category = document.getElementById('filterCategory').value;
    
    let url = `${API_URL}/api/tasks?status=${status}`;
    if (category) url += `&category=${category}`;

    try {
        const response = await fetch(url);
        const result = await response.json();
        displayTasks(result.tasks || []);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks found</p></div>';
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-card" onclick='viewTask(${JSON.stringify(task)})'>
            <h3>${task.title}</h3>
            <p>${task.description.substring(0, 120)}...</p>
            <div class="task-meta">
                <span class="badge ${task.status}">${task.status.replace('_', ' ').toUpperCase()}</span>
                <span>💰 HKD ${task.rewardAmount}</span>
                <span>📍 ${task.location}</span>
            </div>
            ${task.status === 'active' && currentUser && currentUser.role !== 'raiser' ? 
                `<button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="acceptTask('${task.id}', event)">Accept Task</button>` : 
                ''}
        </div>
    `).join('');
}

async function acceptTask(taskId, event) {
    event.stopPropagation();
    if (!currentToken) {
        showAuthModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/tasks/${taskId}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.ok) {
            alert('✅ Task accepted successfully!');
            loadTasks();
        } else {
            const error = await response.json();
            alert(`❌ ${error.error || 'Failed to accept task'}`);
        }
    } catch (error) {
        alert('❌ Error accepting task');
    }
}

function viewTask(task) {
    alert(`Task: ${task.title}\n\nDescription: ${task.description}\n\nReward: HKD ${task.rewardAmount}\nLocation: ${task.location}\nStatus: ${task.status}`);
}

// Create Task
async function createTask(e) {
    e.preventDefault();

    if (!currentToken) {
        showAuthModal();
        return;
    }

    const data = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        category: document.getElementById('taskCategory').value,
        location: document.getElementById('taskLocation').value,
        rewardAmount: parseInt(document.getElementById('taskReward').value),
    };

    try {
        const response = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showStatus('createStatus', `✅ Task created! ID: ${result.id.substring(0, 8)}...`, 'success');
            document.getElementById('createTaskForm').reset();
            
            await fetch(`${API_URL}/api/tasks/${result.id}/publish`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            
            showStatus('createStatus', '✅ Task published successfully!', 'success');
            setTimeout(() => showPage('browse'), 2000);
        } else {
            showStatus('createStatus', `❌ ${result.error || 'Failed to create task'}`, 'error');
        }
    } catch (error) {
        showStatus('createStatus', `❌ Error: ${error.message}`, 'error');
    }
}

// Chat
async function loadChatList() {
    if (!currentToken) return;

    try {
        const response = await fetch(`${API_URL}/api/tasks?status=in_progress`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const result = await response.json();
        const tasks = result.tasks || [];
        
        const myTasks = tasks.filter(t => 
            t.raiserId === currentUser.id || t.solverId === currentUser.id
        );

        const container = document.getElementById('chatList');
        
        if (myTasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active chats</p></div>';
            return;
        }

        container.innerHTML = myTasks.map(task => `
            <div class="chat-item" onclick="selectChat('${task.id}')">
                <strong>${task.title}</strong>
                <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.25rem;">
                    ${task.raiserId === currentUser.id ? 'Solver' : 'Raiser'}: ${task.solver?.firstName || task.raiser?.firstName || 'Unknown'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

async function selectChat(taskId) {
    if (messageInterval) clearInterval(messageInterval);

    try {
        const response = await fetch(`${API_URL}/api/tasks/${taskId}`);
        const task = await response.json();
        currentTask = task;

        document.getElementById('chatArea').classList.add('hidden');
        document.getElementById('activeChatArea').classList.remove('hidden');

        const isRaiser = task.raiserId === currentUser.id;
        const otherUser = isRaiser ? task.solver : task.raiser;

        document.getElementById('chatTitle').textContent = task.title;
        document.getElementById('chatSubtitle').textContent = `Chatting with ${otherUser.firstName} ${otherUser.lastName}`;

        await loadMessages(taskId);
        messageInterval = setInterval(() => loadMessages(taskId), 3000);
    } catch (error) {
        console.error('Error selecting chat:', error);
    }
}

async function loadMessages(taskId) {
    try {
        const response = await fetch(`${API_URL}/api/messages/${taskId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const result = await response.json();
        displayMessages(result.messages || []);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayMessages(messages) {
    const container = document.getElementById('messages');

    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }

    container.innerHTML = messages.map(msg => {
        const isSent = msg.senderId === currentUser.id;
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="message-content">
                    <strong>${msg.sender.firstName} ${msg.sender.lastName}</strong>
                    <div>${msg.content}</div>
                    <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem;">
                        ${new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    if (!currentTask) return;

    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    if (!content) return;

    try {
        const response = await fetch(`${API_URL}/api/messages/${currentTask.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            input.value = '';
            await loadMessages(currentTask.id);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Wallet
function loadWallet() {
    document.getElementById('walletBalance').textContent = '1,250.00';
    
    const transactions = [
        { title: 'Task Completed - Visa Help', amount: '+300', status: 'Completed', date: '2025-10-20' },
        { title: 'Task Payment - Translation', amount: '-200', status: 'Sent', date: '2025-10-19' },
        { title: 'Funds Added', amount: '+1000', status: 'Completed', date: '2025-10-18' },
    ];

    const container = document.getElementById('transactionsList');
    container.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div>
                <strong>${t.title}</strong>
                <div style="font-size: 0.85rem; color: var(--text-light);">${t.date}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: ${t.amount.startsWith('+') ? 'var(--success)' : 'var(--text-dark)'};">
                    HKD ${t.amount}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-light);">${t.status}</div>
            </div>
        </div>
    `).join('');
}

// Utilities
function showStatus(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.className = `status ${type}`;
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}
