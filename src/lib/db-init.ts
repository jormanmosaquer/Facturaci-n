import { getDb } from './db';

async function initializeDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      vatNumber TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoiceNumber TEXT NOT NULL,
      customerId TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY,
      invoiceId TEXT NOT NULL,
      productId TEXT,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unitPrice REAL NOT NULL,
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON SET NULL
    );
  `);

  // Insert a default admin user if it doesn't exist.
  // In a real application, use a secure password hash.
  const adminUser = await db.get("SELECT * FROM users WHERE email = ?", "admin@ejemplo.com");
  if (!adminUser) {
    await db.run(
      "INSERT INTO users (id, email, password) VALUES (?, ?, ?)",
      'admin-user-01', 'admin@ejemplo.com', 'admin123'
    );
    console.log('Default admin user created.');
  }


  console.log('Database initialized successfully.');
  await db.close();
}

initializeDb().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
