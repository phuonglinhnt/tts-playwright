curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fullname": "Nguyễn Văn An", "phone": "0901234567", "address": "12 Nguyễn Huệ, Quận 1, TP HCM"}'
