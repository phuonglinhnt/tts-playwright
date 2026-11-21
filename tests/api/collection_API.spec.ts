import { test, expect, request } from "@playwright/test";
import { createdOrder, getToken } from "./callBackApi";

test.describe("Bộ kiểm thử API theo Colection", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");
  });

  test("TC01 - Đăng nhập hợp lệ", async ({ request }) => {
    const token = await getToken(request);

    expect(token).toBeTruthy();
  });

  test("TC02 - Đăng nhập sai mật khẩu", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "an@test.com", password: "Saimatkhau" },
    });
    expect(res.status()).toBe(401);
  });

  test("TC03 - Lấy danh sách sản phẩm", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.get("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
  });

  test("TC04 - Xem sản phẩm không tồn tại", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.get("/api/products/999", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
  });

  test("TC05 - Xem giỏ hàng không có token", async ({ request }) => {
    const res = await request.get("/api/cart");
    expect(res.status()).toBe(401);
  });

  test("TC06 - Thêm sản phẩm vào giỏ hàng", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 2 },
    });
    expect(res.status()).toBe(201);
  });

  test("TC07 - Tạo đơn hàng thành công", async ({ request }) => {
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);

    expect(order.id).toBeDefined();
    expect(order.status).toBe("NEW");
  });

  test("TC08 - Xem chi tiết đơn hàng vừa tạo", async ({ request }) => {
    const token = await getToken(request);
    const newOrder = await createdOrder(request, token, 1, 1);
    const res = await request.get(`/api/orders/${newOrder.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const orderDetail = await res.json();
    expect(orderDetail.id).toBe(newOrder.id);
  });

  test("TC09 - Xem giỏ hàng hợp lệ khi có Token", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const cart = await res.json();
    expect(cart.items).toBeDefined();
  });

  test("TC10 - Đổi số lượng sản phẩm trong giỏ hàng", async ({ request }) => {
    const token = await getToken(request);

    await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });
    const res = await request.patch("/api/cart/items/1", {
      headers: { Authorization: `Bearer ${token}` },
      data: { quantity: 3 },
    });
    expect(res.status()).toBe(200);
  });

  test("TC11 - Xóa một sản phẩm khỏi giỏ hàng", async ({ request }) => {
    const token = await getToken(request);
    await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });
    const res = await request.delete("/api/cart/items/1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(204);
  });

  test("TC12 - Khách tự hủy đơn hàng mới tạo", async ({ request }) => {
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);

    const res = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "CANCELLED" },
    });
    expect(res.status()).toBe(200);
    const updatedOrder = await res.json();
    expect(updatedOrder.status).toBe("CANCELLED");
  });

  test("TC13 - Khách thường không được phép đổi trạng thái sang SHIPPING", async ({
    request,
  }) => {
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);
    const res = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "SHIPPING" },
    });
    expect(res.status()).toBe(403);
  });

  test("TC14 - Lấy thông tin người dùng đang đăng nhập (Me)", async ({
    request,
  }) => {
    const token = await getToken(request);
    const res = await request.get("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const user = await res.json();
    expect(user.email).toBe("an@test.com");
  });
});
