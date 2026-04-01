export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  avatarUrl: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId?: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  attributes: Record<string, string>;
  productName?: string;
  productSlug?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  category: Category;
  thumbnailUrl: string;
  active: boolean;
  createdAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface CartItem {
  id: number;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  updatedAt: string;
}

export interface AddToCartRequest {
  variantId: number;
  quantity: number;
}

export enum OrderStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  COD = 'COD'
}

export interface OrderItem {
  id: number;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequest {
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface Payment {
  id: number;
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  createdAt: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  product: Product;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

export interface CreateCouponRequest {
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom: string;
  validUntil: string;
}

export interface Banner {
  id?: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  sortOrder: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}
