curl -X PATCH http://localhost:4000/api/orders/<ORDER_ID>/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED"}'
