import { expect, APIRequestContext } from "@playwright/test";

export async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post("/api/auth/login", {
    data: {
      email: "an@test.com",
      password: "Matkhau123",
    },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  return data.token;
}

export async function getAdminToken(
  request: APIRequestContext,
): Promise<string> {
  const res = await request.post("/api/auth/login", {
    data: {
      email: "admin@test.com",
      password: "Matkhau123",
    },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  return data.token;
}

export async function createdOrder(
  request: APIRequestContext,
  token: string,
  productId: number,
  quantity: number,
) {
  await request.post("/api/cart/items", {
    headers: { Authorization: `Bearer ${token}` },
    data: { productId: productId, quantity: quantity },
  });

  const res = await request.post("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      fullname: "Nguyen Van An",
      phone: "0124366579",
      address: "Cau Giay, Ha Noi",
    },
  });
  expect(res.status()).toBe(201);
  return await res.json();
}
