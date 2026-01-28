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

app.use(bodyParser.json({ limit: '10mb' }));

app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static('public')); // Serve arquivos estáticos da pasta public



// Função para ler o banco de dados

function readDB() {

    try {

        const data = fs.readFileSync(DB_FILE, 'utf8');

        const parsed = JSON.parse(data);

        return {

            users: parsed.users || [],

            tasks: parsed.tasks || [],

            transactions: parsed.transactions || [],

            budgets: parsed.budgets || [],

            groups: parsed.groups || []

        };

    } catch (error) {

        console.error('Erro ao ler database:', error);

        return { users: [], tasks: [], transactions: [], budgets: [], groups: [] };

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



function simplifyUser(user) {

    if (!user) return null;

    return {

        id: user.id,

        name: user.name,

        email: user.email,

        avatar: user.avatar || null

    };

}



function buildGroupResponse(group, db) {

    const owner = simplifyUser(db.users.find(u => u.id === group.ownerId));

    const members = (group.members || []).map(id => {

        const member = db.users.find(u => u.id === id);

        return simplifyUser(member) || { id, name: 'Usuario removido', email: '' };

    });

    return {

        ...group,

        owner,

        members,

        memberCount: members.length

    };

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



// Atualizar usuario

app.put('/api/users/:id', (req, res) => {

    const db = readDB();

    const userId = parseInt(req.params.id);

    const userIndex = db.users.findIndex(u => u.id === userId);



    if (userIndex === -1) {

        return res.status(404).json({ error: 'Usuario nao encontrado' });

    }



    if (req.body.email) {

        const emailInUse = db.users.find(u => u.email === req.body.email && u.id !== userId);

        if (emailInUse) {

            return res.status(400).json({ error: 'Email ja cadastrado' });

        }

    }



    db.users[userIndex] = {

        ...db.users[userIndex],

        ...req.body,

        id: userId,

        updatedAt: new Date().toISOString()

    };



    if (writeDB(db)) {

        console.log('✅ Usuario atualizado:', db.users[userIndex].email);

        res.json(db.users[userIndex]);

    } else {

        res.status(500).json({ error: 'Erro ao atualizar usuario' });

    }

});



// Deletar usuario

app.delete('/api/users/:id', (req, res) => {

    const db = readDB();

    const userId = parseInt(req.params.id);

    const userIndex = db.users.findIndex(u => u.id === userId);



    if (userIndex === -1) {

        return res.status(404).json({ error: 'Usuario nao encontrado' });

    }



    const deletedUser = db.users[userIndex];

    db.users.splice(userIndex, 1);



    db.tasks = db.tasks.filter(t => t.userId !== userId);

    db.transactions = db.transactions.filter(t => t.userId !== userId);

    if (db.budgets) {

        db.budgets = db.budgets.filter(b => b.userId !== userId);

    }

    if (db.groups) {

        db.groups = db.groups

            .filter(g => g.ownerId !== userId)

            .map(g => ({

                ...g,

                members: (g.members || []).filter(id => id !== userId)

            }));

    }



    if (writeDB(db)) {

        console.log('✅ Usuario deletado:', deletedUser.email);

        res.json({ message: 'Usuario deletado com sucesso', user: deletedUser });

    } else {

        res.status(500).json({ error: 'Erro ao deletar usuario' });

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

function normalizeAssignees(value) {
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



// Listar todas as tarefas

app.get('/api/tasks', (req, res) => {

    const db = readDB();

    const userId = req.query.userId;

    const groupId = req.query.groupId;

    

    if (groupId) {

        const groupTasks = db.tasks.filter(t => t.groupId === parseInt(groupId));

        res.json(groupTasks);

    } else if (userId) {

        const userTasks = db.tasks.filter(t => t.userId === parseInt(userId) && !t.groupId);

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

        groupId: req.body.groupId ? parseInt(req.body.groupId) : null,

        assignedTo: normalizeAssignees(req.body.assignedTo),

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

    

    const updates = { ...req.body };

    if (typeof updates.groupId !== 'undefined') {

        updates.groupId = updates.groupId ? parseInt(updates.groupId) : null;

    }

    if (typeof updates.assignedTo !== 'undefined') {

        updates.assignedTo = normalizeAssignees(updates.assignedTo);

    }



    db.tasks[taskIndex] = {

        ...db.tasks[taskIndex],

        ...updates,

        id: parseInt(req.params.id), // Garantir que ID n?o mude

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

    if (!db.budgets) {

        db.budgets = [];

    }

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

// ROTAS - GROUPS (GRUPOS)

// ============================================



// Listar grupos (por usuario)

app.get('/api/groups', (req, res) => {

    const db = readDB();

    const userId = req.query.userId ? parseInt(req.query.userId) : null;



    let groups = db.groups || [];

    if (userId) {

        groups = groups.filter(g =>

            g.ownerId === userId || (g.members || []).includes(userId)

        );

    }



    res.json(groups.map(group => buildGroupResponse(group, db)));

});



// Buscar grupo por ID

app.get('/api/groups/:id', (req, res) => {

    const db = readDB();

    const group = (db.groups || []).find(g => g.id === parseInt(req.params.id));



    if (!group) {

        return res.status(404).json({ error: 'Grupo nao encontrado' });

    }



    res.json(buildGroupResponse(group, db));

});



// Criar novo grupo

app.post('/api/groups', (req, res) => {

    const db = readDB();

    const name = (req.body.name || '').trim();

    const description = (req.body.description || '').trim();

    const ownerId = parseInt(req.body.ownerId);



    if (!name) {

        return res.status(400).json({ error: 'Nome do grupo e obrigatorio' });

    }



    const owner = db.users.find(u => u.id === ownerId);

    if (!owner) {

        return res.status(404).json({ error: 'Usuario nao encontrado' });

    }



    const newGroup = {

        id: db.groups.length > 0 ? Math.max(...db.groups.map(g => g.id)) + 1 : 1,

        name,

        description,

        ownerId,

        members: [ownerId],

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString()

    };



    db.groups.push(newGroup);



    if (writeDB(db)) {

        console.log('✅ Novo grupo criado:', newGroup.name);

        res.status(201).json(buildGroupResponse(newGroup, db));

    } else {

        res.status(500).json({ error: 'Erro ao salvar grupo' });

    }

});



// Atualizar grupo

app.put('/api/groups/:id', (req, res) => {

    const db = readDB();

    const groupIndex = (db.groups || []).findIndex(g => g.id === parseInt(req.params.id));



    if (groupIndex === -1) {

        return res.status(404).json({ error: 'Grupo nao encontrado' });

    }



    const currentGroup = db.groups[groupIndex];

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : currentGroup.name;

    const description = typeof req.body.description === 'string' ? req.body.description.trim() : currentGroup.description;



    if (!name) {

        return res.status(400).json({ error: 'Nome do grupo e obrigatorio' });

    }



    db.groups[groupIndex] = {

        ...currentGroup,

        name,

        description,

        updatedAt: new Date().toISOString()

    };



    if (writeDB(db)) {

        res.json(buildGroupResponse(db.groups[groupIndex], db));

    } else {

        res.status(500).json({ error: 'Erro ao atualizar grupo' });

    }

});



// Adicionar membro ao grupo (por email ou userId)

app.post('/api/groups/:id/members', (req, res) => {

    const db = readDB();

    const groupIndex = (db.groups || []).findIndex(g => g.id === parseInt(req.params.id));



    if (groupIndex === -1) {

        return res.status(404).json({ error: 'Grupo nao encontrado' });

    }



    let user = null;

    if (req.body.userId) {

        const userId = parseInt(req.body.userId);

        user = db.users.find(u => u.id === userId);

    } else if (req.body.email) {

        const email = String(req.body.email).trim().toLowerCase();

        user = db.users.find(u => u.email.toLowerCase() === email);

    }



    if (!user) {

        return res.status(404).json({ error: 'Usuario nao encontrado' });

    }



    const group = db.groups[groupIndex];

    const members = group.members || [];



    if (!members.includes(user.id)) {

        members.push(user.id);

    }



    db.groups[groupIndex] = {

        ...group,

        members,

        updatedAt: new Date().toISOString()

    };



    if (writeDB(db)) {

        res.json(buildGroupResponse(db.groups[groupIndex], db));

    } else {

        res.status(500).json({ error: 'Erro ao adicionar membro' });

    }

});



// Remover membro do grupo

app.delete('/api/groups/:id/members/:userId', (req, res) => {

    const db = readDB();

    const groupIndex = (db.groups || []).findIndex(g => g.id === parseInt(req.params.id));

    const userId = parseInt(req.params.userId);



    if (groupIndex === -1) {

        return res.status(404).json({ error: 'Grupo nao encontrado' });

    }



    const group = db.groups[groupIndex];

    if (group.ownerId === userId) {

        return res.status(400).json({ error: 'O dono do grupo nao pode ser removido' });

    }



    db.groups[groupIndex] = {

        ...group,

        members: (group.members || []).filter(id => id !== userId),

        updatedAt: new Date().toISOString()

    };



    if (writeDB(db)) {

        res.json(buildGroupResponse(db.groups[groupIndex], db));

    } else {

        res.status(500).json({ error: 'Erro ao remover membro' });

    }

});



// Deletar grupo

app.delete('/api/groups/:id', (req, res) => {

    const db = readDB();

    const groupIndex = (db.groups || []).findIndex(g => g.id === parseInt(req.params.id));



    if (groupIndex === -1) {

        return res.status(404).json({ error: 'Grupo nao encontrado' });

    }



    const deletedGroup = db.groups[groupIndex];

    db.groups.splice(groupIndex, 1);

    db.tasks = db.tasks.filter(t => t.groupId !== deletedGroup.id);



    if (writeDB(db)) {

        res.json({ message: 'Grupo deletado com sucesso', group: buildGroupResponse(deletedGroup, db) });

    } else {

        res.status(500).json({ error: 'Erro ao deletar grupo' });

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
