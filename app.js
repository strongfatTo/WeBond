// WeBond Frontend with Supabase Integration - UPDATED
const SUPABASE_URL = 'https://mqghigpyrjpjchbstdhq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2hpZ3B5cmpwamNoYnN0ZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjI0MzksImV4cCI6MjA3NTk5ODQzOX0.H1EQwi3ydfY3vQFHohqxmlnWAvnQKJjHe0koYLALCQM';

// Initialize Supabase client (will be set when page loads)
let supabaseClient = null;

// Try to initialize immediately if Supabase is already available
if (typeof supabase !== 'undefined') {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized immediately');
    } catch (error) {
        console.error('Error initializing Supabase immediately:', error);
    }
}

let currentUser = null;
let currentTask = null;
let messageInterval = null;

// Initialize Supabase client
function initializeSupabase() {
    try {
        console.log('Checking if supabase is defined:', typeof supabase);
        if (typeof supabase !== 'undefined') {
            console.log('Creating Supabase client...');
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client created:', supabaseClient);
            console.log('Supabase client initialized successfully');
            return true;
        } else {
            console.error('Supabase library not loaded');
            return false;
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return false;
    }
}

// Check if Supabase is ready
function isSupabaseReady() {
    console.log('Checking if Supabase is ready. supabaseClient:', supabaseClient);
    return supabaseClient !== null;
}

// Wait for Supabase script to load
function waitForSupabase() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        const checkSupabase = () => {
            attempts++;
            console.log(`Attempt ${attempts}: Checking for supabase...`);
            
            if (typeof supabase !== 'undefined') {
                console.log('Supabase found!');
                resolve(true);
            } else if (attempts >= maxAttempts) {
                console.error('Supabase failed to load after 5 seconds');
                resolve(false);
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
}

// Initialize
window.onload = async function() {
    console.log('Page loaded, waiting for Supabase...');
    
    // Wait for Supabase to be available
    const supabaseLoaded = await waitForSupabase();
    
    if (supabaseLoaded) {
        console.log('Supabase library found, initializing...');
        
        // Try to initialize Supabase
        if (initializeSupabase()) {
            loadAuthState();
            updateUI();
        } else {
            console.error('Failed to initialize Supabase');
        }
    } else {
        console.error('Supabase failed to load. App will not work properly.');
        // Still load the UI so user can see the interface
        loadAuthState();
        updateUI();
    }
};

async function loadAuthState() {
    if (!isSupabaseReady()) {
        console.error('Supabase not ready in loadAuthState');
        return;
    }

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Error getting Supabase session:', error);
        return;
    }

    if (session) {
        // If there's an active session, fetch the user profile from our 'users' table
        try {
            const { data: profile, error: profileError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

            if (profileError) {
                console.error('Failed to load user profile from session:', profileError);
                currentUser = null;
                localStorage.removeItem('webond_user');
                return;
            }

            if (!profile) {
                // Profile doesn't exist - this can happen if registration failed partway
                console.warn('User authenticated but no profile exists. Logging out...');
                await supabaseClient.auth.signOut();
                currentUser = null;
                localStorage.removeItem('webond_user');
                alert('Your account setup is incomplete. Please register again.');
                return;
            }

            currentUser = profile;
            localStorage.setItem('webond_user', JSON.stringify(currentUser));
        } catch (err) {
            console.error('Exception loading user profile:', err);
            currentUser = null;
            localStorage.removeItem('webond_user');
        }
    } else {
        // If no active session, clear any stale data
        currentUser = null;
        localStorage.removeItem('webond_user');
    }
}
function updateUI() {
    if (currentUser) {
        document.getElementById('authButton').classList.add('hidden');
        document.getElementById('userDisplay').classList.remove('hidden');
        document.getElementById('logoutButton').classList.remove('hidden');
        document.getElementById('userName').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
        document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
        document.getElementById('userAvatar').textContent = currentUser.first_name[0];
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
    
    if (!isSupabaseReady()) {
        showStatus('authStatus', '❌ Database not ready. Please refresh the page.', 'error');
        return;
    }
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            showStatus('authStatus', `❌ ${error.message}`, 'error');
            console.error('Supabase login error:', error);
            return;
        }

        // Fetch user profile from 'users' table after successful Supabase auth
        const { data: profile, error: profileError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            showStatus('authStatus', `❌ Failed to load user profile: ${profileError?.message || 'Profile not found'}`, 'error');
            console.error('Profile load error:', profileError);
            return;
        }

        currentUser = profile;
        localStorage.setItem('webond_user', JSON.stringify(currentUser));
        closeAuthModal();
        updateUI();
        showStatus('authStatus', '✅ Login successful!', 'success');
    } catch (error) {
        showStatus('authStatus', `❌ Error: ${error.message}`, 'error');
        console.error('Login error:', error);
    }
}

async function register(e) {
    e.preventDefault();
    
    if (!isSupabaseReady()) {
        showStatus('authStatus', '❌ Database not ready. Please refresh the page.', 'error');
        return;
    }
    
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const role = document.getElementById('regRole').value;

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                }
            }
        });

        if (error) {
            showStatus('authStatus', `❌ ${error.message}`, 'error');
            console.error('Supabase registration error:', error);
            return;
        }

        // Supabase signUp automatically logs in the user and sets the session.
        // We still need to create the user profile in our 'users' table.
        const { data: profile, error: profileError } = await supabaseClient
            .from('users')
            .insert({
                id: data.user.id, // Use the ID from Supabase Auth
                email: email,
                first_name: firstName,
                last_name: lastName,
                role: role,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (profileError) {
            // If profile creation fails, consider logging out the user from Supabase Auth
            await supabaseClient.auth.signOut();
            showStatus('authStatus', `❌ Failed to create user profile: ${profileError.message}`, 'error');
            console.error('Profile creation error:', profileError);
            return;
        }
        console.log('User profile created successfully:', profile);

        currentUser = profile;
        localStorage.setItem('webond_user', JSON.stringify(currentUser));
        closeAuthModal();
        updateUI();
        showStatus('authStatus', '✅ Registration successful!', 'success');
    } catch (error) {
        showStatus('authStatus', `❌ Error: ${error.message}`, 'error');
        console.error('Registration error:', error);
    }
}

function logout() {
    if (supabaseClient && supabaseClient.auth) {
        supabaseClient.auth.signOut();
    }
    currentUser = null;
    localStorage.removeItem('webond_user');
    updateUI();
    showPage('dashboard');
}

// Dashboard
async function loadDashboardData() {
    if (!currentUser) return;
    
    if (!isSupabaseReady()) {
        console.error('Supabase not ready for dashboard data');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.rpc('get_my_tasks', {
            p_user_id: currentUser.id
        });
        
        if (error) {
            console.error('Error loading dashboard:', error);
            return;
        }

        const tasks = data.data || [];
        document.getElementById('myTasksCount').textContent = tasks.length;
        document.getElementById('dashboardBalance').textContent = '1,250.00';
        
        const recentHTML = tasks.slice(0, 3).map(task => `
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
    if (!isSupabaseReady()) {
        console.error('Supabase not ready for loading tasks');
        return;
    }
    
    const status = document.getElementById('filterStatus').value;
    const category = document.getElementById('filterCategory').value;
    
    try {
        const { data, error } = await supabaseClient.rpc('get_tasks', {
            p_status: status || null,
            p_category: category || null,
            p_location: null
        });

        if (error) {
            console.error('Error loading tasks:', error);
            return;
        }

        displayTasks(data.data || []);
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
                <span>💰 HKD ${task.reward_amount}</span>
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
    if (!currentUser) {
        showAuthModal();
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('accept_task', {
            p_task_id: taskId
        });

        if (error) {
            alert(`❌ ${error.message}`);
            return;
        }

        if (data.success) {
            alert('✅ Task accepted successfully!');
            loadTasks();
        } else {
            alert(`❌ ${data.error || 'Failed to accept task'}`);
        }
    } catch (error) {
        alert('❌ Error accepting task');
    }
}

function viewTask(task) {
    alert(`Task: ${task.title}\n\nDescription: ${task.description}\n\nReward: HKD ${task.reward_amount}\nLocation: ${task.location}\nStatus: ${task.status}`);
}

// Create Task
async function createTask(e) {
    e.preventDefault();

    if (!currentUser) {
        showAuthModal();
        return;
    }

    // Map frontend categories to backend enum values
    const categoryMap = {
        'translation': 'administrative',
        'visa_help': 'administrative', 
        'navigation': 'daily_life',
        'shopping': 'daily_life',
        'admin_help': 'administrative',
        'other': 'daily_life'
    };

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const category = categoryMap[document.getElementById('taskCategory').value] || 'daily_life';
    const location = document.getElementById('taskLocation').value;
    const rewardAmount = parseInt(document.getElementById('taskReward').value);

    try {
        const { data, error } = await supabaseClient.rpc('create_task', {
            p_title: title,
            p_description: description,
            p_category: category,
            p_location: location,
            p_reward_amount: rewardAmount,
            p_deadline: null
        });

        if (error) {
            showStatus('createStatus', `❌ ${error.message}`, 'error');
            return;
        }

        if (data.success) {
            showStatus('createStatus', `✅ Task created! ID: ${data.data.id.substring(0, 8)}...`, 'success');
            document.getElementById('createTaskForm').reset();
            showStatus('createStatus', '✅ Task published successfully!', 'success');
            setTimeout(() => showPage('browse'), 2000);
        } else {
            showStatus('createStatus', `❌ ${data.error || 'Failed to create task'}`, 'error');
        }
    } catch (error) {
        showStatus('createStatus', `❌ Error: ${error.message}`, 'error');
    }
}

// Chat
async function loadChatList() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabaseClient.rpc('get_my_tasks');
        
        if (error) {
            console.error('Error loading chats:', error);
            return;
        }

        const tasks = data.data || [];
        const myTasks = tasks.filter(t => 
            t.raiser_id === currentUser.id || t.solver_id === currentUser.id
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
                    ${task.raiser_id === currentUser.id ? 'Solver' : 'Raiser'}: ${task.solver?.first_name || task.raiser?.first_name || 'Unknown'}
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
        const { data: task, error } = await supabaseClient
            .from('tasks')
            .select(`
                *,
                raiser:users!tasks_raiser_id_fkey(id, first_name, last_name),
                solver:users!tasks_solver_id_fkey(id, first_name, last_name)
            `)
            .eq('id', taskId)
            .single();

        if (error) {
            console.error('Error selecting chat:', error);
            return;
        }

        currentTask = task;

        document.getElementById('chatArea').classList.add('hidden');
        document.getElementById('activeChatArea').classList.remove('hidden');

        const isRaiser = task.raiser_id === currentUser.id;
        const otherUser = isRaiser ? task.solver : task.raiser;

        document.getElementById('chatTitle').textContent = task.title;
        document.getElementById('chatSubtitle').textContent = `Chatting with ${otherUser.first_name} ${otherUser.last_name}`;

        await loadMessages(taskId);
        messageInterval = setInterval(() => loadMessages(taskId), 3000);
    } catch (error) {
        console.error('Error selecting chat:', error);
    }
}

async function loadMessages(taskId) {
    try {
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select(`
                *,
                sender:users!messages_sender_id_fkey(id, first_name, last_name)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading messages:', error);
            return;
        }

        displayMessages(messages || []);
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
        const isSent = msg.sender_id === currentUser.id;
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="message-content">
                    <strong>${msg.sender.first_name} ${msg.sender.last_name}</strong>
                    <div>${msg.content}</div>
                    <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem;">
                        ${new Date(msg.created_at).toLocaleTimeString()}
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
        const { error } = await supabaseClient
            .from('messages')
            .insert({
                task_id: currentTask.id,
                sender_id: currentUser.id,
                content: content
            });

        if (error) {
            console.error('Error sending message:', error);
            return;
        }

        input.value = '';
        await loadMessages(currentTask.id);
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
