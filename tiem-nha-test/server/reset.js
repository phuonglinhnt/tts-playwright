import { resetDatabase, DB_PATH } from './db.js';

resetDatabase();
console.log(`Đã đặt lại dữ liệu mẫu: ${DB_PATH}`);
