const { query, initializeDatabase, generateUUID } = require('./database');
const bcrypt = require('bcryptjs');

// Define your users here - change names/emails/passwords as needed!
const USERS = [
    {
        email: 'admin@dashboard.local',
        password: 'admin123',
        fullName: 'Administrator',
        role: 'admin'
    },
    {
        email: 'user1@dashboard.local',
        password: 'user1pass',
        fullName: 'User One',
        role: 'student'
    },
    {
        email: 'user2@dashboard.local',
        password: 'user2pass',
        fullName: 'User Two',
        role: 'student'
    },
    {
        email: 'user3@dashboard.local',
        password: 'user3pass',
        fullName: 'User Three',
        role: 'student'
    }
];

// Initialize database and create users
async function init() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();

        for (const user of USERS) {
            // Check if user already exists
            const existingRes = await query('SELECT * FROM users WHERE email = $1', [user.email]);
            const existing = existingRes.rows[0];

            if (!existing) {
                console.log(`Creating user: ${user.email}...`);
                const hashedPassword = await bcrypt.hash(user.password, 10);

                await query(`
                    INSERT INTO users (user_id, email, password_hash, full_name, role, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    generateUUID(),
                    user.email,
                    hashedPassword,
                    user.fullName,
                    user.role,
                    true
                ]);

                console.log(`  ✓ Created: ${user.fullName} (${user.email})`);
            } else {
                console.log(`  - Already exists: ${user.email}`);
            }
        }

        console.log('\n✅ Database initialization complete!');
        console.log('\nUser accounts:');
        USERS.forEach(u => {
            console.log(`  📧 ${u.email} | 🔑 ${u.password} | 👤 ${u.fullName}`);
        });
        console.log('\n⚠️  IMPORTANT: Change passwords after first login!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

init();
