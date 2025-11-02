const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brahmastra-club', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

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

const Member = mongoose.model('Member', memberSchema);

async function initializeDatabase() {
    try {
        // Check if admin already exists
        const existingAdmin = await Member.findOne({ memberId: 'brahmastra01' });
        
        if (existingAdmin) {
            console.log('⚠️  Default admin already exists!');
            console.log('Admin ID: brahmastra01');
            process.exit(0);
        }

        // Hash default password
        const hashedPassword = await bcrypt.hash('Accen@10090', 10);

        // Create default admin
        const admin = new Member({
            memberId: 'brahmastra01',
            memberName: 'Admin User',
            password: hashedPassword,
            role: 'admin',
            monthlyPayments: []
        });

        await admin.save();

        console.log('✅ Database initialized successfully!');
        console.log('');
        console.log('🔐 Default Admin Credentials:');
        console.log('   User ID: brahmastra01');
        console.log('   Password: Accen@10090');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the default password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();
