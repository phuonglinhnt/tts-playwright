curl -X PATCH http://localhost:4000/api/cart/items/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
