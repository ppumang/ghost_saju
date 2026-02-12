export const PRODUCTS = {
  saju_reading: {
    id: 'saju_reading',
    name: '귀신사주 풀이',
    price: 9900,
    currency: 'KRW',
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;

export function getProduct(productId: string) {
  return PRODUCTS[productId as ProductId] ?? null;
}
