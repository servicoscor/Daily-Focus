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
                const error = await response.json();
                throw new Error(error.error || 'Erro na requisição');
            }

            return await response.json();
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
        return this.request(`/budgets/transaction/${transactionId}`);
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
let transactions = [];
let budgets = [];
let currentView = 'tasks';
let editingTaskId = null;
let editingTransactionId = null;
let currentTransactionType = 'income';
let currentBudgetTransaction = null;

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
    
    console.log('✅ User logged in:', currentUser);
    
    try {
        tasks = await API.getTasks(user.id);
        transactions = await API.getTransactions(user.id);
        budgets = await API.getBudgets(user.id);
        console.log(`✅ Loaded ${tasks.length} tasks, ${transactions.length} transactions and ${budgets.length} budgets from server`);
    } catch (error) {
        console.error('Error loading data:', error);
        tasks = [];
        transactions = [];
        budgets = [];
    }
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
    
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    updateCategoryFilters();
    renderTasks();
    renderTransactions();
    updateAllStats();
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        currentUser = null;
        tasks = [];
        transactions = [];
        localStorage.removeItem('dailyFocusSession');
        
        document.getElementById('main-app').classList.add('hidden');
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('login-form').reset();
    hideError('login-error');
}

function showRegister() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
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
// TASK MANAGEMENT
// ============================================

async function saveTask() {
    const title = document.getElementById('task-title-input').value;
    const description = document.getElementById('task-description-input').value;
    const priority = document.getElementById('task-priority-input').value;
    const dueDate = document.getElementById('task-date-input').value;
    const status = document.getElementById('task-status-input').value;
    
    await autoSave.save(async () => {
        if (editingTaskId) {
            const taskData = {
                title,
                description,
                priority,
                dueDate,
                status
            };
            
            const updatedTask = await API.updateTask(editingTaskId, taskData);
            const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
            tasks[taskIndex] = updatedTask;
        } else {
            const newTask = {
                userId: currentUser.id,
                title,
                description,
                priority,
                dueDate,
                status
            };
            
            const createdTask = await API.createTask(newTask);
            tasks.push(createdTask);
        }
    });
    
    renderTasks();
    updateAllStats();
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
        renderTasks();
        renderTransactions();
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

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    document.getElementById('tasks-view').style.display = 'none';
    document.getElementById('finance-view').style.display = 'none';
    document.getElementById('analytics-view').style.display = 'none';
    
    if (view === 'tasks') {
        document.getElementById('tasks-view').style.display = 'block';
    } else if (view === 'finance') {
        document.getElementById('finance-view').style.display = 'block';
        renderFinanceStats();
        renderBudgetDashboard();
    } else if (view === 'analytics') {
        document.getElementById('analytics-view').style.display = 'block';
        renderAnalytics();
    }
}

function openTaskModal(taskId = null) {
    editingTaskId = taskId;
    const modal = document.getElementById('task-modal');
    
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        document.getElementById('task-modal-title').textContent = 'Editar Tarefa';
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-description-input').value = task.description || '';
        document.getElementById('task-priority-input').value = task.priority;
        document.getElementById('task-date-input').value = task.dueDate || '';
        document.getElementById('task-status-input').value = task.status;
    } else {
        document.getElementById('task-modal-title').textContent = 'Nova Tarefa';
        document.getElementById('task-form').reset();
    }
    
    modal.classList.add('active');
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
    let filtered = [...tasks];
    
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
}

function updateTaskStats() {
    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'inProgress').length,
        completed: tasks.filter(t => t.status === 'completed').length
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
            const existingBudget = await API.getBudgetByTransaction(currentBudgetTransaction.id);
            
            if (existingBudget) {
                await API.updateBudget(existingBudget.id, { allocations });
            } else {
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

console.log('✅ Daily Focus v4.0.0 carregado - Conectado ao servidor!');
