const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta public

// Função para ler o banco de dados
function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler database:', error);
        return { users: [], tasks: [], transactions: [] };
    }
}

// Função para escrever no banco de dados
function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Database salvo com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar database:', error);
        return false;
    }
}

// ============================================
// ROTAS - USERS
// ============================================

// Listar todos os usuários
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users);
});

// Buscar usuário por email
app.get('/api/users/email/:email', (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.email === req.params.email);
    
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
    }
});

// Buscar usuário por ID
app.get('/api/users/:id', (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(req.params.id));
    
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
    }
});

// Criar novo usuário
app.post('/api/users', (req, res) => {
    const db = readDB();
    
    // Verificar se email já existe
    const existingUser = db.users.find(u => u.email === req.body.email);
    if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Criar novo usuário
    const newUser = {
        id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password, // Em produção, usar hash!
        createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    
    if (writeDB(db)) {
        console.log('✅ Novo usuário criado:', newUser);
        res.status(201).json(newUser);
    } else {
        res.status(500).json({ error: 'Erro ao salvar usuário' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const db = readDB();
    const user = db.users.find(u => 
        u.email === req.body.email && u.password === req.body.password
    );
    
    if (user) {
        console.log('✅ Login bem-sucedido:', user.email);
        res.json(user);
    } else {
        res.status(401).json({ error: 'Email ou senha incorretos' });
    }
});

// ============================================
// ROTAS - TASKS
// ============================================

// Listar todas as tarefas
app.get('/api/tasks', (req, res) => {
    const db = readDB();
    const userId = req.query.userId;
    
    if (userId) {
        const userTasks = db.tasks.filter(t => t.userId === parseInt(userId));
        res.json(userTasks);
    } else {
        res.json(db.tasks);
    }
});

// Buscar tarefa por ID
app.get('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const task = db.tasks.find(t => t.id === parseInt(req.params.id));
    
    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ error: 'Tarefa não encontrada' });
    }
});

// Criar nova tarefa
app.post('/api/tasks', (req, res) => {
    const db = readDB();
    
    const newTask = {
        id: db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1,
        userId: req.body.userId,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
        status: req.body.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    db.tasks.push(newTask);
    
    if (writeDB(db)) {
        console.log('✅ Nova tarefa criada:', newTask.title);
        res.status(201).json(newTask);
    } else {
        res.status(500).json({ error: 'Erro ao salvar tarefa' });
    }
});

// Atualizar tarefa
app.put('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const taskIndex = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    db.tasks[taskIndex] = {
        ...db.tasks[taskIndex],
        ...req.body,
        id: parseInt(req.params.id), // Garantir que ID não mude
        updatedAt: new Date().toISOString()
    };
    
    if (writeDB(db)) {
        console.log('✅ Tarefa atualizada:', db.tasks[taskIndex].title);
        res.json(db.tasks[taskIndex]);
    } else {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

// Deletar tarefa
app.delete('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const taskIndex = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    const deletedTask = db.tasks[taskIndex];
    db.tasks.splice(taskIndex, 1);
    
    if (writeDB(db)) {
        console.log('✅ Tarefa deletada:', deletedTask.title);
        res.json({ message: 'Tarefa deletada com sucesso', task: deletedTask });
    } else {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
});

// ============================================
// ROTAS - TRANSACTIONS
// ============================================

// Listar todas as transações
app.get('/api/transactions', (req, res) => {
    const db = readDB();
    const userId = req.query.userId;
    
    if (userId) {
        const userTransactions = db.transactions.filter(t => t.userId === parseInt(userId));
        res.json(userTransactions);
    } else {
        res.json(db.transactions);
    }
});

// Buscar transação por ID
app.get('/api/transactions/:id', (req, res) => {
    const db = readDB();
    const transaction = db.transactions.find(t => t.id === parseInt(req.params.id));
    
    if (transaction) {
        res.json(transaction);
    } else {
        res.status(404).json({ error: 'Transação não encontrada' });
    }
});

// Criar nova transação
app.post('/api/transactions', (req, res) => {
    const db = readDB();
    
    const newTransaction = {
        id: db.transactions.length > 0 ? Math.max(...db.transactions.map(t => t.id)) + 1 : 1,
        userId: req.body.userId,
        type: req.body.type,
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date,
        notes: req.body.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    db.transactions.push(newTransaction);
    
    if (writeDB(db)) {
        console.log('✅ Nova transação criada:', newTransaction.description);
        res.status(201).json(newTransaction);
    } else {
        res.status(500).json({ error: 'Erro ao salvar transação' });
    }
});

// Atualizar transação
app.put('/api/transactions/:id', (req, res) => {
    const db = readDB();
    const txIndex = db.transactions.findIndex(t => t.id === parseInt(req.params.id));
    
    if (txIndex === -1) {
        return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    db.transactions[txIndex] = {
        ...db.transactions[txIndex],
        ...req.body,
        id: parseInt(req.params.id),
        updatedAt: new Date().toISOString()
    };
    
    if (writeDB(db)) {
        console.log('✅ Transação atualizada:', db.transactions[txIndex].description);
        res.json(db.transactions[txIndex]);
    } else {
        res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
});

// Deletar transação
app.delete('/api/transactions/:id', (req, res) => {
    const db = readDB();
    const txIndex = db.transactions.findIndex(t => t.id === parseInt(req.params.id));
    
    if (txIndex === -1) {
        return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    const deletedTx = db.transactions[txIndex];
    db.transactions.splice(txIndex, 1);
    
    if (writeDB(db)) {
        console.log('✅ Transação deletada:', deletedTx.description);
        res.json({ message: 'Transação deletada com sucesso', transaction: deletedTx });
    } else {
        res.status(500).json({ error: 'Erro ao deletar transação' });
    }
});

// ============================================
// ROTAS - BUDGETS (ORÇAMENTO)
// ============================================

// Listar todos os orçamentos
app.get('/api/budgets', (req, res) => {
    const db = readDB();
    const userId = req.query.userId;
    
    if (userId) {
        const userBudgets = db.budgets.filter(b => b.userId === parseInt(userId));
        res.json(userBudgets);
    } else {
        res.json(db.budgets);
    }
});

// Buscar orçamento por ID de transação
app.get('/api/budgets/transaction/:transactionId', (req, res) => {
    const db = readDB();
    const budget = db.budgets.find(b => b.transactionId === parseInt(req.params.transactionId));
    
    if (budget) {
        res.json(budget);
    } else {
        res.status(404).json({ error: 'Orçamento não encontrado' });
    }
});

// Buscar resumo do orçamento do usuário
app.get('/api/budgets/summary/:userId', (req, res) => {
    const db = readDB();
    const userId = parseInt(req.params.userId);
    
    // Pegar todos os orçamentos do usuário
    const userBudgets = db.budgets.filter(b => b.userId === userId);
    
    if (userBudgets.length === 0) {
        return res.json({ categories: [] });
    }
    
    // Agregar por categoria
    const categoryMap = {};
    
    userBudgets.forEach(budget => {
        budget.allocations.forEach(alloc => {
            if (!categoryMap[alloc.category]) {
                categoryMap[alloc.category] = {
                    category: alloc.category,
                    planned: 0,
                    spent: 0
                };
            }
            categoryMap[alloc.category].planned += alloc.planned || 0;
            categoryMap[alloc.category].spent += alloc.spent || 0;
        });
    });
    
    const categories = Object.values(categoryMap);
    
    res.json({ categories });
});

// Criar novo orçamento
app.post('/api/budgets', (req, res) => {
    const db = readDB();
    
    const newBudget = {
        id: db.budgets.length > 0 ? Math.max(...db.budgets.map(b => b.id)) + 1 : 1,
        userId: req.body.userId,
        transactionId: req.body.transactionId,
        allocations: req.body.allocations,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    db.budgets.push(newBudget);
    
    if (writeDB(db)) {
        console.log('✅ Novo orçamento criado para transação:', newBudget.transactionId);
        res.status(201).json(newBudget);
    } else {
        res.status(500).json({ error: 'Erro ao salvar orçamento' });
    }
});

// Atualizar orçamento
app.put('/api/budgets/:id', (req, res) => {
    const db = readDB();
    const budgetIndex = db.budgets.findIndex(b => b.id === parseInt(req.params.id));
    
    if (budgetIndex === -1) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    db.budgets[budgetIndex] = {
        ...db.budgets[budgetIndex],
        ...req.body,
        id: parseInt(req.params.id),
        updatedAt: new Date().toISOString()
    };
    
    if (writeDB(db)) {
        console.log('✅ Orçamento atualizado');
        res.json(db.budgets[budgetIndex]);
    } else {
        res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
});

// Atualizar gastos de uma categoria
app.put('/api/budgets/update-spent/:userId/:category', (req, res) => {
    const db = readDB();
    const userId = parseInt(req.params.userId);
    const category = req.params.category;
    const amount = req.body.amount;
    
    // Encontrar todos os orçamentos do usuário que têm essa categoria
    const userBudgets = db.budgets.filter(b => b.userId === userId);
    
    let updated = false;
    userBudgets.forEach((budget, budgetIndex) => {
        const allocIndex = budget.allocations.findIndex(a => a.category === category);
        if (allocIndex !== -1) {
            const realBudgetIndex = db.budgets.findIndex(b => b.id === budget.id);
            db.budgets[realBudgetIndex].allocations[allocIndex].spent = 
                (db.budgets[realBudgetIndex].allocations[allocIndex].spent || 0) + amount;
            updated = true;
        }
    });
    
    if (updated && writeDB(db)) {
        console.log(`✅ Gasto atualizado: ${category} +${amount}`);
        res.json({ message: 'Gasto atualizado com sucesso' });
    } else if (!updated) {
        res.status(404).json({ error: 'Categoria não encontrada no orçamento' });
    } else {
        res.status(500).json({ error: 'Erro ao atualizar gasto' });
    }
});

// Deletar orçamento
app.delete('/api/budgets/:id', (req, res) => {
    const db = readDB();
    const budgetIndex = db.budgets.findIndex(b => b.id === parseInt(req.params.id));
    
    if (budgetIndex === -1) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    const deletedBudget = db.budgets[budgetIndex];
    db.budgets.splice(budgetIndex, 1);
    
    if (writeDB(db)) {
        console.log('✅ Orçamento deletado');
        res.json({ message: 'Orçamento deletado com sucesso', budget: deletedBudget });
    } else {
        res.status(500).json({ error: 'Erro ao deletar orçamento' });
    }
});

// ============================================
// ROTAS - BACKUP
// ============================================

// Exportar todo o banco de dados
app.get('/api/backup', (req, res) => {
    const db = readDB();
    res.json({
        version: '4.0.0',
        exportDate: new Date().toISOString(),
        data: db
    });
});

// Importar backup (substituir tudo)
app.post('/api/backup/restore', (req, res) => {
    if (!req.body.data) {
        return res.status(400).json({ error: 'Dados de backup inválidos' });
    }
    
    if (writeDB(req.body.data)) {
        console.log('✅ Backup restaurado com sucesso!');
        res.json({ message: 'Backup restaurado com sucesso' });
    } else {
        res.status(500).json({ error: 'Erro ao restaurar backup' });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║                                          ║');
    console.log('║      🚀 DAILY FOCUS SERVER v4.0.0       ║');
    console.log('║                                          ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Servidor rodando em: http://localhost:${PORT}`);
    console.log(`📁 Banco de dados: ${DB_FILE}`);
    console.log('');
    console.log('Rotas disponíveis:');
    console.log('  📋 GET    /api/users');
    console.log('  👤 POST   /api/users (cadastro)');
    console.log('  🔐 POST   /api/login');
    console.log('  ✅ GET    /api/tasks?userId=X');
    console.log('  ➕ POST   /api/tasks');
    console.log('  ✏️  PUT    /api/tasks/:id');
    console.log('  🗑️  DELETE /api/tasks/:id');
    console.log('  💰 GET    /api/transactions?userId=X');
    console.log('  ➕ POST   /api/transactions');
    console.log('  ✏️  PUT    /api/transactions/:id');
    console.log('  🗑️  DELETE /api/transactions/:id');
    console.log('  📦 GET    /api/backup');
    console.log('');
    console.log('Pressione Ctrl+C para parar o servidor');
    console.log('════════════════════════════════════════════');
});
