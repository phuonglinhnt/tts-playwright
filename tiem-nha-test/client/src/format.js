const money = new Intl.NumberFormat('vi-VN');

export const formatPrice = (n) => `${money.format(n)}đ`;

export function formatDate(sqlDate) {
  const d = new Date(sqlDate.replace(' ', 'T'));
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const STATUS_LABEL = {
  NEW: 'Mới',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export const STATUS_FLOW = ['NEW', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

export const NEXT_ACTIONS = {
  NEW: [['CONFIRMED', 'Xác nhận đơn'], ['CANCELLED', 'Hủy đơn']],
  CONFIRMED: [['SHIPPING', 'Bắt đầu giao'], ['CANCELLED', 'Hủy đơn']],
  SHIPPING: [['DELIVERED', 'Đã giao xong']],
  DELIVERED: [],
  CANCELLED: [],
};
