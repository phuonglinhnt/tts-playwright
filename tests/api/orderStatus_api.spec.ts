import { test, expect } from "@playwright/test";
import { getToken, getAdminToken, createdOrder } from "./callBackApi";

test.describe("Quản lý trạng thái đơn hàng API", () => {
  test.describe.configure({ mode: "serial" });

  let tokenAn: string;
  let tokenAdmin: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");

    tokenAn = await getToken(request);
    tokenAdmin = await getAdminToken(request);
  });

  test("Khách hàng tự hủy đơn khi ở status NEW và hoàn tồn kho", async ({
    request,
  }) => {
    // Tạo đơn mua SP mã 4 (SL 1)
    const order = await createdOrder(request, tokenAn, 4, 1);

    // KH tự hủy đơn
    const resCancel = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
      data: { status: "CANCELLED" },
    });
    expect(resCancel.status()).toBe(200);
    const orderCancelled = await resCancel.json();
    expect(orderCancelled.status).toBe("CANCELLED");

    // Kiểm tra tồn kho sản phẩm 4 được cộng lại 1 (thành 3)
    const resProduct = await request.get("/api/products/4", {
      headers: { Authorization: `Bearer ${tokenAn}` },
    });
    expect(resProduct.status()).toBe(200);
    const product = await resProduct.json();
    expect(product.stock).toBe(3);
  });

  test("Khách hàng tự hủy đơn khi ở status CONFIRMED", async ({ request }) => {
    const order = await createdOrder(request, tokenAn, 4, 1);

    // Admin xác nhận đơn hàng -> CONFIRMED
    const resConfirm = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      data: { status: "CONFIRMED" },
    });
    expect(resConfirm.status()).toBe(200);

    // KH tự hủy đơn -> CANCELLED
    const resCancel = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
      data: { status: "CANCELLED" },
    });
    expect(resCancel.status()).toBe(200);
    const orderCancelled = await resCancel.json();
    expect(orderCancelled.status).toBe("CANCELLED");

    // Kiểm tra tồn kho phục hồi về 3
    const resProduct = await request.get("/api/products/4", {
      headers: { Authorization: `Bearer ${tokenAn}` },
    });
    const product = await resProduct.json();
    expect(product.stock).toBe(3);
  });

  test("Khách hàng không thể hủy khi đơn hàng đang ở status SHIPPING", async ({
    request,
  }) => {
    const order = await createdOrder(request, tokenAn, 4, 1);

    // Admin chuyển sang CONFIRMED -> SHIPPING
    await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      data: { status: "CONFIRMED" },
    });
    await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      data: { status: "SHIPPING" },
    });

    // KH gửi yêu cầu hủy đơn
    const resCancel = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
      data: { status: "CANCELLED" },
    });

    expect(resCancel.status()).toBe(400);
    const body = await resCancel.json();
    expect(body.message).toBe(
      'Không thể chuyển đơn từ "Đang giao" sang "Đã hủy"',
    );

    // Kiểm tra trạng thái đơn hàng vẫn là SHIPPING
    const resOrder = await request.get(`/api/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
    });
    const orderData = await resOrder.json();
    expect(orderData.status).toBe("SHIPPING");
  });

  test("Khách hàng không thể tự đổi trạng thái đơn hàng sang CONFIRMED", async ({
    request,
  }) => {
    const order = await createdOrder(request, tokenAn, 4, 1);

    // KH tự PATCH sang CONFIRMED
    const res = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
      data: { status: "CONFIRMED" },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.message).toBe("Bạn chỉ có thể hủy đơn hàng");

    // Kiểm tra trạng thái đơn vẫn giữ nguyên NEW
    const resOrder = await request.get(`/api/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
    });
    const orderData = await resOrder.json();
    expect(orderData.status).toBe("NEW");
  });

  test("Khách hàng không thể tự đổi trạng thái đơn hàng sang DELIVERED", async ({
    request,
  }) => {
    const order = await createdOrder(request, tokenAn, 4, 1);

    // KH tự PATCH sang DELIVERED
    const res = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
      data: { status: "DELIVERED" },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.message).toBe("Bạn chỉ có thể hủy đơn hàng");

    // Kiểm tra trạng thái đơn vẫn giữ nguyên NEW
    const resOrder = await request.get(`/api/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${tokenAn}` },
    });
    const orderData = await resOrder.json();
    expect(orderData.status).toBe("NEW");
  });
});
