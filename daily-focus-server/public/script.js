// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const API_URL = 'http://localhost:3000/api';

// ============================================
// CATEGORIES
// ============================================

const CATEGORIES = {
    income: [
        'Salário',
        'Freelance',
        'Investimentos',
        'Bônus',
        'Presente',
        'Outros'
    ],
    expense: [
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Educação',
        'Lazer',
        'Compras',
        'Contas',
        'Outros'
    ]
};

// Categorias de Orçamento (Budget)
const BUDGET_CATEGORIES = [
    { name: 'Moradia', icon: '🏠', color: '#3b82f6' },
    { name: 'Alimentação', icon: '🍔', color: '#10b981' },
    { name: 'Transporte', icon: '🚗', color: '#f59e0b' },
    { name: 'Saúde', icon: '💊', color: '#ef4444' },
    { name: 'Educação', icon: '📚', color: '#8b5cf6' },
    { name: 'Lazer', icon: '🎮', color: '#ec4899' },
    { name: 'Compras', icon: '🛍️', color: '#14b8a6' },
    { name: 'Contas', icon: '💡', color: '#f97316' },
    { name: 'Poupança', icon: '💰', color: '#22c55e' },
    { name: 'Outros', icon: '📦', color: '#64748b' }
];


// ============================================
// THEME TOGGLE SYSTEM
// Cole esse código NO FINAL do seu script.js
// ============================================

// Theme Toggle Functionality
function initThemeToggle() {
    // Criar botão de theme toggle
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.id = 'theme-toggle';
    themeToggleBtn.className = 'theme-toggle-btn';
    themeToggleBtn.innerHTML = `
        <svg class="sun-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <svg class="moon-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
    `;
    
    // Adicionar ao header
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.insertBefore(themeToggleBtn, headerActions.firstChild);
    }
    
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Event listener
    themeToggleBtn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Animação suave
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    
    if (theme === 'dark') {
        btn.classList.remove('light-mode');
        btn.classList.add('dark-mode');
    } else {
        btn.classList.remove('dark-mode');
        btn.classList.add('light-mode');
    }
}

// Inicializar theme toggle quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}

// ============================================
// ROCKET LOADER SYSTEM
// Cole esse código NO FINAL do seu script.js
// ============================================

// Criar HTML do loader
function createRocketLoader() {
    const loaderHTML = `
        <div id="rocket-loader" class="loading-overlay">
            <div class="loader-container">
                <div class="loader">
                    <span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <div class="base">
                        <span></span>
                        <div class="face"></div>
                    </div>
                </div>
                <div class="longfazers">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="loading-text">Carregando...</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
}

// Mostrar loader
function showLoader(text = 'Carregando...') {
    const loader = document.getElementById('rocket-loader');
    if (!loader) {
        createRocketLoader();
    }
    
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
    
    document.getElementById('rocket-loader').classList.add('active');
}

// Esconder loader
function hideLoader() {
    const loader = document.getElementById('rocket-loader');
    if (loader) {
        loader.classList.remove('active');
    }
}

// Inicializar loader ao carregar página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createRocketLoader);
} else {
    createRocketLoader();
}

// ============================================
// INTEGRAÇÃO COM AS FUNÇÕES EXISTENTES
// ============================================

// Exemplo: Adicionar loader nas requisições
const originalFetch = window.fetch;
window.fetch = function(...args) {
    // Mostrar loader apenas para requisições da API
    if (args[0] && args[0].includes('/api/')) {
        showLoader();
    }
    
    return originalFetch.apply(this, args)
        .then(response => {
            hideLoader();
            return response;
        })
        .catch(error => {
            hideLoader();
            throw error;
        });
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

// Usar loader com async/await
async function withLoader(asyncFunction, loadingText = 'Carregando...') {
    showLoader(loadingText);
    try {
        const result = await asyncFunction();
        hideLoader();
        return result;
    } catch (error) {
        hideLoader();
        throw error;
    }
}

// Usar loader com delay mínimo (evita flash se carregar muito rápido)
async function withMinimumLoader(asyncFunction, loadingText = 'Carregando...', minDelay = 500) {
    showLoader(loadingText);
    const start = Date.now();
    
    try {
        const result = await asyncFunction();
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minDelay - elapsed);
        
        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
        }
        
        hideLoader();
        return result;
    } catch (error) {
        hideLoader();
        throw error;
    }
}


// ============================================
// API CLIENT
// ============================================

class API {
    static async request(url, options = {}) {
        try {
            const response = await fetch(`${API_URL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                let errorData = null;
                let errorText = '';

                try {
                    errorData = await response.json();
                } catch (parseError) {
                    try {
                        errorText = await response.text();
                    } catch (textError) {
                        errorText = '';
                    }
                }

                const message = (errorData && errorData.error)
                    ? errorData.error
                    : (errorText || `Erro na requisi??o (${response.status})`);

                const err = new Error(message);
                err.status = response.status;
                err.data = errorData;
                throw err;
            }

            try {
                return await response.json();
            } catch (parseError) {
                return null;
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Users
    static async register(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async login(credentials) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async getUserByEmail(email) {
        return this.request(`/users/email/${email}`);
    }

    // Tasks
    static async getTasks(userId) {
        return this.request(`/tasks?userId=${userId}`);
    }

    static async getGroupTasks(groupId) {
        return this.request(`/tasks?groupId=${groupId}`);
    }

    static async createTask(task) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
        });
    }

    static async updateTask(id, task) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(task)
        });
    }

    static async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }

    // Transactions
    static async getTransactions(userId) {
        return this.request(`/transactions?userId=${userId}`);
    }

    static async createTransaction(transaction) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
    }

    static async updateTransaction(id, transaction) {
        return this.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transaction)
        });
    }

    static async deleteTransaction(id) {
        return this.request(`/transactions/${id}`, {
            method: 'DELETE'
        });
    }

    // Backup
    static async getBackup() {
        return this.request('/backup');
    }

    static async restoreBackup(data) {
        return this.request('/backup/restore', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Budgets (Orçamento)
    static async getBudgets(userId) {
        return this.request(`/budgets?userId=${userId}`);
    }

    static async getBudgetByTransaction(transactionId) {
        try {
            return await this.request(`/budgets/transaction/${transactionId}`);
        } catch (error) {
            if (error && error.status === 404) {
                return null;
            }
            throw error;
        }
    }

    static async getBudgetSummary(userId) {
        return this.request(`/budgets/summary/${userId}`);
    }

    static async createBudget(budget) {
        return this.request('/budgets', {
            method: 'POST',
            body: JSON.stringify(budget)
        });
    }

    static async updateBudget(id, budget) {
        return this.request(`/budgets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(budget)
        });
    }

    static async updateSpent(userId, category, amount) {
        return this.request(`/budgets/update-spent/${userId}/${category}`, {
            method: 'PUT',
            body: JSON.stringify({ amount })
        });
    }

    static async deleteBudget(id) {
        return this.request(`/budgets/${id}`, {
            method: 'DELETE'
        });
    }

    // Groups (Grupos)
    static async getGroups(userId) {
        return this.request(`/groups?userId=${userId}`);
    }

    static async createGroup(group) {
        return this.request('/groups', {
            method: 'POST',
            body: JSON.stringify(group)
        });
    }

    static async updateGroup(id, data) {
        return this.request(`/groups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteGroup(id) {
        return this.request(`/groups/${id}`, {
            method: 'DELETE'
        });
    }

    static async addGroupMember(groupId, email) {
        return this.request(`/groups/${groupId}/members`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    static async removeGroupMember(groupId, userId) {
        return this.request(`/groups/${groupId}/members/${userId}`, {
            method: 'DELETE'
        });
    }
}

// ============================================
// AUTO-SAVE SYSTEM
// ============================================

class AutoSave {
    constructor() {
        this.saveTimeout = null;
        this.indicator = document.getElementById('save-indicator');
        this.text = document.getElementById('save-text');
    }

    showSaving() {
        this.indicator.className = 'save-indicator saving show';
        this.text.textContent = 'Salvando no servidor...';
    }

    showSaved() {
        this.indicator.className = 'save-indicator saved show';
        this.text.innerHTML = '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Salvo no servidor!';
        
        setTimeout(() => {
            this.indicator.classList.remove('show');
        }, 2000);
    }

    showError(message = 'Erro ao salvar') {
        this.indicator.className = 'save-indicator error show';
        this.text.textContent = message;
        
        setTimeout(() => {
            this.indicator.classList.remove('show');
        }, 3000);
    }

    async save(callback) {
        this.showSaving();
        
        try {
            await callback();
            this.showSaved();
        } catch (error) {
            console.error('Save error:', error);
            this.showError(error.message);
        }
    }
}

// ============================================
// GLOBAL VARIABLES
// ============================================

const autoSave = new AutoSave();
let currentUser = null;
let tasks = [];
let groupTasks = [];
let transactions = [];
let budgets = [];
let groups = [];
let currentView = 'tasks';
let editingTaskId = null;
let editingTransactionId = null;
let currentTransactionType = 'income';
let currentBudgetTransaction = null;
let currentGroupId = null;
let currentTaskScope = 'personal';
let assigneeGridInitialized = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Daily Focus v4.0.0 iniciando...');
    
    checkAuth();
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });
    
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
    });

    document.getElementById('finance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTransaction();
    });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('finance-date-input').value = today;
    
    console.log('✅ Sistema carregado!');
});

// ============================================
// AUTH FUNCTIONS
// ============================================

function checkAuth() {
    const session = localStorage.getItem('dailyFocusSession');
    if (session) {
        const user = JSON.parse(session);
        loginUser(user);
    } else {
        showLogin();
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const user = await API.login({ email, password });
        loginUser(user);
    } catch (error) {
        showError('login-error', error.message);
    }
}

async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    
    if (password !== passwordConfirm) {
        showError('register-error', 'As senhas não coincidem');
        return;
    }
    
    if (password.length < 6) {
        showError('register-error', 'A senha deve ter no mínimo 6 caracteres');
        return;
    }
    
    try {
        const newUser = await API.register({ name, email, password });
        
        hideError('register-error');
        const successMsg = document.getElementById('register-success');
        successMsg.textContent = 'Conta criada com sucesso! Redirecionando...';
        successMsg.classList.remove('hidden');
        
        document.getElementById('register-form').reset();
        
        setTimeout(() => {
            loginUser(newUser);
        }, 1500);
    } catch (error) {
        showError('register-error', error.message);
    }
}

async function loginUser(user) {
    currentUser = user;
    
    localStorage.setItem('dailyFocusSession', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));
    const loginTime = new Date().toISOString();
    localStorage.setItem('dailyFocusSessionStart', loginTime);
    localStorage.setItem('dailyFocusLastLogin', loginTime);
    
    console.log('✅ User logged in:', currentUser);
    
    try {
        tasks = await API.getTasks(user.id);
        transactions = await API.getTransactions(user.id);
        budgets = await API.getBudgets(user.id);
        groups = await API.getGroups(user.id);
        groupTasks = [];
        console.log(`✅ Loaded ${tasks.length} tasks, ${transactions.length} transactions, ${budgets.length} budgets and ${groups.length} groups from server`);
    } catch (error) {
        console.error('Error loading data:', error);
        tasks = [];
        groupTasks = [];
        transactions = [];
        budgets = [];
        groups = [];
    }
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
    
    showView('app');
    makeProfileCardClickable();
    
    updateCategoryFilters();
    renderTasks();
    renderTransactions();
    updateAllStats();
    renderGroups();
    if (currentView === 'group-page') {
        renderGroupPage();
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        currentUser = null;
        tasks = [];
        groupTasks = [];
        transactions = [];
        budgets = [];
        groups = [];
        currentGroupId = null;
        currentTaskScope = 'personal';
        localStorage.removeItem('dailyFocusSession');
        
        document.getElementById('main-app').classList.add('hidden');
        showLogin();
    }
}

function showLogin() {
    showView('login');
    document.getElementById('login-form').reset();
    hideError('login-error');
}

function showRegister() {
    showView('register');
    document.getElementById('register-form').reset();
    hideError('register-error');
    hideError('register-success');
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const body = document.body || document.documentElement;
    if (!body) {
        alert(message);
        return;
    }

    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `notification notification-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, 3200);
}

// ============================================
// PROFILE PAGE FUNCTIONALITY
// Cole esse código NO FINAL do seu script.js
// ============================================

// Variável para armazenar foto temporária
let tempAvatarData = null;

// Carregar página de perfil
async function loadProfilePage() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    showView('profile');
    await renderProfileData();
    await renderProfileStats();
    renderProfileDashboard();
}

// Renderizar dados do perfil
async function renderProfileData() {
    try {
        // Buscar dados atualizados do usuário
        const response = await fetch(`${API_URL}/users/${currentUser.id}`);
        const user = await response.json();
        
        // Atualizar dados globais
        currentUser = user;
        
        // Preencher formulário (se existir)
        const profileNameInput = document.getElementById('profile-name');
        const profileEmailInput = document.getElementById('profile-email');
        if (profileNameInput) {
            profileNameInput.value = user.name || '';
        }
        if (profileEmailInput) {
            profileEmailInput.value = user.email || '';
        }
        
        // Atualizar display
        document.getElementById('profile-display-name').textContent = user.name || 'Usuário';
        document.getElementById('profile-display-email').textContent = user.email || '';
        
        // Avatar
        updateAvatarDisplay(user);

        // Presentation profile
        hydrateProfilePresentation(user);
        initProfilePresentation();
        updateProfilePresentationPreview();
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showNotification('Erro ao carregar perfil', 'error');
    }
}

// Atualizar display do avatar
function updateAvatarDisplay(user) {
    const avatarInitials = document.getElementById('avatar-initials');
    const avatarImage = document.getElementById('avatar-image');
    
    if (user.avatar) {
        avatarImage.src = user.avatar;
        avatarImage.style.display = 'block';
        avatarInitials.style.display = 'none';
    } else {
        const initials = getInitials(user.name || user.email);
        avatarInitials.textContent = initials;
        avatarImage.style.display = 'none';
        avatarInitials.style.display = 'flex';
    }
}

// Obter iniciais do nome
function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Formato nao suportado. Use JPG, PNG ou WEBP.', 'error');
        return;
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('A imagem deve ter no maximo 10MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const maxSize = 512;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            tempAvatarData = canvas.toDataURL('image/jpeg', 0.9);

            const avatarImage = document.getElementById('avatar-image');
            const avatarInitials = document.getElementById('avatar-initials');

            avatarImage.src = tempAvatarData;
            avatarImage.style.display = 'block';
            avatarInitials.style.display = 'none';

            showNotification('Imagem carregada! Clique em "Salvar Alteracoes"', 'success');
        };

        img.onerror = function() {
            showNotification('Nao foi possivel processar a imagem', 'error');
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// Renderizar estatísticas
async function renderProfileStats() {
    try {
        // Buscar tarefas
        const tasksResponse = await fetch(`${API_URL}/tasks?userId=${currentUser.id}`);
        const userTasks = await tasksResponse.json();
        
        // Buscar transações
        const transactionsResponse = await fetch(`${API_URL}/transactions?userId=${currentUser.id}`);
        const userTransactions = await transactionsResponse.json();
        
        // Calcular estatísticas
        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(t => t.status === 'completed').length;
        
        const totalIncome = userTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = userTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Atualizar UI
        document.getElementById('stat-total-tasks').textContent = totalTasks;
        document.getElementById('stat-completed-tasks').textContent = completedTasks;
        document.getElementById('stat-total-income').textContent = `R$ ${totalIncome.toFixed(2)}`;
        document.getElementById('stat-total-expense').textContent = `R$ ${totalExpense.toFixed(2)}`;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}


function hydrateProfilePresentation(user) {
    const presentation = (user && user.presentation) ? user.presentation : {};

    setInputValue('profile-headline', presentation.headline);
    setInputValue('profile-bio', presentation.bio);
    setInputValue('profile-location', presentation.location);
    setInputValue('profile-availability', presentation.availability);
    setInputValue('profile-skills', presentation.skills);
    setInputValue('profile-contact', presentation.contact);
    setInputValue('profile-website', presentation.website);
    setInputValue('profile-linkedin', presentation.linkedin);
    setInputValue('profile-instagram', presentation.instagram);
    setInputValue('profile-whatsapp', presentation.whatsapp);

    const visibilityToggle = document.getElementById('profile-visibility-toggle');
    if (visibilityToggle) {
        visibilityToggle.checked = presentation.visibility === 'public';
    }

    updateProfileVisibilityLabel();
}

function initProfilePresentation() {
    const fields = [
        'profile-headline',
        'profile-bio',
        'profile-location',
        'profile-availability',
        'profile-skills',
        'profile-contact',
        'profile-website',
        'profile-linkedin',
        'profile-instagram',
        'profile-whatsapp'
    ];

    fields.forEach((id) => {
        const input = document.getElementById(id);
        if (!input || input.dataset.bound === 'true') return;
        input.dataset.bound = 'true';
        input.addEventListener('input', updateProfilePresentationPreview);
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', updateProfilePresentationPreview);
        }
    });

    const visibilityToggle = document.getElementById('profile-visibility-toggle');
    if (visibilityToggle && visibilityToggle.dataset.bound !== 'true') {
        visibilityToggle.dataset.bound = 'true';
        visibilityToggle.addEventListener('change', () => {
            updateProfileVisibilityLabel();
            updateProfilePresentationPreview();
        });
    }
}

function updateProfileVisibilityLabel() {
    const visibilityToggle = document.getElementById('profile-visibility-toggle');
    const label = document.getElementById('profile-visibility-label');
    if (!visibilityToggle || !label) return;
    label.textContent = visibilityToggle.checked ? 'Publico' : 'Privado';
}

function collectPresentationData() {
    const existing = currentUser && currentUser.presentation ? currentUser.presentation : {};
    const data = { ...existing };

    const headlineInput = document.getElementById('profile-headline');
    const bioInput = document.getElementById('profile-bio');
    const locationInput = document.getElementById('profile-location');
    const availabilityInput = document.getElementById('profile-availability');
    const skillsInput = document.getElementById('profile-skills');
    const contactInput = document.getElementById('profile-contact');
    const websiteInput = document.getElementById('profile-website');
    const linkedinInput = document.getElementById('profile-linkedin');
    const instagramInput = document.getElementById('profile-instagram');
    const whatsappInput = document.getElementById('profile-whatsapp');
    const visibilityToggle = document.getElementById('profile-visibility-toggle');

    if (headlineInput) data.headline = headlineInput.value.trim();
    if (bioInput) data.bio = bioInput.value.trim();
    if (locationInput) data.location = locationInput.value.trim();
    if (availabilityInput) data.availability = availabilityInput.value;
    if (skillsInput) data.skills = skillsInput.value.trim();
    if (contactInput) data.contact = contactInput.value.trim();
    if (websiteInput) data.website = websiteInput.value.trim();
    if (linkedinInput) data.linkedin = linkedinInput.value.trim();
    if (instagramInput) data.instagram = instagramInput.value.trim();
    if (whatsappInput) data.whatsapp = whatsappInput.value.trim();
    if (visibilityToggle) data.visibility = visibilityToggle.checked ? 'public' : 'private';

    return data;
}

function updateProfilePresentationPreview() {
    const data = collectPresentationData();

    setText('profile-preview-name', currentUser?.name || 'Usuario');
    setText('profile-preview-headline', data.headline || 'Headline nao definido');
    setText('profile-preview-bio', data.bio || 'Sem bio publicada.');
    setText('profile-preview-location', data.location || 'Local nao informado');
    setText('profile-preview-contact', data.contact || 'Contato nao informado');

    const availabilityEl = document.getElementById('profile-preview-availability');
    if (availabilityEl) {
        availabilityEl.textContent = data.availability || 'Indisponivel';
    }

    const visibilityText = data.visibility === 'public' ? 'Perfil publico' : 'Perfil privado';
    setText('profile-preview-visibility', visibilityText);

    renderPresentationLinks(data);
    renderPresentationSkills(data);
}

function renderPresentationLinks(data) {
    const container = document.getElementById('profile-preview-links');
    if (!container) return;

    const links = [
        { label: 'Site', value: data.website },
        { label: 'LinkedIn', value: data.linkedin },
        { label: 'Instagram', value: data.instagram },
        { label: 'WhatsApp', value: data.whatsapp }
    ].filter(item => item.value);

    if (links.length === 0) {
        container.innerHTML = '<span class="empty-inline">Sem links adicionados.</span>';
        return;
    }

    container.innerHTML = links.map(item => {
        const safeLabel = escapeHtml(item.label);
        const safeText = escapeHtml(item.value);
        const href = normalizeUrl(item.value);
        const safeHref = escapeHtml(href);
        return `<a class="preview-link" href="${safeHref}" target="_blank" rel="noopener noreferrer"><span>${safeLabel}</span><span>${safeText}</span></a>`;
    }).join('');
}

function renderPresentationSkills(data) {
    const container = document.getElementById('profile-preview-skills');
    if (!container) return;

    const skills = (data.skills || '')
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);

    if (skills.length === 0) {
        container.innerHTML = '<span class="empty-inline">Sem habilidades informadas.</span>';
        return;
    }

    container.innerHTML = skills.map(skill => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('');
}

function normalizeUrl(value) {
    if (!value) return '';
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;
    if (typeof value === 'undefined' || value === null) return;
    input.value = value;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


function renderProfileDashboard() {
    renderProfileOverview();
    renderProfileFocus();
    renderProfileActivity();
    renderProfileFinanceSummary();
    renderProfilePreferences();
    renderProfileSecurity();
    renderProfileDataStatus();
}

function renderProfileOverview() {
    if (!tasks) return;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress').length;
    const pending = tasks.filter(t => t.status === 'todo').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(t => t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < today).length;

    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    setText('profile-overview-total', total);
    setText('profile-overview-completed', completed);
    setText('profile-overview-progress', inProgress);
    setText('profile-overview-pending', pending);
    setText('profile-overview-overdue', overdue);
    setText('profile-overview-score', `${productivity}%`);

    const badge = document.getElementById('profile-productivity-badge');
    if (badge) {
        badge.textContent = `Produtividade ${productivity}% - ${getProductivityLevel(productivity)}`;
    }
}

function renderProfileFocus() {
    const container = document.getElementById('profile-focus-list');
    if (!container) return;

    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const focusTasks = [...tasks]
        .filter(t => t.status !== 'completed')
        .sort((a, b) => {
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;

            const aDue = a.dueDate ? new Date(a.dueDate) : null;
            const bDue = b.dueDate ? new Date(b.dueDate) : null;
            if (aDue && bDue) return aDue - bDue;
            if (aDue) return -1;
            if (bDue) return 1;
            return new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now());
        })
        .slice(0, 3);

    if (focusTasks.length === 0) {
        container.innerHTML = '<div class="empty-inline">Sem foco definido. Selecione tarefas priorit??rias.</div>';
        return;
    }

    const priorityLabels = {
        critical: 'CR??TICA',
        high: 'ALTA',
        medium: 'M??DIA',
        low: 'BAIXA'
    };

    container.innerHTML = focusTasks.map(task => {
        const dueDate = task.dueDate ? `Vence: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}` : 'Sem prazo';
        return `
            <div class="focus-item">
                <div class="focus-main">
                    <span class="focus-title">${task.title}</span>
                    <span class="focus-meta">${dueDate}</span>
                </div>
                <div class="focus-actions">
                    <span class="tag tag-priority-${task.priority}">${priorityLabels[task.priority]}</span>
                    <button class="btn btn-sm btn-secondary" onclick="openTaskModal(${task.id})">Abrir</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderProfileActivity() {
    const container = document.getElementById('profile-activity-list');
    if (!container) return;

    const events = [];

    tasks.forEach(task => {
        if (!task.createdAt) return;
        events.push({
            type: 'task',
            title: task.title,
            date: new Date(task.createdAt),
            label: 'Tarefa criada'
        });
    });

    transactions.forEach(tx => {
        if (!tx.date) return;
        events.push({
            type: tx.type,
            title: tx.description,
            date: new Date(tx.date),
            label: tx.type === 'income' ? 'Receita' : 'Despesa',
            amount: tx.amount
        });
    });

    events.sort((a, b) => b.date - a.date);
    const latest = events.slice(0, 6);

    if (latest.length === 0) {
        container.innerHTML = '<div class="empty-inline">Nenhuma atividade recente registrada.</div>';
        return;
    }

    container.innerHTML = latest.map(event => {
        const iconLabel = event.type === 'task' ? 'T' : event.type === 'income' ? '+' : '-';
        const formattedDate = formatDate(event.date);
        const amount = event.amount ? ` - ${event.type === 'income' ? '+' : '-'} R$ ${event.amount.toFixed(2)}` : '';
        return `
            <div class="activity-item">
                <div class="activity-icon ${event.type}">${iconLabel}</div>
                <div class="activity-content">
                    <div class="activity-title">${event.title}</div>
                    <div class="activity-meta">${event.label} - ${formattedDate}${amount}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderProfileFinanceSummary() {
    const incomeEl = document.getElementById('profile-finance-income');
    const expenseEl = document.getElementById('profile-finance-expense');
    const balanceEl = document.getElementById('profile-finance-balance');
    const periodEl = document.getElementById('profile-finance-period');
    const breakdownEl = document.getElementById('profile-finance-breakdown');

    if (!incomeEl || !expenseEl || !balanceEl || !periodEl || !breakdownEl) return;

    const now = new Date();
    const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    periodEl.textContent = monthLabel;

    const monthly = transactions.filter(tx => {
        const date = new Date(tx.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const totalIncome = monthly.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthly.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    incomeEl.textContent = `R$ ${totalIncome.toFixed(2)}`;
    expenseEl.textContent = `R$ ${totalExpense.toFixed(2)}`;
    balanceEl.textContent = `R$ ${balance.toFixed(2)}`;
    balanceEl.style.color = balance >= 0 ? 'var(--success)' : 'var(--danger)';

    if (totalExpense === 0) {
        breakdownEl.innerHTML = '<div class="empty-inline">Sem despesas registradas no m??s.</div>';
        return;
    }

    const byCategory = {};
    monthly.filter(t => t.type === 'expense').forEach(tx => {
        byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    });

    const topCategories = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    breakdownEl.innerHTML = topCategories.map(([category, amount]) => {
        const percent = Math.min((amount / totalExpense) * 100, 100);
        return `
            <div class="breakdown-row">
                <div class="breakdown-title">
                    <span>${category}</span>
                    <span>R$ ${amount.toFixed(2)}</span>
                </div>
                <div class="breakdown-bar">
                    <span style="width: ${percent.toFixed(1)}%"></span>
                </div>
            </div>
        `;
    }).join('');
}

function renderProfilePreferences() {
    const container = document.getElementById('profile-preferences');
    if (!container) return;

    container.querySelectorAll('.preference-toggle').forEach(toggle => {
        const key = toggle.dataset.pref;
        const stored = localStorage.getItem(`df_pref_${key}`);
        toggle.checked = stored !== null ? stored === 'true' : toggle.checked;

        if (toggle.dataset.bound === 'true') return;
        toggle.dataset.bound = 'true';
        toggle.addEventListener('change', () => {
            localStorage.setItem(`df_pref_${key}`, toggle.checked);
        });
    });
}

function renderProfileSecurity() {
    setText('profile-security-email', currentUser?.email || '-');

    const sessionSince = localStorage.getItem('dailyFocusSessionStart');
    const lastLogin = localStorage.getItem('dailyFocusLastLogin');

    setText('profile-session-since', sessionSince ? formatDateTime(new Date(sessionSince)) : '-');
    setText('profile-last-login', lastLogin ? formatDateTime(new Date(lastLogin)) : '-');
}

function renderProfileDataStatus() {
    const lastBackup = localStorage.getItem('dailyFocusLastBackup');
    setText('profile-last-backup', lastBackup ? formatDateTime(new Date(lastBackup)) : 'Nenhum backup recente');
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(date) {
    const datePart = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} - ${timePart}`;
}

function getProductivityLevel(score) {
    if (score >= 85) return 'Elite';
    if (score >= 70) return 'Forte';
    if (score >= 50) return 'Constante';
    if (score >= 30) return 'Em evolu????o';
    return 'Iniciante';
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// Salvar perfil
async function saveProfile() {
    try {
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const passwordInput = document.getElementById('profile-password');
        const passwordConfirmInput = document.getElementById('profile-password-confirm');

        const name = nameInput ? nameInput.value.trim() : (currentUser?.name || '');
        const email = emailInput ? emailInput.value.trim() : (currentUser?.email || '');
        const password = passwordInput ? passwordInput.value : '';
        const passwordConfirm = passwordConfirmInput ? passwordConfirmInput.value : '';
        
        // Validações
        if ((nameInput || emailInput) && !name) {
            showNotification('Por favor, preencha o nome', 'error');
            return;
        }
        
        if ((nameInput || emailInput) && !email) {
            showNotification('Por favor, preencha o email', 'error');
            return;
        }
        
        // Validar email
        if (emailInput) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Email inválido', 'error');
                return;
            }
        }
        
        // Se preencheu senha, validar
        if (passwordInput && password) {
            if (password.length < 6) {
                showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }
            
            if (password !== passwordConfirm) {
                showNotification('As senhas não conferem', 'error');
                return;
            }
        }
        
        // Preparar dados
        const updateData = {};
        if (name) {
            updateData.name = name;
        }
        if (email) {
            updateData.email = email;
        }
        if (document.getElementById('profile-headline')) {
            updateData.presentation = collectPresentationData();
        }
        
        // Adicionar senha se foi alterada
        if (passwordInput && password) {
            updateData.password = password;
        }
        
        // Adicionar avatar se foi alterado
        if (tempAvatarData) {
            updateData.avatar = tempAvatarData;
        }
        
        // Enviar atualização
        showLoader('Salvando perfil...');
        
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        let updatedUser = null;
        try {
            updatedUser = await response.json();
        } catch (parseError) {
            updatedUser = null;
        }

        if (!response.ok) {
            const serverMessage = updatedUser && updatedUser.error ? updatedUser.error : null;
            const statusMessage = `Erro ao atualizar perfil (${response.status})`;
            throw new Error(serverMessage || statusMessage);
        }

        hideLoader();
        
        if (!updatedUser) {
            updatedUser = { ...currentUser, ...updateData };
        }

        // Atualizar dados globais
        currentUser = updatedUser;
        
        // Limpar campos de senha
        if (passwordInput) {
            passwordInput.value = '';
        }
        if (passwordConfirmInput) {
            passwordConfirmInput.value = '';
        }
        
        // Limpar foto temporária
        tempAvatarData = null;
        
        // Atualizar sidebar
        updateUserProfileDisplay();
        
        showNotification('Perfil atualizado com sucesso!', 'success');
        
        // Recarregar dados
        await renderProfileData();
        
    } catch (error) {
        hideLoader();
        console.error('Erro ao salvar perfil:', error);
        showNotification('Erro ao salvar perfil', 'error');
    }
}

// Cancelar edição
function cancelProfileEdit() {
    // Recarregar dados originais
    renderProfileData();
    
    // Limpar campos de senha
    const passwordInput = document.getElementById('profile-password');
    const passwordConfirmInput = document.getElementById('profile-password-confirm');
    if (passwordInput) {
        passwordInput.value = '';
    }
    if (passwordConfirmInput) {
        passwordConfirmInput.value = '';
    }
    
    // Limpar foto temporária
    tempAvatarData = null;
    
    showNotification('Alterações canceladas', 'success');
}

// Atualizar display do usuário na sidebar
function updateUserProfileDisplay() {
    const userNameElement = document.querySelector('.user-details h3');
    const userEmailElement = document.querySelector('.user-details p');
    const userAvatarElement = document.querySelector('.user-avatar');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'Usuário';
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = currentUser.email || '';
    }
    
    if (userAvatarElement) {
        if (currentUser.avatar) {
            userAvatarElement.innerHTML = `<img src="${currentUser.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            const initials = getInitials(currentUser.name || currentUser.email);
            userAvatarElement.textContent = initials;
        }
    }
}

// Confirmar deleção de conta
function confirmDeleteAccount() {
    const confirmation = confirm(
        '⚠️ ATENÇÃO!\n\n' +
        'Tem certeza que deseja deletar sua conta?\n\n' +
        'Esta ação é PERMANENTE e você perderá:\n' +
        '• Todas as suas tarefas\n' +
        '• Todas as suas transações\n' +
        '• Todos os seus orçamentos\n' +
        '• Todos os seus dados\n\n' +
        'Digite "DELETAR" para confirmar.'
    );
    
    if (confirmation) {
        const confirmText = prompt('Digite "DELETAR" para confirmar:');
        
        if (confirmText === 'DELETAR') {
            deleteAccount();
        } else {
            showNotification('Deleção cancelada', 'success');
        }
    }
}

// Deletar conta
async function deleteAccount() {
    try {
        showLoader('Deletando conta...');
        
        // Deletar usuário
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao deletar conta');
        }
        
        hideLoader();
        
        showNotification('Conta deletada com sucesso', 'success');
        
        // Fazer logout
        setTimeout(() => {
            logout();
        }, 2000);
        
    } catch (error) {
        hideLoader();
        console.error('Erro ao deletar conta:', error);
        showNotification('Erro ao deletar conta', 'error');
    }
}

// Adicionar item de perfil no menu
function addProfileMenuItem() {
    const menuSection = document.querySelector('.nav-section');
    if (!menuSection) return;
    
    // Verificar se já existe
    if (document.getElementById('nav-profile')) return;
    
    // Criar item
    const profileItem = document.createElement('div');
    profileItem.id = 'nav-profile';
    profileItem.className = 'nav-item';
    profileItem.innerHTML = `
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        Meu Perfil
    `;
    profileItem.onclick = () => loadProfilePage();
    
    // Adicionar antes do botão de sair
    const logoutButton = document.querySelector('.sidebar-footer');
    if (logoutButton) {
        logoutButton.parentElement.insertBefore(profileItem, logoutButton);
    }
}

// Inicializar ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (currentUser) {
            addProfileMenuItem();
        }
    });
} else {
    if (currentUser) {
        addProfileMenuItem();
    }
}

// ============================================
// PROFILE PAGE - MODIFICADO
// SUBSTITUA a função addProfileMenuItem() no script.js
// por essa versão nova
// ============================================

// Tornar o card de perfil clicável
function makeProfileCardClickable() {
    const userProfile = document.querySelector('.user-profile');
    if (!userProfile) return;
    if (userProfile.dataset.profileClickable === 'true') return;
    userProfile.dataset.profileClickable = 'true';
    
    // Adicionar cursor pointer
    userProfile.style.cursor = 'pointer';
    userProfile.style.transition = 'all 0.3s ease';
    
    // Adicionar hover effect
    userProfile.addEventListener('mouseenter', () => {
        userProfile.style.background = 'var(--surface-hover)';
    });
    
    userProfile.addEventListener('mouseleave', () => {
        userProfile.style.background = 'var(--bg-tertiary)';
    });
    
    // Adicionar click event
    userProfile.addEventListener('click', loadProfilePage);
    
    console.log('✅ Card de perfil agora é clicável!');
}

// Remover a função antiga addProfileMenuItem() se existir
// E inicializar a nova
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (currentUser) {
            makeProfileCardClickable();
        }
    });
} else {
    if (currentUser) {
        makeProfileCardClickable();
    }
}

// ============================================
// RESTO DO CÓDIGO PROFILE PERMANECE IGUAL
// (loadProfilePage, renderProfileData, etc)
// ============================================

// ============================================
// TASK MANAGEMENT
// ============================================

async function saveTask() {
    const title = document.getElementById('task-title-input').value;
    const description = document.getElementById('task-description-input').value;
    const priority = document.getElementById('task-priority-input').value;
    const dueDate = document.getElementById('task-date-input').value;
    const status = document.getElementById('task-status-input').value;
    const form = document.getElementById('task-form');
    const groupPageView = document.getElementById('group-page-view');
    const formScope = form?.dataset?.scope || currentTaskScope;
    const rawFormGroupId = form?.dataset?.groupId ? parseInt(form.dataset.groupId, 10) : null;
    const rawPageGroupId = groupPageView?.dataset?.groupId ? parseInt(groupPageView.dataset.groupId, 10) : null;
    const formGroupId = Number.isNaN(rawFormGroupId) ? null : rawFormGroupId;
    const pageGroupId = Number.isNaN(rawPageGroupId) ? null : rawPageGroupId;
    const isOnGroupPage = currentView === 'group-page';
    const isGroupPageVisible = groupPageView && getComputedStyle(groupPageView).display !== 'none';
    const isGroupTask = formScope === 'group' || currentTaskScope === 'group' || isOnGroupPage || isGroupPageVisible || !!pageGroupId;
    const taskList = isGroupTask ? groupTasks : tasks;
    const assigneeInput = document.getElementById('task-assignee-input');
    const selectedAssignees = isGroupTask && assigneeInput && assigneeInput.value
        ? assigneeInput.value
            .split(',')
            .map(value => parseInt(value, 10))
            .filter(value => !Number.isNaN(value))
        : [];
    const assignedTo = isGroupTask ? selectedAssignees : [];
    const effectiveGroupId = isGroupTask ? (formGroupId || pageGroupId || currentGroupId) : null;

    if (isGroupTask && !effectiveGroupId) {
        showNotification('Selecione um grupo antes de criar tarefas', 'error');
        return;
    }
    
    await autoSave.save(async () => {
        if (editingTaskId) {
            const taskData = {
                title,
                description,
                priority,
                dueDate,
                status,
                ...(isGroupTask ? { assignedTo, groupId: effectiveGroupId } : {})
            };
            
            const updatedTask = await API.updateTask(editingTaskId, taskData);
            const taskIndex = taskList.findIndex(t => t.id === editingTaskId);
            taskList[taskIndex] = updatedTask;
        } else {
            const newTask = {
                userId: currentUser.id,
                title,
                description,
                priority,
                dueDate,
                status,
                ...(isGroupTask ? { assignedTo } : {}),
                groupId: isGroupTask ? effectiveGroupId : null
            };
            
            const createdTask = await API.createTask(newTask);
            const createdGroupId = createdTask?.groupId ?? null;
            const shouldFixGroupId = isGroupTask && effectiveGroupId && Number(createdGroupId) !== Number(effectiveGroupId);

            if (shouldFixGroupId) {
                const fixedTask = await API.updateTask(createdTask.id, {
                    groupId: effectiveGroupId,
                    assignedTo
                });
                taskList.push(fixedTask);
            } else {
                taskList.push(createdTask);
            }
        }

        if (isGroupTask) {
            groupTasks = taskList;
        } else {
            tasks = taskList;
        }
    });
    
    if (isGroupTask) {
        renderGroupTasks();
    } else {
        renderTasks();
        updateAllStats();
    }
    closeTaskModal();
}

async function deleteTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        await autoSave.save(async () => {
            await API.deleteTask(id);
            tasks = tasks.filter(t => t.id !== id);
        });
        
        renderTasks();
        updateAllStats();
    }
}

async function updateTaskStatus(id, status) {
    await autoSave.save(async () => {
        const task = tasks.find(t => t.id === id);
        const updatedTask = await API.updateTask(id, { ...task, status });
        const taskIndex = tasks.findIndex(t => t.id === id);
        tasks[taskIndex] = updatedTask;
    });
    
    renderTasks();
    updateAllStats();
}

async function deleteGroupTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        await autoSave.save(async () => {
            await API.deleteTask(id);
            groupTasks = groupTasks.filter(t => t.id !== id);
        });

        renderGroupTasks();
    }
}

async function updateGroupTaskStatus(id, status) {
    await autoSave.save(async () => {
        const task = groupTasks.find(t => t.id === id);
        const updatedTask = await API.updateTask(id, { ...task, status });
        const taskIndex = groupTasks.findIndex(t => t.id === id);
        groupTasks[taskIndex] = updatedTask;
    });

    renderGroupTasks();
}

// ============================================
// FINANCE MANAGEMENT
// ============================================

function setTransactionType(type) {
    currentTransactionType = type;
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateCategorySelect();
}

function updateCategorySelect() {
    const select = document.getElementById('finance-category-input');
    select.innerHTML = '<option value="">Selecione...</option>';
    
    const categories = CATEGORIES[currentTransactionType];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

function updateCategoryFilters() {
    const select = document.getElementById('finance-category-filter');
    select.innerHTML = '<option value="all">Todas</option>';
    
    const allCategories = [...new Set([...CATEGORIES.income, ...CATEGORIES.expense])];
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

async function saveTransaction() {
    const description = document.getElementById('finance-description-input').value;
    const amount = parseFloat(document.getElementById('finance-amount-input').value);
    const category = document.getElementById('finance-category-input').value;
    const date = document.getElementById('finance-date-input').value;
    const notes = document.getElementById('finance-notes-input').value;
    
    if (!category) {
        alert('Por favor, selecione uma categoria');
        return;
    }
    
    await autoSave.save(async () => {
        if (editingTransactionId) {
            const txData = {
                description,
                amount,
                category,
                date,
                notes
            };
            
            const updatedTx = await API.updateTransaction(editingTransactionId, txData);
            const txIndex = transactions.findIndex(t => t.id === editingTransactionId);
            transactions[txIndex] = updatedTx;
        } else {
            const newTransaction = {
                userId: currentUser.id,
                type: currentTransactionType,
                description,
                amount,
                category,
                date,
                notes
            };
            
            const createdTx = await API.createTransaction(newTransaction);
            transactions.push(createdTx);
            
            // Se for despesa, atualizar gasto na categoria do orçamento
            if (currentTransactionType === 'expense') {
                try {
                    await API.updateSpent(currentUser.id, category, amount);
                    budgets = await API.getBudgets(currentUser.id);
                } catch (error) {
                    console.log('Categoria não está no orçamento ou orçamento não existe ainda');
                }
            }
        }
    });
    
    renderTransactions();
    updateAllStats();
    if (currentView === 'finance') {
        renderBudgetDashboard();
    }
    closeFinanceModal();
}

async function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        await autoSave.save(async () => {
            await API.deleteTransaction(id);
            transactions = transactions.filter(t => t.id !== id);
        });
        
        renderTransactions();
        updateAllStats();
    }
}

async function syncDatabase() {
    autoSave.showSaving();
    
    try {
        tasks = await API.getTasks(currentUser.id);
        transactions = await API.getTransactions(currentUser.id);
        groups = await API.getGroups(currentUser.id);
        groupTasks = [];
        renderTasks();
        renderTransactions();
        renderGroups();
        updateAllStats();
        autoSave.showSaved();
    } catch (error) {
        console.error('Sync error:', error);
        autoSave.showError('Erro ao sincronizar');
    }
}

// ============================================
// BACKUP & EXPORT
// ============================================

async function exportData() {
    try {
        const backup = await API.getBackup();
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `daily-focus-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        localStorage.setItem('dailyFocusLastBackup', new Date().toISOString());
        renderProfileDataStatus();
        
        autoSave.showSaved();
    } catch (error) {
        console.error('Export error:', error);
        alert('Erro ao exportar dados');
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (confirm(`Importar backup completo? Isso vai SUBSTITUIR todos os dados atuais!`)) {
                autoSave.showSaving();
                
                await API.restoreBackup(backup.data || backup);
                
                // Recarregar dados do usuário
                tasks = await API.getTasks(currentUser.id);
                transactions = await API.getTransactions(currentUser.id);
                
                renderTasks();
                renderTransactions();
                updateAllStats();
                autoSave.showSaved();
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Erro ao importar dados. Verifique se o arquivo está correto.');
        }
    };
    
    reader.readAsText(file);
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function showView(view) {
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const mainApp = document.getElementById('main-app');
    const profileView = document.getElementById('profile-view');

    [loginScreen, registerScreen, mainApp, profileView].forEach((el) => {
        if (el) el.classList.add('hidden');
    });

    if (view === 'login') {
        if (loginScreen) loginScreen.classList.remove('hidden');
    } else if (view === 'register') {
        if (registerScreen) registerScreen.classList.remove('hidden');
    } else if (view === 'profile') {
        if (profileView) profileView.classList.remove('hidden');
    } else {
        if (mainApp) mainApp.classList.remove('hidden');
    }
}

function switchView(view, sourceEl) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = sourceEl || (typeof event !== 'undefined' && event?.target ? event.target.closest('.nav-item') : null);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    document.getElementById('tasks-view').style.display = 'none';
    document.getElementById('finance-view').style.display = 'none';
    document.getElementById('analytics-view').style.display = 'none';
    const groupsView = document.getElementById('groups-view');
    const groupPageView = document.getElementById('group-page-view');
    if (groupsView) {
        groupsView.style.display = 'none';
    }
    if (groupPageView) {
        groupPageView.style.display = 'none';
    }
    
    if (view === 'tasks') {
        document.getElementById('tasks-view').style.display = 'block';
        currentTaskScope = 'personal';
    } else if (view === 'finance') {
        document.getElementById('finance-view').style.display = 'block';
        renderFinanceStats();
        renderBudgetDashboard();
    } else if (view === 'groups') {
        if (groupsView) {
            groupsView.style.display = 'block';
        }
        refreshGroups();
    } else if (view === 'group-page') {
        if (groupPageView) {
            groupPageView.style.display = 'block';
        }
        currentTaskScope = 'group';
        renderGroupPage();
    } else if (view === 'analytics') {
        document.getElementById('analytics-view').style.display = 'block';
        renderAnalytics();
    }
}

function openTaskModal(taskId = null, scope = 'personal') {
    editingTaskId = taskId;
    currentTaskScope = scope;
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const groupPageView = document.getElementById('group-page-view');
    const sourceTasks = scope === 'group' ? groupTasks : tasks;
    const assigneeGroup = document.getElementById('task-assignee-group');
    const assigneeInput = document.getElementById('task-assignee-input');

    if (form) {
        const rawPageGroupId = groupPageView?.dataset?.groupId ? parseInt(groupPageView.dataset.groupId, 10) : null;
        const pageGroupId = Number.isNaN(rawPageGroupId) ? null : rawPageGroupId;
        const resolvedGroupId = scope === 'group' ? (currentGroupId || pageGroupId) : null;
        form.dataset.scope = scope;
        form.dataset.groupId = resolvedGroupId ? String(resolvedGroupId) : '';
    }

    if (assigneeGroup) {
        if (scope === 'group') {
            assigneeGroup.style.display = 'block';
            populateGroupAssigneeOptions();
        } else {
            assigneeGroup.style.display = 'none';
            if (assigneeInput) {
                assigneeInput.value = '';
            }
            setAssigneeSelection([]);
        }
    }
    
    if (taskId) {
        const task = sourceTasks.find(t => t.id === taskId);
        document.getElementById('task-modal-title').textContent = 'Editar Tarefa';
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-description-input').value = task.description || '';
        document.getElementById('task-priority-input').value = task.priority;
        document.getElementById('task-date-input').value = task.dueDate || '';
        document.getElementById('task-status-input').value = task.status;
        if (scope === 'group') {
            const assignedIds = normalizeAssignedIds(task.assignedTo);
            renderAssigneeChips(assignedIds);
            setAssigneeSelection(assignedIds);
        }
    } else {
        document.getElementById('task-modal-title').textContent = 'Nova Tarefa';
        document.getElementById('task-form').reset();
        renderAssigneeChips([]);
        setAssigneeSelection([]);
    }
    
    modal.classList.add('active');
}

function openGroupTaskModal(taskId = null) {
    const groupPageView = document.getElementById('group-page-view');
    const rawPageGroupId = groupPageView?.dataset?.groupId ? parseInt(groupPageView.dataset.groupId, 10) : null;
    const pageGroupId = Number.isNaN(rawPageGroupId) ? null : rawPageGroupId;

    if (!currentGroupId && pageGroupId) {
        currentGroupId = pageGroupId;
    }

    if (!currentGroupId) {
        showNotification('Selecione um grupo antes de criar tarefas', 'error');
        return;
    }

    openTaskModal(taskId, 'group');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    editingTaskId = null;
}

function openFinanceModal(type = 'income', transactionId = null) {
    editingTransactionId = transactionId;
    currentTransactionType = type;
    const modal = document.getElementById('finance-modal');
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(type)) {
            btn.classList.add('active');
        }
    });
    
    updateCategorySelect();
    
    if (transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        currentTransactionType = transaction.type;
        
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains(transaction.type)) {
                btn.classList.add('active');
            }
        });
        
        updateCategorySelect();
        
        document.getElementById('finance-modal-title').textContent = 'Editar Transação';
        document.getElementById('finance-description-input').value = transaction.description;
        document.getElementById('finance-amount-input').value = transaction.amount;
        document.getElementById('finance-category-input').value = transaction.category;
        document.getElementById('finance-date-input').value = transaction.date;
        document.getElementById('finance-notes-input').value = transaction.notes || '';
    } else {
        document.getElementById('finance-modal-title').textContent = type === 'income' ? 'Nova Receita' : 'Nova Despesa';
        document.getElementById('finance-form').reset();
        document.getElementById('finance-date-input').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
}

function closeFinanceModal() {
    document.getElementById('finance-modal').classList.remove('active');
    editingTransactionId = null;
}

function filterTasksByStatus(status) {
    document.getElementById('task-status-filter').value = status;
    renderTasks();
}


// ============================================
// FILTERING
// ============================================

function getFilteredTasks() {
    let filtered = [...tasks].filter(task => task.groupId == null);
    
    const search = document.getElementById('task-search-input').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(search) || 
            (t.description && t.description.toLowerCase().includes(search))
        );
    }
    
    const statusFilter = document.getElementById('task-status-filter').value;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    const priorityFilter = document.getElementById('task-priority-filter').value;
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    const sort = document.getElementById('task-sort-select').value;
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    filtered.sort((a, b) => {
        switch(sort) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority-high':
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'priority-low':
                return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
    });
    
    return filtered;
}

function getFilteredGroupTasks() {
    let filtered = [...groupTasks];

    const searchEl = document.getElementById('group-task-search-input');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    if (search) {
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(search) ||
            (t.description && t.description.toLowerCase().includes(search))
        );
    }

    const statusEl = document.getElementById('group-task-status-filter');
    const statusFilter = statusEl ? statusEl.value : 'all';
    if (statusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === statusFilter);
    }

    const priorityEl = document.getElementById('group-task-priority-filter');
    const priorityFilter = priorityEl ? priorityEl.value : 'all';
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    const assigneeEl = document.getElementById('group-task-assignee-filter');
    const assigneeFilter = assigneeEl ? assigneeEl.value : 'all';
    if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(t => normalizeAssignedIds(t.assignedTo).length === 0);
    } else if (assigneeFilter !== 'all') {
        const assigneeId = parseInt(assigneeFilter, 10);
        filtered = filtered.filter(t => normalizeAssignedIds(t.assignedTo).includes(assigneeId));
    }

    const sortEl = document.getElementById('group-task-sort-select');
    const sort = sortEl ? sortEl.value : 'date-desc';
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
        switch (sort) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority-high':
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'priority-low':
                return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
    });

    return filtered;
}

function getFilteredTransactions() {
    let filtered = [...transactions];
    
    const search = document.getElementById('finance-search-input').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(t => 
            t.description.toLowerCase().includes(search) || 
            (t.notes && t.notes.toLowerCase().includes(search)) ||
            t.category.toLowerCase().includes(search)
        );
    }
    
    const typeFilter = document.getElementById('finance-type-filter').value;
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    const categoryFilter = document.getElementById('finance-category-filter').value;
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    const periodFilter = document.getElementById('finance-period-filter').value;
    if (periodFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            
            switch(periodFilter) {
                case 'today':
                    return transactionDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return transactionDate >= weekAgo;
                case 'month':
                    return transactionDate.getMonth() === now.getMonth() && 
                           transactionDate.getFullYear() === now.getFullYear();
                case 'year':
                    return transactionDate.getFullYear() === now.getFullYear();
            }
        });
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
}

// ============================================
// RENDERING - TASKS
// ============================================

function renderTasks() {
    const container = document.getElementById('tasks-container');
    const filtered = getFilteredTasks();
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 style="margin-bottom: 0.5rem;">Nenhuma tarefa encontrada</h3>
                <p>Crie uma nova tarefa ou ajuste os filtros</p>
            </div>
        `;
        return;
    }
    
    const priorityLabels = {
        critical: 'CRÍTICA',
        high: 'ALTA',
        medium: 'MÉDIA',
        low: 'BAIXA'
    };
    
    const statusLabels = {
        todo: 'Pendente',
        inProgress: 'Em Progresso',
        completed: 'Concluída'
    };
    
    container.innerHTML = filtered.map(task => {
        const date = new Date(task.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
        
        return `
            <div class="task-card ${task.status === 'completed' ? 'completed' : ''}">
                <div class="task-header">
                    <div class="task-info">
                        <h3 class="task-title ${task.status === 'completed' ? 'completed' : ''}">
                            ${task.title}
                        </h3>
                        ${task.description ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">${task.description}</p>` : ''}
                        <div class="task-meta">
                            <div class="meta-item">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${formattedDate}
                            </div>
                            ${task.dueDate ? `
                                <div class="meta-item">
                                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Vence: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                </div>
                            ` : ''}
                            <span class="tag tag-priority-${task.priority}">
                                ${priorityLabels[task.priority]}
                            </span>
                            <span class="tag tag-status tag-status-${task.status}">
                                ${statusLabels[task.status]}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        ${task.status !== 'completed' ? `
                            <button class="btn btn-sm btn-secondary" onclick="updateTaskStatus(${task.id}, 'completed')" title="Marcar como concluída">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary" onclick="openTaskModal(${task.id})" title="Editar">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="deleteTask(${task.id})" title="Excluir">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderGroupTasks() {
    const container = document.getElementById('group-tasks-container');
    if (!container) return;

    const filtered = getFilteredGroupTasks();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 style="margin-bottom: 0.5rem;">Nenhuma tarefa do grupo</h3>
                <p>Crie uma nova tarefa para o grupo</p>
            </div>
        `;
        return;
    }

    const priorityLabels = {
        critical: 'CRITICA',
        high: 'ALTA',
        medium: 'MEDIA',
        low: 'BAIXA'
    };

    const statusLabels = {
        todo: 'Pendente',
        inProgress: 'Em Progresso',
        completed: 'Concluida'
    };

    container.innerHTML = filtered.map(task => {
        const date = new Date(task.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const assignedIds = normalizeAssignedIds(task.assignedTo);
        const assigneeHtml = assignedIds.length ? `
            <div class="task-assignee-list">
                ${assignedIds.map(assigneeId => {
                    const assignee = getGroupMemberById(assigneeId);
                    const assigneeName = assignee ? (assignee.name || assignee.email || 'Usuario') : 'Usuario';
                    const assigneeInitials = escapeHtml(getInitials(assigneeName));
                    const assigneeAvatar = assignee && assignee.avatar
                        ? `<img src="${assignee.avatar}" alt="${escapeHtml(assigneeName)}">`
                        : assigneeInitials;

                    return `
                        <span class="task-assignee">
                            <span class="task-assignee-avatar">${assigneeAvatar}</span>
                            ${escapeHtml(assigneeName)}
                        </span>
                    `;
                }).join('')}
            </div>
        ` : '';

        return `
            <div class="task-card ${task.status === 'completed' ? 'completed' : ''}">
                <div class="task-header">
                    <div class="task-info">
                        <h3 class="task-title ${task.status === 'completed' ? 'completed' : ''}">
                            ${task.title}
                        </h3>
                        ${task.description ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">${task.description}</p>` : ''}
                        <div class="task-meta">
                            <div class="meta-item">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${formattedDate}
                            </div>
                            ${task.dueDate ? `
                                <div class="meta-item">
                                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Vence: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                </div>
                            ` : ''}
                            <span class="tag tag-priority-${task.priority}">
                                ${priorityLabels[task.priority]}
                            </span>
                            <span class="tag tag-status tag-status-${task.status}">
                                ${statusLabels[task.status]}
                            </span>
                            ${assigneeHtml}
                        </div>
                    </div>
                    <div class="task-actions">
                        ${task.status !== 'completed' ? `
                            <button class="btn btn-sm btn-secondary" onclick="updateGroupTaskStatus(${task.id}, 'completed')" title="Marcar como concluida">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary" onclick="openGroupTaskModal(${task.id})" title="Editar">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="deleteGroupTask(${task.id})" title="Excluir">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// RENDERING - TRANSACTIONS
// ============================================

function renderTransactions() {
    const container = document.getElementById('transactions-container');
    const filtered = getFilteredTransactions();
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 style="margin-bottom: 0.5rem;">Nenhuma transação encontrada</h3>
                <p>Adicione sua primeira receita ou despesa</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(tx => {
        const date = new Date(tx.date);
        const formattedDate = date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
        
        return `
            <div class="transaction-card ${tx.type}">
                <div class="transaction-header">
                    <div class="transaction-info">
                        <h3 class="transaction-title">${tx.description}</h3>
                        ${tx.notes ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">${tx.notes}</p>` : ''}
                        <div class="transaction-meta">
                            <div class="meta-item">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${formattedDate}
                            </div>
                            <span class="tag tag-category">${tx.category}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="amount ${tx.type}">
                            ${tx.type === 'income' ? '+' : '-'} R$ ${tx.amount.toFixed(2)}
                        </div>
                        <div class="transaction-actions">
                            ${tx.type === 'income' ? `
                                <button class="btn btn-sm btn-success" onclick="openBudgetModal(transactions.find(t => t.id === ${tx.id}))" title="Alocar Orçamento">
                                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-secondary" onclick="openFinanceModal('${tx.type}', ${tx.id})" title="Editar">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="deleteTransaction(${tx.id})" title="Excluir">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// STATS
// ============================================

function renderFinanceStats() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('finance-stats-grid').innerHTML = `
        <div class="stat-card balance">
            <div class="stat-header">
                <span class="stat-label">Saldo Atual</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value" style="color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'}">R$ ${balance.toFixed(2)}</div>
            <div class="stat-description">Receitas - Despesas</div>
        </div>
        
        <div class="stat-card income">
            <div class="stat-header">
                <span class="stat-label">Total Receitas</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value" style="color: var(--income)">R$ ${totalIncome.toFixed(2)}</div>
            <div class="stat-description">${transactions.filter(t => t.type === 'income').length} entradas</div>
        </div>
        
        <div class="stat-card expense">
            <div class="stat-header">
                <span class="stat-label">Total Despesas</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value" style="color: var(--expense)">R$ ${totalExpense.toFixed(2)}</div>
            <div class="stat-description">${transactions.filter(t => t.type === 'expense').length} saídas</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">Total Transações</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value">${transactions.length}</div>
            <div class="stat-description">Registros no servidor</div>
        </div>
    `;
}

function updateAllStats() {
    updateTaskStats();
    updateFinanceNavStats();
    const profileView = document.getElementById('profile-view');
    if (profileView && !profileView.classList.contains('hidden')) {
        renderProfileDashboard();
    }
}

function updateTaskStats() {
    const personalTasks = tasks.filter(task => task.groupId == null);
    const stats = {
        total: personalTasks.length,
        todo: personalTasks.filter(t => t.status === 'todo').length,
        inProgress: personalTasks.filter(t => t.status === 'inProgress').length,
        completed: personalTasks.filter(t => t.status === 'completed').length
    };
    
    document.getElementById('nav-total-tasks').textContent = stats.total;
    document.getElementById('nav-todo').textContent = stats.todo;
    document.getElementById('nav-progress').textContent = stats.inProgress;
    document.getElementById('nav-completed').textContent = stats.completed;
}

function updateFinanceNavStats() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('nav-balance').textContent = `R$ ${balance.toFixed(2)}`;
}

function renderAnalytics() {
    const taskStats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'inProgress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        critical: tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length,
        completion: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('analytics-stats-grid').innerHTML = `
        <div class="stat-card total">
            <div class="stat-header">
                <span class="stat-label">Total de Tarefas</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value">${taskStats.total}</div>
            <div class="stat-description">Tarefas no servidor</div>
        </div>
        
        <div class="stat-card pending">
            <div class="stat-header">
                <span class="stat-label">Pendentes</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </div>
            </div>
            <div class="stat-value">${taskStats.todo}</div>
            <div class="stat-description">Aguardando início</div>
        </div>
        
        <div class="stat-card progress">
            <div class="stat-header">
                <span class="stat-label">Em Andamento</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value">${taskStats.inProgress}</div>
            <div class="stat-description">Tarefas ativas</div>
        </div>
        
        <div class="stat-card completed">
            <div class="stat-header">
                <span class="stat-label">Concluídas</span>
                <div class="stat-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <div class="stat-value">${taskStats.completed}</div>
            <div class="stat-description">Tarefas finalizadas</div>
        </div>
    `;
    
    document.getElementById('completion-rate').textContent = `${taskStats.completion}%`;
    document.getElementById('main-progress-bar').style.width = `${taskStats.completion}%`;
    
    document.getElementById('critical-pending').textContent = taskStats.critical;
    document.getElementById('analytics-balance').textContent = `R$ ${balance.toFixed(2)}`;
    document.getElementById('analytics-balance').style.color = balance >= 0 ? 'var(--success)' : 'var(--danger)';
    document.getElementById('productivity-score').textContent = `${taskStats.completion}%`;
}

// ============================================
// BUDGET MANAGEMENT (ORÇAMENTO)
// ============================================

function openBudgetModal(transaction) {
    currentBudgetTransaction = transaction;
    const modal = document.getElementById('budget-modal');
    
    document.getElementById('budget-modal-title').textContent = `💰 Alocar Receita: R$ ${transaction.amount.toFixed(2)}`;
    document.getElementById('budget-total-amount').textContent = `R$ ${transaction.amount.toFixed(2)}`;
    
    // Carregar alocação existente se houver
    loadBudgetAllocations(transaction.id, transaction.amount);
    
    modal.classList.add('active');
}

function closeBudgetModal() {
    document.getElementById('budget-modal').classList.remove('active');
    currentBudgetTransaction = null;
}

async function loadBudgetAllocations(transactionId, totalAmount) {
    try {
        const budget = await API.getBudgetByTransaction(transactionId);
        
        if (budget && budget.allocations) {
            renderBudgetAllocations(budget.allocations, totalAmount);
        } else {
            // Criar alocações vazias
            const emptyAllocations = BUDGET_CATEGORIES.map(cat => ({
                category: cat.name,
                planned: 0,
                spent: 0
            }));
            renderBudgetAllocations(emptyAllocations, totalAmount);
        }
    } catch (error) {
        // Criar alocações vazias se não existir
        const emptyAllocations = BUDGET_CATEGORIES.map(cat => ({
            category: cat.name,
            planned: 0,
            spent: 0
        }));
        renderBudgetAllocations(emptyAllocations, totalAmount);
    }
}

function renderBudgetAllocations(allocations, totalAmount) {
    const container = document.getElementById('budget-allocations-container');
    
    let totalAllocated = allocations.reduce((sum, a) => sum + (a.planned || 0), 0);
    
    container.innerHTML = BUDGET_CATEGORIES.map((cat, index) => {
        const allocation = allocations.find(a => a.category === cat.name) || { planned: 0, spent: 0 };
        const percentage = totalAmount > 0 ? ((allocation.planned / totalAmount) * 100).toFixed(1) : 0;
        
        return `
            <div class="budget-allocation-item">
                <div class="budget-category-header">
                    <span class="budget-category-icon">${cat.icon}</span>
                    <span class="budget-category-name">${cat.name}</span>
                    <span class="budget-category-percent">${percentage}%</span>
                </div>
                <div class="budget-input-group">
                    <span class="currency-symbol">R$</span>
                    <input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        class="budget-input" 
                        data-category="${cat.name}"
                        value="${allocation.planned}"
                        onchange="updateBudgetAllocation('${cat.name}', this.value, ${totalAmount})"
                        placeholder="0.00"
                    >
                </div>
            </div>
        `;
    }).join('');
    
    updateBudgetTotals(totalAmount);
}

function updateBudgetAllocation(category, value, totalAmount) {
    updateBudgetTotals(totalAmount);
}

function updateBudgetTotals(totalAmount) {
    const inputs = document.querySelectorAll('.budget-input');
    let totalAllocated = 0;
    
    inputs.forEach(input => {
        totalAllocated += parseFloat(input.value) || 0;
    });
    
    const remaining = totalAmount - totalAllocated;
    
    document.getElementById('budget-allocated').textContent = `R$ ${totalAllocated.toFixed(2)}`;
    document.getElementById('budget-remaining').textContent = `R$ ${remaining.toFixed(2)}`;
    
    const remainingEl = document.getElementById('budget-remaining');
    if (remaining < 0) {
        remainingEl.style.color = 'var(--danger)';
    } else if (remaining === 0) {
        remainingEl.style.color = 'var(--success)';
    } else {
        remainingEl.style.color = 'var(--warning)';
    }
}

async function saveBudgetAllocation() {
    if (!currentBudgetTransaction) return;
    
    const inputs = document.querySelectorAll('.budget-input');
    const allocations = [];
    
    inputs.forEach(input => {
        const category = input.dataset.category;
        const planned = parseFloat(input.value) || 0;
        
        if (planned > 0) {
            allocations.push({
                category,
                planned,
                spent: 0
            });
        }
    });
    
    if (allocations.length === 0) {
        alert('Por favor, aloque pelo menos uma categoria!');
        return;
    }
    
    await autoSave.save(async () => {
        try {
            // Verificar se já existe orçamento para essa transação
            let existingBudget = await API.getBudgetByTransaction(currentBudgetTransaction.id);

            if (existingBudget && existingBudget.id) {
                try {
                    await API.updateBudget(existingBudget.id, { allocations });
                } catch (error) {
                    if (error && error.status === 404) {
                        existingBudget = null;
                    } else {
                        throw error;
                    }
                }
            }

            if (!existingBudget || !existingBudget.id) {
                await API.createBudget({
                    userId: currentUser.id,
                    transactionId: currentBudgetTransaction.id,
                    allocations
                });
            }
            
            budgets = await API.getBudgets(currentUser.id);
        } catch (error) {
            throw error;
        }
    });
    
    closeBudgetModal();
    if (currentView === 'finance') {
        renderBudgetDashboard();
    }
}

async function renderBudgetDashboard() {
    try {
        const summary = await API.getBudgetSummary(currentUser.id);
        const container = document.getElementById('budget-dashboard');
        
        if (!summary || !summary.categories || summary.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <h3 style="margin-bottom: 0.5rem;">Nenhum orçamento criado</h3>
                    <p>Clique em uma receita para criar seu orçamento!</p>
                </div>
            `;
            return;
        }
        
        const totalPlanned = summary.categories.reduce((sum, c) => sum + c.planned, 0);
        const totalSpent = summary.categories.reduce((sum, c) => sum + c.spent, 0);
        
        container.innerHTML = `
            <div class="budget-summary-header">
                <div class="budget-summary-card">
                    <div class="budget-summary-label">Orçamento Total</div>
                    <div class="budget-summary-value">R$ ${totalPlanned.toFixed(2)}</div>
                </div>
                <div class="budget-summary-card">
                    <div class="budget-summary-label">Gasto Total</div>
                    <div class="budget-summary-value" style="color: var(--expense)">R$ ${totalSpent.toFixed(2)}</div>
                </div>
                <div class="budget-summary-card">
                    <div class="budget-summary-label">Disponível</div>
                    <div class="budget-summary-value" style="color: ${totalPlanned - totalSpent >= 0 ? 'var(--success)' : 'var(--danger)'}">
                        R$ ${(totalPlanned - totalSpent).toFixed(2)}
                    </div>
                </div>
            </div>
            
            <div class="budget-categories-grid">
                ${summary.categories.map(cat => {
                    const budgetCat = BUDGET_CATEGORIES.find(bc => bc.name === cat.category);
                    const icon = budgetCat ? budgetCat.icon : '📦';
                    const percentage = cat.planned > 0 ? (cat.spent / cat.planned) * 100 : 0;
                    const remaining = cat.planned - cat.spent;
                    
                    let statusClass = 'normal';
                    if (percentage > 100) statusClass = 'over';
                    else if (percentage > 80) statusClass = 'warning';
                    
                    return `
                        <div class="budget-category-card ${statusClass}">
                            <div class="budget-card-header">
                                <span class="budget-card-icon">${icon}</span>
                                <span class="budget-card-title">${cat.category}</span>
                            </div>
                            <div class="budget-card-amounts">
                                <div class="budget-card-row">
                                    <span class="budget-card-label">Planejado:</span>
                                    <span class="budget-card-value">R$ ${cat.planned.toFixed(2)}</span>
                                </div>
                                <div class="budget-card-row">
                                    <span class="budget-card-label">Gasto:</span>
                                    <span class="budget-card-value spent">R$ ${cat.spent.toFixed(2)}</span>
                                </div>
                                <div class="budget-card-row">
                                    <span class="budget-card-label">Restante:</span>
                                    <span class="budget-card-value ${remaining >= 0 ? 'positive' : 'negative'}">
                                        R$ ${Math.abs(remaining).toFixed(2)} ${remaining >= 0 ? '' : '(acima)'}
                                    </span>
                                </div>
                            </div>
                            <div class="budget-progress-container">
                                <div class="budget-progress-bar">
                                    <div class="budget-progress-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                                </div>
                                <span class="budget-progress-text">${percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error rendering budget dashboard:', error);
    }
}

// ============================================
// GROUPS (GRUPOS)
// ============================================

async function refreshGroups() {
    if (!currentUser) return;

    try {
        groups = await API.getGroups(currentUser.id);
    } catch (error) {
        console.error('Error loading groups:', error);
        groups = [];
    }

    renderGroups();
}

async function refreshGroupTasks() {
    if (!currentGroupId) {
        const groupPageView = document.getElementById('group-page-view');
        const rawPageGroupId = groupPageView?.dataset?.groupId ? parseInt(groupPageView.dataset.groupId, 10) : null;
        const pageGroupId = Number.isNaN(rawPageGroupId) ? null : rawPageGroupId;
        if (pageGroupId) {
            currentGroupId = pageGroupId;
        }
    }
    if (!currentGroupId) return;

    try {
        groupTasks = await API.getGroupTasks(currentGroupId);
        const groupIdNumber = Number(currentGroupId);
        groupTasks = groupTasks.filter(task => Number(task.groupId) === groupIdNumber);
    } catch (error) {
        console.error('Error loading group tasks:', error);
        groupTasks = [];
    }

    renderGroupTasks();
}

function getCurrentGroupMembers() {
    const group = groups.find(g => g.id === currentGroupId);
    return group ? (group.members || []) : [];
}

function getGroupMemberById(userId) {
    const members = getCurrentGroupMembers();
    return members.find(member => member.id === userId);
}

function normalizeAssignedIds(value) {
    if (Array.isArray(value)) {
        return value
            .map(item => parseInt(item, 10))
            .filter(item => !Number.isNaN(item));
    }
    if (value === null || typeof value === 'undefined' || value === '') {
        return [];
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? [] : [parsed];
}

function setupAssigneeGrid() {
    const grid = document.getElementById('task-assignee-grid');
    if (!grid || assigneeGridInitialized) return;

    grid.addEventListener('click', (event) => {
        const chip = event.target.closest('.assignee-chip');
        if (!chip) return;
        chip.classList.toggle('selected');
        syncAssigneeInput();
    });

    assigneeGridInitialized = true;
}

function syncAssigneeInput() {
    const hiddenInput = document.getElementById('task-assignee-input');
    const grid = document.getElementById('task-assignee-grid');
    if (!hiddenInput || !grid) return;

    const selectedIds = [...grid.querySelectorAll('.assignee-chip.selected')]
        .map(chip => parseInt(chip.dataset.userId, 10))
        .filter(id => !Number.isNaN(id));

    hiddenInput.value = selectedIds.join(',');
}

function setAssigneeSelection(selectedIds = []) {
    const grid = document.getElementById('task-assignee-grid');
    if (!grid) return;

    const selectedSet = new Set(selectedIds.map(id => parseInt(id, 10)));
    grid.querySelectorAll('.assignee-chip').forEach(chip => {
        const chipId = parseInt(chip.dataset.userId, 10);
        chip.classList.toggle('selected', selectedSet.has(chipId));
    });

    syncAssigneeInput();
}

function renderAssigneeChips(selectedIds = []) {
    const grid = document.getElementById('task-assignee-grid');
    if (!grid) return;

    const members = getCurrentGroupMembers();
    if (!members.length) {
        grid.innerHTML = '<span class="assignee-empty">Sem membros no grupo.</span>';
        syncAssigneeInput();
        return;
    }

    grid.innerHTML = members.map(member => {
        const name = escapeHtml(member.name || member.email || 'Usuario');
        const initials = escapeHtml(getInitials(member.name || member.email || ''));
        const avatar = member.avatar
            ? `<img src="${member.avatar}" alt="${name}">`
            : initials;
        const isSelected = selectedIds.includes(member.id);
        const selectedClass = isSelected ? 'selected' : '';

        return `
            <button type="button" class="assignee-chip ${selectedClass}" data-user-id="${member.id}">
                <span class="assignee-chip-avatar">${avatar}</span>
                <span>${name}</span>
            </button>
        `;
    }).join('');

    setupAssigneeGrid();
    syncAssigneeInput();
}

function populateGroupAssigneeOptions() {
    const members = getCurrentGroupMembers();
    const filterSelect = document.getElementById('group-task-assignee-filter');
    const modalSelect = document.getElementById('task-assignee-input');

    if (filterSelect) {
        const currentValue = filterSelect.value || 'all';
        filterSelect.innerHTML = `
            <option value="all">Todos</option>
            <option value="unassigned">Sem responsavel</option>
            ${members.map(member => `
                <option value="${member.id}">${escapeHtml(member.name || member.email || 'Usuario')}</option>
            `).join('')}
        `;
        if ([...filterSelect.options].some(option => option.value === currentValue)) {
            filterSelect.value = currentValue;
        }
    }

    if (currentTaskScope === 'group') {
        const hiddenInput = document.getElementById('task-assignee-input');
        const selectedIds = hiddenInput && hiddenInput.value
            ? hiddenInput.value.split(',').map(value => parseInt(value, 10)).filter(value => !Number.isNaN(value))
            : [];
        renderAssigneeChips(selectedIds);
        setAssigneeSelection(selectedIds);
    }
}

function renderGroups() {
    const list = document.getElementById('groups-list');
    const countEl = document.getElementById('groups-count');
    const navBadge = document.getElementById('nav-groups');
    const navList = document.getElementById('nav-groups-list');

    if (!list) return;

    if (countEl) countEl.textContent = groups.length;
    if (navBadge) navBadge.textContent = groups.length;
    if (navList) {
        if (!groups.length) {
            navList.innerHTML = '';
        } else {
            const maxVisible = 6;
            const visibleGroups = groups.slice(0, maxVisible);
            const hiddenCount = groups.length - visibleGroups.length;

            navList.innerHTML = `
                ${visibleGroups.map(group => {
                    const isActive = currentGroupId === group.id ? 'active' : '';
                    return `
                        <button class="nav-subitem ${isActive}" onclick="openGroupPage(${group.id})">
                            ${escapeHtml(group.name)}
                        </button>
                    `;
                }).join('')}
                ${hiddenCount > 0 ? `<div class="nav-subitem nav-subitem-muted">+${hiddenCount} grupos</div>` : ''}
            `;
        }
    }

    if (!groups.length) {
        list.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 0c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5z">
                    </path>
                </svg>
                <h3 style="margin-bottom: 0.5rem;">Nenhum grupo criado</h3>
                <p>Crie seu primeiro grupo para convidar pessoas.</p>
            </div>
        `;
        renderGroupDetails(null);
        return;
    }

    if (currentGroupId && !groups.find(g => g.id === currentGroupId)) {
        currentGroupId = null;
    }

    list.innerHTML = groups.map(group => {
        const memberCount = group.memberCount || (group.members ? group.members.length : 0);
        const description = group.description ? escapeHtml(group.description) : 'Sem descricao';
        const isActive = currentGroupId === group.id ? 'active' : '';

        return `
            <div class="group-card ${isActive}">
                <div class="group-card-title">${escapeHtml(group.name)}</div>
                <div class="group-card-meta">${description}</div>
                <div class="group-card-footer">
                    <span class="group-chip">${memberCount} membros</span>
                    <button class="btn btn-secondary btn-sm" onclick="openGroupPage(${group.id})">Abrir</button>
                </div>
            </div>
        `;
    }).join('');

    renderGroupDetails();
}

function selectGroup(groupId) {
    currentGroupId = groupId;
    renderGroups();
}

function openGroupPage(groupId) {
    currentGroupId = groupId;
    renderGroups();
    const groupPageView = document.getElementById('group-page-view');
    if (groupPageView) {
        groupPageView.dataset.groupId = String(groupId);
    }
    switchView('group-page');
}

function renderGroupPage() {
    const group = groups.find(g => g.id === currentGroupId);
    const titleEl = document.getElementById('group-page-title');
    const subtitleEl = document.getElementById('group-page-subtitle');
    const avatarsEl = document.getElementById('group-page-avatars');
    const groupPageView = document.getElementById('group-page-view');

    if (!group) {
        showNotification('Grupo nao encontrado', 'error');
        switchView('groups');
        return;
    }

    if (groupPageView) {
        groupPageView.dataset.groupId = String(group.id);
    }

    if (titleEl) titleEl.textContent = group.name;
    if (subtitleEl) subtitleEl.textContent = group.description || 'Sem descricao';

    const memberCount = group.memberCount || (group.members ? group.members.length : 0);

    if (avatarsEl) {
        const members = group.members || [];
        const maxVisible = 8;
        const visibleMembers = members.slice(0, maxVisible);
        const hiddenCount = members.length - visibleMembers.length;

        const avatars = visibleMembers.map(member => {
            const name = escapeHtml(member.name || member.email || 'Usuario');
            const initials = escapeHtml(getInitials(member.name || member.email || ''));
            const avatar = member.avatar
                ? `<img src="${member.avatar}" alt="${name}">`
                : initials;

            return `<div class="group-avatar" title="${name}">${avatar}</div>`;
        });

        if (hiddenCount > 0) {
            avatars.push(`<div class="group-avatar more">+${hiddenCount}</div>`);
        }

        avatarsEl.innerHTML = avatars.join('');
    }

    populateGroupAssigneeOptions();
    refreshGroupTasks();
}

function focusGroupInvite() {
    const input = document.getElementById('group-page-invite-email');
    if (input) {
        input.focus();
    }
}

function renderGroupDetails() {
    const emptyState = document.getElementById('group-details-empty');
    const details = document.getElementById('group-details');
    const status = document.getElementById('group-details-status');

    if (!details || !emptyState) return;

    const group = groups.find(g => g.id === currentGroupId);

    if (!group) {
        emptyState.classList.remove('hidden');
        details.classList.add('hidden');
        if (status) status.textContent = 'Selecione um grupo';
        return;
    }

    emptyState.classList.add('hidden');
    details.classList.remove('hidden');

    const memberCount = group.memberCount || (group.members ? group.members.length : 0);
    if (status) status.textContent = `${memberCount} membros`;

    const nameEl = document.getElementById('group-details-name');
    const descriptionEl = document.getElementById('group-details-description');
    if (nameEl) nameEl.textContent = group.name;
    if (descriptionEl) descriptionEl.textContent = group.description || 'Sem descricao';

    const actions = document.getElementById('group-details-actions');
    if (actions) {
        if (group.ownerId === currentUser.id) {
            actions.innerHTML = `
                <button class="btn btn-secondary btn-sm" onclick="openGroupPage(${group.id})">Abrir pagina</button>
                <button class="btn btn-danger btn-sm" onclick="deleteGroup()">Excluir grupo</button>
            `;
        } else {
            actions.innerHTML = `
                <button class="btn btn-secondary btn-sm" onclick="openGroupPage(${group.id})">Abrir pagina</button>
                <button class="btn btn-secondary btn-sm" onclick="leaveGroup()">Sair do grupo</button>
            `;
        }
    }

    const membersList = document.getElementById('group-members-list');
    const membersCount = document.getElementById('group-members-count');
    if (membersCount) membersCount.textContent = memberCount;

    if (membersList) {
        const members = group.members || [];
        membersList.innerHTML = members.map(member => {
            const name = escapeHtml(member.name || member.email || 'Usuario');
            const email = escapeHtml(member.email || '');
            const initials = escapeHtml(getInitials(member.name || member.email || ''));
            const avatar = member.avatar
                ? `<img src="${member.avatar}" alt="${name}">`
                : initials;

            let action = '';
            if (group.ownerId === member.id) {
                action = '<span class="group-role">Dono</span>';
            } else if (group.ownerId === currentUser.id) {
                action = `<button class="btn btn-danger btn-sm" onclick="removeGroupMember(${member.id})">Remover</button>`;
            } else if (member.id === currentUser.id) {
                action = '<span class="group-role">Voce</span>';
            }

            return `
                <div class="group-member">
                    <div class="group-member-info">
                        <div class="group-member-avatar">${avatar}</div>
                        <div>
                            <div class="group-member-name">${name}</div>
                            <div class="group-member-meta">${email}</div>
                        </div>
                    </div>
                    ${action}
                </div>
            `;
        }).join('');
    }
}

async function createGroup() {
    const nameInput = document.getElementById('group-name-input');
    const descriptionInput = document.getElementById('group-description-input');

    if (!nameInput || !descriptionInput) return;

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
        showNotification('Informe o nome do grupo', 'error');
        return;
    }

    let success = false;
    await autoSave.save(async () => {
        const created = await API.createGroup({
            name,
            description,
            ownerId: currentUser.id
        });

        currentGroupId = created.id;
        groups = await API.getGroups(currentUser.id);
        success = true;
    });

    if (success) {
        nameInput.value = '';
        descriptionInput.value = '';
        renderGroups();
        if (currentView === 'group-page') {
            renderGroupPage();
        }
        showNotification('Grupo criado com sucesso!', 'success');
    }
}

async function inviteGroupMember(inputId = 'group-invite-email') {
    const emailInput = document.getElementById(inputId);
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) {
        showNotification('Informe um email valido', 'error');
        return;
    }

    const group = groups.find(g => g.id === currentGroupId);
    if (!group) {
        showNotification('Selecione um grupo primeiro', 'error');
        return;
    }

    let success = false;
    await autoSave.save(async () => {
        await API.addGroupMember(group.id, email);
        groups = await API.getGroups(currentUser.id);
        success = true;
    });

    if (success) {
        emailInput.value = '';
        renderGroups();
        if (currentView === 'group-page') {
            renderGroupPage();
        }
        showNotification('Pessoa adicionada ao grupo!', 'success');
    }
}

function inviteGroupMemberFromPage() {
    return inviteGroupMember('group-page-invite-email');
}

async function removeGroupMember(memberId) {
    const group = groups.find(g => g.id === currentGroupId);
    if (!group) return;

    if (!confirm('Deseja remover esse membro do grupo?')) return;

    let success = false;
    await autoSave.save(async () => {
        await API.removeGroupMember(group.id, memberId);
        groups = await API.getGroups(currentUser.id);
        success = true;
    });

    if (success) {
        renderGroups();
        if (currentView === 'group-page') {
            renderGroupPage();
        }
        showNotification('Membro removido', 'success');
    }
}

async function leaveGroup() {
    const group = groups.find(g => g.id === currentGroupId);
    if (!group) return;

    if (!confirm('Tem certeza que deseja sair do grupo?')) return;

    let success = false;
    await autoSave.save(async () => {
        await API.removeGroupMember(group.id, currentUser.id);
        groups = await API.getGroups(currentUser.id);
        success = true;
    });

    if (success) {
        currentGroupId = null;
        groupTasks = [];
        renderGroups();
        if (currentView === 'group-page') {
            switchView('groups');
        }
        showNotification('Voce saiu do grupo', 'success');
    }
}

async function deleteGroup() {
    const group = groups.find(g => g.id === currentGroupId);
    if (!group) return;

    if (!confirm('Excluir grupo? Essa acao nao pode ser desfeita.')) return;

    let success = false;
    await autoSave.save(async () => {
        await API.deleteGroup(group.id);
        groups = await API.getGroups(currentUser.id);
        success = true;
    });

    if (success) {
        currentGroupId = null;
        groupTasks = [];
        renderGroups();
        if (currentView === 'group-page') {
            switchView('groups');
        }
        showNotification('Grupo excluido', 'success');
    }
}

console.log('✅ Daily Focus v4.0.0 carregado - Conectado ao servidor!');
