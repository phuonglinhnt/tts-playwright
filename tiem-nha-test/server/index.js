import express from 'express';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, verifyPassword, hashPassword, resetDatabase, ensureDatabase, discountRate, DB_PATH } from './db.js';

ensureDatabase();

const app = express();
app.use(express.json());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STATUS_LABEL = {
  NEW: 'Mới',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const TRANSITIONS = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const REVIEWS = {
  1: [{ author: 'Hà', rating: 5, text: 'Vải mát, mặc đi làm rất ổn.' }, { author: 'Tuấn', rating: 4, text: 'Size hơi rộng, nên chọn nhỏ hơn một size.' }],
  2: [{ author: 'Linh', rating: 4, text: 'Form đẹp, giao nhanh.' }],
  3: [{ author: 'Khánh', rating: 5, text: 'Đi êm chân.' }],
  4: [],
  5: [{ author: 'Mai', rating: 3, text: 'Màu hơi khác ảnh.' }],
  7: [{ author: 'Phúc', rating: 5, text: 'Giữ lạnh tốt thật.' }],
  8: [{ author: 'Dũng', rating: 4, text: 'Nhẹ, gấp gọn tiện mang theo.' }],
};

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, age: u.age, isMember: !!u.is_member, role: u.role, mode: u.mode };
}

function productOut(p) {
  return {
    id: p.id, slug: p.slug, name: p.name, price: p.price, stock: p.stock,
    inStock: p.stock > 0, color: p.color, icon: p.icon, description: p.description,
  };
}

function auth(req, res, next) {
  const match = (req.get('authorization') || '').match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
  const user = db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(match[1]);
  if (!user) return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  req.user = user;
  req.token = match[1];
  next();
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  next();
}

function cartFor(user) {
  const rows = db.prepare(`SELECT p.id AS productId, p.slug, p.name, p.price, p.stock, p.color, p.icon, c.quantity
    FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ? ORDER BY p.id`).all(user.id);
  const items = rows.map((r) => ({ ...r, lineTotal: r.price * r.quantity }));
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const rate = discountRate(!!user.is_member, subtotal);
  const discount = Math.round((subtotal * rate) / 100);
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    discountRate: rate,
    discount,
    total: subtotal - discount,
  };
}

function orderOut(id) {
  const o = db.prepare('SELECT o.*, u.email AS customer_email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?').get(id);
  if (!o) return null;
  const items = db.prepare('SELECT product_id AS productId, name, price, quantity, price * quantity AS lineTotal FROM order_items WHERE order_id = ?').all(id);
  return {
    id: o.id, userId: o.user_id, customerEmail: o.customer_email,
    status: o.status, statusLabel: STATUS_LABEL[o.status],
    subtotal: o.subtotal, discount: o.discount, total: o.total,
    fullname: o.fullname, phone: o.phone, address: o.address,
    createdAt: o.created_at, updatedAt: o.updated_at, items,
  };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ---------- Hệ thống ----------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/test/reset', (req, res) => {
  resetDatabase();
  res.status(204).end();
});

// ---------- Tài khoản ----------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  if (user.is_locked) return res.status(403).json({ message: 'Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.' });

  const tempLocked = db.prepare("SELECT 1 FROM users WHERE id = ? AND locked_until > datetime('now')").get(user.id);
  if (tempLocked) return res.status(403).json({ message: 'Tài khoản tạm khóa 15 phút do nhập sai mật khẩu quá 5 lần.' });

  if (!verifyPassword(String(password), user.password_hash)) {
    const attempts = user.failed_attempts + 1;
    if (attempts >= 5) {
      db.prepare("UPDATE users SET failed_attempts = 0, locked_until = datetime('now', '+15 minutes') WHERE id = ?").run(user.id);
      return res.status(403).json({ message: 'Tài khoản tạm khóa 15 phút do nhập sai mật khẩu quá 5 lần.' });
    }
    db.prepare('UPDATE users SET failed_attempts = ? WHERE id = ?').run(attempts, user.id);
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  db.prepare('UPDATE users SET locked_until = NULL WHERE id = ?').run(user.id);
  const token = randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  res.json({ token, user: publicUser(user) });
});

app.post('/api/auth/register', (req, res) => {
  const b = req.body || {};
  const errors = {};

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) errors.name = 'Vui lòng nhập họ tên';
  else if (name.length > 50) errors.name = 'Họ tên tối đa 50 ký tự';

  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!email) errors.email = 'Vui lòng nhập email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không đúng định dạng';

  const password = typeof b.password === 'string' ? b.password : '';
  if (!password) errors.password = 'Vui lòng nhập mật khẩu';
  else if (password.length < 8) errors.password = 'Mật khẩu phải dài từ 8 đến 20 ký tự';
  else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) errors.password = 'Mật khẩu cần ít nhất 1 chữ hoa và 1 chữ số';

  if (b.confirmPassword !== undefined && b.confirmPassword !== password) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }

  if (b.age === undefined || b.age === null || b.age === '') {
    errors.age = 'Vui lòng nhập tuổi';
  } else {
    const age = Number(b.age);
    if (!Number.isInteger(age)) errors.age = 'Tuổi phải là số nguyên';
    else if (!(age > 18 && age <= 60)) errors.age = 'Tuổi phải từ 18 đến 60';
  }

  if (Object.keys(errors).length) return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });

  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ message: 'Email đã được sử dụng', errors: { email: 'Email đã được sử dụng' } });
  }

  const { lastInsertRowid } = db.prepare(`INSERT INTO users (email, name, password_hash, age, is_member, role)
    VALUES (@email, @name, @password_hash, @age, @is_member, @role)`)
    .run({ is_member: 1, role: 'customer', ...b, email, name, password_hash: hashPassword(password), age: Number(b.age) });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Email không đúng định dạng' });
  res.json({ message: 'Nếu email đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
});

app.post('/api/auth/logout', auth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ? AND user_id = ?').run(req.user.id, req.token);
  res.status(204).end();
});

app.get('/api/me', auth, (req, res) => res.json(publicUser(req.user)));

// ---------- Sản phẩm ----------
const SORTS = { name_asc: 'name ASC', name_desc: 'name DESC', price_asc: 'price ASC', price_desc: 'price DESC' };

app.get('/api/products', auth, (req, res) => {
  const sort = req.query.sort || 'name_asc';
  if (!SORTS[sort]) return res.status(400).json({ message: 'Giá trị sort không hợp lệ. Dùng: ' + Object.keys(SORTS).join(', ') });
  const q = String(req.query.q || '').trim();
  const rows = q
    ? db.prepare(`SELECT * FROM products WHERE name LIKE ? ORDER BY ${SORTS[sort]}`).all(`%${q}%`)
    : db.prepare(`SELECT * FROM products ORDER BY ${SORTS[sort]}`).all();
  res.json(rows.map(productOut));
});

app.get('/api/products/:id', auth, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ' });
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!p) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(productOut(p));
});

app.get('/api/products/:id/reviews', auth, (req, res) => {
  const reviews = REVIEWS[req.params.id];
  if (!reviews) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
  res.json(reviews);
});

// ---------- Giỏ hàng ----------
app.get('/api/cart', auth, (req, res) => res.json(cartFor(req.user)));

app.post('/api/cart/items', auth, (req, res) => {
  const body = req.body || {};
  if (body.productId === undefined) return res.status(400).json({ message: 'Thiếu productId' });
  const quantity = body.quantity === undefined ? 1 : body.quantity;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(body.productId);
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  if (product.stock === 0) return res.status(400).json({ message: 'Sản phẩm đã hết hàng' });

  const existing = db.prepare('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product.id);
  const newQuantity = existing ? existing.quantity + quantity : quantity;
  if (newQuantity > product.stock) return res.status(400).json({ message: `Chỉ còn ${product.stock} sản phẩm trong kho` });

  db.prepare(`INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = excluded.quantity`).run(req.user.id, product.id, newQuantity);
  res.status(201).json(cartFor(req.user));
});

app.patch('/api/cart/items/:productId', auth, (req, res) => {
  const { quantity } = req.body || {};
  if (quantity === undefined) return res.status(400).json({ message: 'Thiếu quantity' });
  if (quantity < 1) return res.status(400).json({ message: 'Số lượng tối thiểu là 1' });

  const item = db.prepare(`SELECT c.quantity, p.stock FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ? AND c.product_id = ?`).get(req.user.id, req.params.productId);
  if (!item) return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
  if (quantity > item.stock) return res.status(400).json({ message: `Chỉ còn ${item.stock} sản phẩm trong kho` });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?').run(quantity, req.user.id, req.params.productId);
  res.json(cartFor(req.user));
});

app.delete('/api/cart/items/:productId', auth, (req, res) => {
  const info = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  if (!info.changes) return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
  res.status(204).end();
});

app.delete('/api/cart', auth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.status(204).end();
});

// ---------- Đơn hàng ----------
app.post('/api/orders', auth, async (req, res, next) => {
  try {
    const b = req.body || {};
    const errors = {};
    const fullname = typeof b.fullname === 'string' ? b.fullname.trim() : '';
    const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
    const address = typeof b.address === 'string' ? b.address.trim() : '';
    if (!fullname) errors.fullname = 'Vui lòng nhập họ tên người nhận';
    if (!phone) errors.phone = 'Vui lòng nhập số điện thoại';
    if (!address) errors.address = 'Vui lòng nhập địa chỉ giao hàng';
    else if (address.length < 10) errors.address = 'Địa chỉ quá ngắn, vui lòng nhập đầy đủ';
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });

    const cart = cartFor(req.user);
    if (!cart.items.length) return res.status(400).json({ message: 'Giỏ hàng đang trống' });

    // Giả lập thời gian xử lý thanh toán
    await sleep(800);

    const create = db.transaction(() => {
      const data = { ...cart, ...b, fullname, phone, address };
      const { lastInsertRowid: orderId } = db.prepare(`INSERT INTO orders (user_id, subtotal, discount, total, fullname, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(req.user.id, data.subtotal, data.discount, data.total, data.fullname, data.phone, data.address);
      const addItem = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)');
      const takeStock = db.prepare('UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?');
      for (const i of cart.items) {
        addItem.run(orderId, i.productId, i.name, i.price, i.quantity);
        takeStock.run(i.quantity, i.productId);
      }
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
      return orderId;
    });
    res.status(201).json(orderOut(create()));
  } catch (err) {
    next(err);
  }
});

app.get('/api/orders', auth, (req, res) => {
  const { status } = req.query;
  if (status && !STATUS_LABEL[status]) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  const where = [];
  const params = [];
  if (req.user.role !== 'admin') { where.push('user_id = ?'); params.push(req.user.id); }
  if (status) { where.push('status = ?'); params.push(status); }
  const q = String(req.query.q || '').trim();
  if (q) where.push(`id IN (SELECT order_id FROM order_items WHERE name LIKE '%${q}%')`);
  const sql = `SELECT id FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC`;
  res.json(db.prepare(sql).all(...params).map((r) => orderOut(r.id)));
});

app.get('/api/orders/:id', auth, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
  const order = orderOut(id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  res.json(order);
});

app.patch('/api/orders/:id/status', auth, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
  const next = req.body?.status;
  if (!STATUS_LABEL[next]) return res.status(400).json({ message: 'Trạng thái không hợp lệ. Dùng: ' + Object.keys(STATUS_LABEL).join(', ') });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  if (req.user.role !== 'admin') {
    if (order.user_id !== req.user.id) return res.status(403).json({ message: 'Bạn không có quyền với đơn hàng này' });
    if (next !== 'CANCELLED') return res.status(403).json({ message: 'Bạn chỉ có thể hủy đơn hàng' });
  }

  let allowed = TRANSITIONS[order.status].includes(next);
  if (next === 'CANCELLED' && order.status === 'DELIVERED') allowed = true;
  if (!allowed) {
    return res.status(400).json({ message: `Không thể chuyển đơn từ "${STATUS_LABEL[order.status]}" sang "${STATUS_LABEL[next]}"` });
  }

  const update = db.transaction(() => {
    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(next, id);
    if (next === 'CANCELLED') {
      const restock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      for (const i of db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id)) {
        restock.run(i.quantity, i.product_id);
      }
    }
  });
  update();
  res.json(orderOut(id));
});

app.delete('/api/orders/:id', auth, adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
  const info = db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  res.status(204).end();
});

// ---------- Lỗi ----------
app.use('/api', (req, res) => res.status(404).json({ message: 'Không tìm thấy API' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Dữ liệu JSON không hợp lệ' });
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ', detail: err.message });
});

// ---------- Giao diện (bản đã build) ----------
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(join(dist, 'index.html')));
}

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Tiệm Nhà Test đang chạy tại http://localhost:${PORT}`);
  console.log(`Cơ sở dữ liệu: ${DB_PATH}`);
});
