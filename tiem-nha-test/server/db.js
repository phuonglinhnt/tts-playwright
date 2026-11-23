import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

class DatabaseWrapper {
  constructor(path) {
    this._db = new DatabaseSync(path);
    this._inTx = false;
  }

  exec(sql) {
    return this._db.exec(sql);
  }

  pragma(sql) {
    return this._db.exec(`PRAGMA ${sql};`);
  }

  prepare(sql) {
    const stmt = this._db.prepare(sql);
    if (typeof stmt.setAllowUnknownNamedParameters === 'function') {
      stmt.setAllowUnknownNamedParameters(true);
    }
    if (typeof stmt.setAllowBareNamedParameters === 'function') {
      stmt.setAllowBareNamedParameters(true);
    }
    return stmt;
  }

  transaction(fn) {
    return (...args) => {
      const isNested = this._inTx;
      if (!isNested) {
        this._inTx = true;
        this.exec('BEGIN');
      } else {
        this.exec('SAVEPOINT sp');
      }
      try {
        const result = fn(...args);
        if (!isNested) {
          this.exec('COMMIT');
          this._inTx = false;
        } else {
          this.exec('RELEASE SAVEPOINT sp');
        }
        return result;
      } catch (err) {
        if (!isNested) {
          this.exec('ROLLBACK');
          this._inTx = false;
        } else {
          this.exec('ROLLBACK TO SAVEPOINT sp');
        }
        throw err;
      }
    };
  }

  close() {
    return this._db.close();
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DB_PATH = process.env.DB_PATH || join(root, 'data', 'shop.db');
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseWrapper(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 32);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const SCHEMA = `
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id              INTEGER PRIMARY KEY,
  email           TEXT    NOT NULL UNIQUE,
  name            TEXT    NOT NULL,
  password_hash   TEXT    NOT NULL,
  age             INTEGER,
  is_member       INTEGER NOT NULL DEFAULT 0,
  role            TEXT    NOT NULL DEFAULT 'customer',
  mode            TEXT    NOT NULL DEFAULT 'standard',
  is_locked       INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE sessions (
  token      TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE products (
  id          INTEGER PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  price       INTEGER NOT NULL,
  stock       INTEGER NOT NULL,
  color       TEXT    NOT NULL,
  icon        TEXT    NOT NULL,
  description TEXT    NOT NULL
) STRICT;

CREATE TABLE cart_items (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (user_id, product_id)
) STRICT;

CREATE TABLE orders (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  subtotal   INTEGER NOT NULL,
  discount   INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'NEW',
  fullname   TEXT    NOT NULL,
  phone      TEXT    NOT NULL,
  address    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE order_items (
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  name       TEXT    NOT NULL,
  price      INTEGER NOT NULL,
  quantity   INTEGER NOT NULL
) STRICT;
`;

export const DEFAULT_PASSWORD = 'Matkhau123';

const USERS = [
  { email: 'an@test.com', name: 'Nguyễn Văn An', age: 25, is_member: 1 },
  { email: 'binh@test.com', name: 'Trần Thị Bình', age: 31, is_member: 0 },
  { email: 'khoa@test.com', name: 'Lê Minh Khoa', age: 40, is_member: 1, is_locked: 1 },
  { email: 'loi@test.com', name: 'Phạm Văn Lợi', age: 28, is_member: 1, mode: 'problem' },
  { email: 'admin@test.com', name: 'Quản trị viên', age: 35, is_member: 0, role: 'admin' },
];

const PRODUCTS = [
  ['ao-thun-basic', 'Áo thun basic', 199000, 20, '#3B6FD8', '👕', 'Áo thun cotton 100%, form suông, mặc hằng ngày. Có 4 màu.'],
  ['quan-jean-slim', 'Quần jean slim', 450000, 10, '#2C3E73', '👖', 'Quần jean co giãn nhẹ, ống côn vừa phải.'],
  ['giay-sneaker-trang', 'Giày sneaker trắng', 890000, 5, '#8FA6CF', '👟', 'Giày da tổng hợp, đế cao su chống trượt.'],
  ['balo-laptop', 'Balo laptop', 350000, 3, '#4A7D5C', '🎒', 'Ngăn chống sốc cho laptop 15,6 inch, chống nước nhẹ.'],
  ['mu-luoi-trai', 'Mũ lưỡi trai', 120000, 30, '#D9534F', '🧢', 'Mũ kaki, khóa cài phía sau điều chỉnh được.'],
  ['tai-nghe-bluetooth', 'Tai nghe bluetooth', 590000, 8, '#7A5BC7', '🎧', 'Pin 30 giờ, chống ồn chủ động, kết nối bluetooth 5.3.'],
  ['binh-nuoc-giu-nhiet', 'Bình nước giữ nhiệt', 250000, 0, '#3AA6A0', '🥤', 'Giữ lạnh 24 giờ, giữ nóng 12 giờ. Dung tích 750 ml.'],
  ['ao-khoac-gio', 'Áo khoác gió', 500000, 7, '#E39B2D', '🧥', 'Chống gió, chống nước nhẹ, gấp gọn vào túi.'],
];

// Đơn hàng mẫu để luyện SQL và test chuyển trạng thái
const SAMPLE_ORDERS = [
  { email: 'an@test.com', status: 'DELIVERED', items: [[1, 2], [5, 1]], daysAgo: 20 },
  { email: 'an@test.com', status: 'SHIPPING', items: [[3, 1]], daysAgo: 3 },
  { email: 'an@test.com', status: 'NEW', items: [[8, 1]], daysAgo: 0 },
  { email: 'binh@test.com', status: 'CONFIRMED', items: [[2, 1], [5, 2]], daysAgo: 1 },
  { email: 'binh@test.com', status: 'DELIVERED', items: [[6, 1]], daysAgo: 12 },
  { email: 'loi@test.com', status: 'CANCELLED', items: [[4, 1]], daysAgo: 7 },
];

export function discountRate(isMember, subtotal) {
  const bigOrder = subtotal > 500000;
  if (isMember) return bigOrder ? 15 : 5;
  return bigOrder ? 10 : 0;
}

export function resetDatabase() {
  db.exec(SCHEMA);
  const insertUser = db.prepare(`INSERT INTO users (email, name, password_hash, age, is_member, role, mode, is_locked)
    VALUES (@email, @name, @password_hash, @age, @is_member, @role, @mode, @is_locked)`);
  const insertProduct = db.prepare(`INSERT INTO products (slug, name, price, stock, color, icon, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertOrder = db.prepare(`INSERT INTO orders (user_id, subtotal, discount, total, status, fullname, phone, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))`);
  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)');

  const seed = db.transaction(() => {
    for (const u of USERS) {
      insertUser.run({
        role: 'customer', mode: 'standard', is_locked: 0, ...u,
        password_hash: hashPassword(DEFAULT_PASSWORD),
      });
    }
    for (const p of PRODUCTS) insertProduct.run(...p);

    for (const o of SAMPLE_ORDERS) {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(o.email);
      const lines = o.items.map(([pid, qty]) => {
        const p = db.prepare('SELECT * FROM products WHERE id = ?').get(pid);
        return { p, qty };
      });
      const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
      const discount = Math.round((subtotal * discountRate(!!user.is_member, subtotal)) / 100);
      const offset = `-${o.daysAgo} days`;
      const { lastInsertRowid } = insertOrder.run(user.id, subtotal, discount, subtotal - discount, o.status,
        user.name, '0901234567', '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', offset, offset);
      for (const l of lines) insertItem.run(lastInsertRowid, l.p.id, l.p.name, l.p.price, l.qty);
    }
  });
  seed();
}

export function ensureDatabase() {
  const exists = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'").get();
  if (!exists) resetDatabase();
}
