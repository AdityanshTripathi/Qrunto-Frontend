// Stored invoice amounts have two decimal places. Calculate the difference in
// integer minor units so display rounding cannot invent or lose a discount.
export function invoiceDiscount(order: { subtotal: number; taxAmount: number; totalAmount: number }): number {
  return Math.max(0, Math.round(order.subtotal * 100) + Math.round(order.taxAmount * 100) - Math.round(order.totalAmount * 100)) / 100;
}
