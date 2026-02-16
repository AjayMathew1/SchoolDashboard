const { db, initializeDatabase, generateUUID } = require('./database');
const bcrypt = require('bcryptjs');

// Initialize database and create default admin user
async function init() {
    try {
        console.log('Initializing database...');
        initializeDatabase();

        // Check if admin user exists
        const admin = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');

        if (!admin) {
            console.log('Creating default admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            const stmt = db.prepare(`
        INSERT INTO users (user_id, email, password_hash, full_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            stmt.run(
                generateUUID(),
                'admin@dashboard.local',
                hashedPassword,
                'Administrator',
                'admin',
                1
            );

            console.log('Default admin user created!');
            console.log('Email: admin@dashboard.local');
            console.log('Password: admin123');
            console.log('IMPORTANT: Please change this password after first login!');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('\nDatabase initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

init();
