curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
