import BetterSqlite3 from 'better-sqlite3';

// Definimos las interfaces como tipos
export type User = {
  id: number;
  username: string;
  password: string;
};

export type File = {
  id: number;
  userId: number;
  filename: string;
  path: string;
  createdAt: string;
};

// Definimos un tipo para nuestra base de datos personalizada
type CustomDatabase = BetterSqlite3.Database & {
  getUser(username: string): User | undefined;
  createUser(username: string, password: string): void;
  getFiles(userId: number): File[];
  createFile(file: Omit<File, 'id'>): void;
  deleteFile(id: number): void;
};

let db: CustomDatabase | null = null;

export async function openDb(): Promise<CustomDatabase> {
  if (!db) {
    db = new BetterSqlite3('./mydb.sqlite') as CustomDatabase;

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        filename TEXT,
        path TEXT,
        createdAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    db.getUser = function(this: BetterSqlite3.Database, username: string): User | undefined {
      return this.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
    };

    db.createUser = function(this: BetterSqlite3.Database, username: string, password: string): void {
      this.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
    };

    db.getFiles = function(this: BetterSqlite3.Database, userId: number): File[] {
      return this.prepare('SELECT * FROM files WHERE userId = ?').all(userId) as File[];
    };

    db.createFile = function(this: BetterSqlite3.Database, file: Omit<File, 'id'>): void {
      this.prepare('INSERT INTO files (userId, filename, path, createdAt) VALUES (?, ?, ?, ?)').run(
        file.userId,
        file.filename,
        file.path,
        file.createdAt
      );
    };

    db.deleteFile = function(this: BetterSqlite3.Database, id: number): void {
      this.prepare('DELETE FROM files WHERE id = ?').run(id);
    };
  }

  return db;
}