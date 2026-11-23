import requests
import concurrent.futures

base = 'http://localhost:4000/api'
# 1. Reset database
requests.post(f'{base}/test/reset')

# 2. Login
login_res = requests.post(f'{base}/auth/login', json={'email': 'an@test.com', 'password': 'Matkhau123'}).json()
token = login_res['token']
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 3. Add 1 item to cart
requests.post(f'{base}/cart/items', headers=headers, json={'productId': 1, 'quantity': 1})

# 4. Send 2 order requests concurrently (in parallel)
payload = {
    'fullname': 'Nguyen Van An',
    'phone': '0961577213',
    'address': 'Cau Giay, Ha Noi'
}

def send_request():
    return requests.post(f'{base}/orders', headers=headers, json=payload)

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    f1 = executor.submit(send_request)
    f2 = executor.submit(send_request)
    res1 = f1.result()
    res2 = f2.result()

print(f"Request 1 Status: {res1.status_code}, Order ID: {res1.json().get('id')}")
print(f"Request 2 Status: {res2.status_code}, Order ID: {res2.json().get('id')}")

# 5. Check order list
orders = requests.get(f'{base}/orders', headers=headers).json()
print(f"\n=> Tổng số đơn hàng của an@test.com hiện tại: {len(orders)}")
for o in orders[:2]:
    print(f"   - Đơn #{o['id']}: Người nhận '{o['fullname']}', Tổng tiền: {o['total']}đ, Lúc: {o['createdAt']}")
