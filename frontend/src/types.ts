export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: string;
  shopName?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductSummary {
  id: string;
  title: string;
  basePrice: number;
  status: string;
  featured: boolean;
  ratingAvg: number;
  ratingCount: number;
  primaryImageUrl?: string | null;
  sellerShopName?: string | null;
  sellerId?: string | null;
}

export interface Variant {
  id: string;
  sku: string;
  name: string;
  color?: string | null;
  size?: string | null;
  price: number;
  stock: number;
}

export interface ProductDetail {
  id: string;
  title: string;
  description?: string;
  basePrice: number;
  status: string;
  featured: boolean;
  ratingAvg: number;
  ratingCount: number;
  categoryId?: string | null;
  categoryName?: string | null;
  sellerId?: string | null;
  sellerShopName?: string | null;
  imageUrls: string[];
  variants: Variant[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  authorName: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productTitle: string;
  variantName: string;
  sku: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  availableStock: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  variantName: string;
  sku: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  paid: boolean;
  returnStatus: string;
  returnReason?: string | null;
  shipName: string;
  shipPhone: string;
  shipLine1: string;
  shipLine2?: string | null;
  shipCity: string;
  shipState: string;
  shipPostalCode: string;
  placedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  cancellable: boolean;
  returnable: boolean;
  items: OrderItem[];
}

export interface CheckoutResponse {
  order: Order;
  razorpayOrderId: string;
  razorpayKeyId?: string | null;
  amount: number;
  currency: string;
  mockPayment: boolean;
}

export interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  unitsSold: number;
  productCount: number;
  pendingFulfilment: number;
  topProducts: { productTitle: string; unitsSold: number; revenue: number }[];
}
