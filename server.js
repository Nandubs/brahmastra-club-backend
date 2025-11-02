const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brahmastra-club', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== MONGOOSE SCHEMAS ====================

// Member Schema
const memberSchema = new mongoose.Schema({
    memberId: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    monthlyPayments: [{
        month: Number,
        year: Number,
        status: { type: String, enum: ['paid', 'not_paid'], default: 'not_paid' },
        amount: { type: Number, default: 100 },
        paidDate: Date
    }],
    createdAt: { type: Date, default: Date.now }
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    electricityBill: { type: Number, default: 0 },
    internetBill: { type: Number, default: 0 },
    miscellaneous: { type: Number, default: 0 },
    totalExpense: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create unique index for month/year combination
expenseSchema.index({ month: 1, year: 1 }, { unique: true });

const Member = mongoose.model('Member', memberSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// ==================== MIDDLEWARE ====================

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'brahmastra-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ==================== AUTHENTICATION ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ error: 'User ID and password are required' });
        }

        // Find member
        const member = await Member.findOne({ memberId });
        if (!member) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, member.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                memberId: member.memberId, 
                memberName: member.memberName, 
                role: member.role 
            },
            process.env.JWT_SECRET || 'brahmastra-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                memberId: member.memberId,
                memberName: member.memberName,
                role: member.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Change Password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        const member = await Member.findOne({ memberId: req.user.memberId });
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, member.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        member.password = hashedPassword;
        await member.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// ==================== MEMBER ROUTES ====================

// Get all members (Admin only)
app.get('/api/members', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const members = await Member.find().select('-password');
        res.json(members);
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Get current member details
app.get('/api/members/me', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findOne({ memberId: req.user.memberId }).select('-password');
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        console.error('Get member details error:', error);
        res.status(500).json({ error: 'Failed to fetch member details' });
    }
});

// Add new member (Admin only)
app.post('/api/members', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { memberId, memberName, password, role } = req.body;

        if (!memberId || !memberName || !password) {
            return res.status(400).json({ error: 'Member ID, name, and password are required' });
        }

        // Check if member already exists
        const existingMember = await Member.findOne({ memberId });
        if (existingMember) {
            return res.status(400).json({ error: 'Member ID already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new member
        const newMember = new Member({
            memberId,
            memberName,
            password: hashedPassword,
            role: role || 'member',
            monthlyPayments: []
        });

        await newMember.save();

        res.status(201).json({
            message: 'Member added successfully',
            member: {
                memberId: newMember.memberId,
                memberName: newMember.memberName,
                role: newMember.role,
                createdAt: newMember.createdAt
            }
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Delete member (Admin only)
app.delete('/api/members/:memberId', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { memberId } = req.params;

        // Prevent deleting the main admin
        if (memberId === 'brahmastra01') {
            return res.status(403).json({ error: 'Cannot delete main admin' });
        }

        const result = await Member.deleteOne({ memberId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

// ==================== PAYMENT ROUTES ====================

// Update payments for a month (Admin only)
app.post('/api/payments', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { month, year, payments } = req.body;

        if (!month || !year || !payments || !Array.isArray(payments)) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        // Update payments for each member
        const updatePromises = payments.map(async (payment) => {
            const member = await Member.findOne({ memberId: payment.memberId });
            if (!member) return;

            // Remove existing payment for this month/year
            member.monthlyPayments = member.monthlyPayments.filter(
                p => !(p.month === month && p.year === year)
            );

            // Add new payment
            member.monthlyPayments.push({
                month,
                year,
                status: payment.status,
                amount: payment.amount || 100,
                paidDate: payment.status === 'paid' ? new Date() : null
            });

            await member.save();
        });

        await Promise.all(updatePromises);

        res.json({ message: 'Payments updated successfully' });
    } catch (error) {
        console.error('Update payments error:', error);
        res.status(500).json({ error: 'Failed to update payments' });
    }
});

// Get payment statistics
app.get('/api/payments/stats', authenticateToken, async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const members = await Member.find();
        
        let totalCollection = 0;
        let paidMembers = 0;
        let unpaidMembers = 0;

        members.forEach(member => {
            const payment = member.monthlyPayments.find(
                p => p.month === parseInt(month) && p.year === parseInt(year)
            );
            
            if (payment && payment.status === 'paid') {
                totalCollection += payment.amount || 100;
                paidMembers++;
            } else {
                unpaidMembers++;
            }
        });

        res.json({
            month: parseInt(month),
            year: parseInt(year),
            totalMembers: members.length,
            paidMembers,
            unpaidMembers,
            totalCollection
        });
    } catch (error) {
        console.error('Get payment stats error:', error);
        res.status(500).json({ error: 'Failed to fetch payment statistics' });
    }
});

// ==================== EXPENSE ROUTES ====================

// Get all expenses
app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ year: -1, month: -1 });
        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Add new expense (Admin only)
app.post('/api/expenses', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { month, year, electricityBill, internetBill, miscellaneous } = req.body;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        // Check if expense already exists
        const existingExpense = await Expense.findOne({ month, year });
        if (existingExpense) {
            return res.status(400).json({ error: 'Expense for this month already exists' });
        }

        const totalExpense = (electricityBill || 0) + (internetBill || 0) + (miscellaneous || 0);

        const newExpense = new Expense({
            month,
            year,
            electricityBill: electricityBill || 0,
            internetBill: internetBill || 0,
            miscellaneous: miscellaneous || 0,
            totalExpense
        });

        await newExpense.save();

        res.status(201).json({
            message: 'Expense added successfully',
            expense: newExpense
        });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// Delete expense (Admin only)
app.delete('/api/expenses/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Expense.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics (Admin only)
app.get('/api/dashboard/stats', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Get all members
        const members = await Member.find();
        const totalMembers = members.length;

        // Calculate monthly collection
        let monthlyCollection = 0;
        members.forEach(member => {
            const payment = member.monthlyPayments.find(
                p => p.month === currentMonth && p.year === currentYear && p.status === 'paid'
            );
            if (payment) monthlyCollection += payment.amount || 100;
        });

        // Get current month expense
        const currentExpense = await Expense.findOne({ month: currentMonth, year: currentYear });
        const monthlyExpenses = currentExpense ? currentExpense.totalExpense : 0;

        // Calculate net balance
        const netBalance = monthlyCollection - monthlyExpenses;

        // Get last 6 months data for charts
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            let collection = 0;
            members.forEach(member => {
                const payment = member.monthlyPayments.find(
                    p => p.month === month && p.year === year && p.status === 'paid'
                );
                if (payment) collection += payment.amount || 100;
            });

            const expense = await Expense.findOne({ month, year });
            const expenseAmount = expense ? expense.totalExpense : 0;

            chartData.push({
                month,
                year,
                collection,
                expense: expenseAmount
            });
        }

        res.json({
            totalMembers,
            monthlyCollection,
            monthlyExpenses,
            netBalance,
            chartData
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// ==================== INITIALIZATION ROUTE ====================

// Initialize default admin (Only run once)
app.post('/api/init', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await Member.findOne({ memberId: 'brahmastra01' });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already initialized' });
        }

        // Create default admin
        const hashedPassword = await bcrypt.hash('Accen@10090', 10);
        const admin = new Member({
            memberId: 'brahmastra01',
            memberName: 'Admin User',
            password: hashedPassword,
            role: 'admin',
            monthlyPayments: []
        });

        await admin.save();

        res.json({ message: 'Default admin created successfully' });
    } catch (error) {
        console.error('Initialization error:', error);
        res.status(500).json({ error: 'Failed to initialize' });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Brahmastra Club Management API is running',
        timestamp: new Date().toISOString()
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`💚 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});
