// src/lib/api.ts - API Client for Backend Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication APIs
  auth = {
    register: (data: RegisterData) => 
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: LoginData) => 
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProfile: () => 
      this.request<User>('/users/profile'),
  };

  // Events APIs
  events = {
    getAll: (params?: EventFilters) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.location) searchParams.append('location', params.location);
      if (params?.dateRange) searchParams.append('dateRange', params.dateRange);
      if (params?.search) searchParams.append('search', params.search);
      
      const queryString = searchParams.toString();
      return this.request<Event[]>(`/events${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id: string) => 
      this.request<Event>(`/events/${id}`),

    create: (data: CreateEventData) => 
      this.request<Event>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getVenues: () => 
      this.request<Venue[]>('/events/venues'),

    getVenueById: (id: string) => 
      this.request<Venue>(`/events/venues/${id}`),

    getCategories: () => 
      this.request<Category[]>('/events/categories'),

    getCategoryById: (id: string) => 
      this.request<Category>(`/events/categories/${id}`),
  };

  // Tickets APIs
  tickets = {
    getTypes: () => 
      this.request<TicketType[]>('/tickets/types'),

    getTypeById: (id: string) => 
      this.request<TicketType>(`/tickets/types/${id}`),

    purchase: (data: PurchaseTicketData) => 
      this.request<PurchaseResponse>('/tickets/purchase', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    reserve: (data: ReserveTicketData) => 
      this.request<ReservationResponse>('/tickets/reserve', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyTickets: () => 
      this.request<Ticket[]>('/tickets/my-tickets'),

    getTicketById: (ticketId: string) => 
      this.request<Ticket>(`/tickets/my-tickets/${ticketId}`),

    getAvailability: (ticketTypeId: string) => 
      this.request<AvailabilityResponse>(`/tickets/inventory/availability/${ticketTypeId}`),

    getEventInventory: (eventId: string) => 
      this.request<EventInventory>(`/tickets/inventory/event/${eventId}`),

    reserveInventory: (data: ReserveInventoryData) => 
      this.request<ReservationResponse>('/tickets/inventory/reserve', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    releaseInventory: (data: ReleaseInventoryData) => 
      this.request<void>('/tickets/inventory/release', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    confirmInventory: (data: ConfirmInventoryData) => 
      this.request<void>('/tickets/inventory/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Orders APIs
  orders = {
    getCart: () => 
      this.request<Cart>('/orders/cart'),

    addToCart: (data: AddToCartData) => 
      this.request<CartItem>('/orders/cart/add', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateCartItem: (itemId: string, data: UpdateCartItemData) => 
      this.request<CartItem>(`/orders/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    removeFromCart: (itemId: string) => 
      this.request<void>(`/orders/cart/items/${itemId}`, {
        method: 'DELETE',
      }),

    clearCart: () => 
      this.request<void>('/orders/cart/clear', {
        method: 'DELETE',
      }),

    create: (data: CreateOrderData) => 
      this.request<Order>('/orders/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    checkout: (data: CheckoutData) => 
      this.request<CheckoutResponse>('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyOrders: () => 
      this.request<Order[]>('/orders/my-orders'),

    getById: (orderId: string) => 
      this.request<Order>(`/orders/${orderId}`),

    cancel: (orderId: string) => 
      this.request<Order>(`/orders/${orderId}/cancel`, {
        method: 'POST',
      }),

    getSagaStatus: (sagaId: string) => 
      this.request<SagaStatus>(`/orders/saga/${sagaId}/status`),
  };

  // Payments APIs
  payments = {
    create: (data: CreatePaymentData) => 
      this.request<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (paymentId: string) => 
      this.request<Payment>(`/payments/${paymentId}`),

    getByOrderId: (orderId: string) => 
      this.request<Payment[]>(`/payments/order/${orderId}`),

    refund: (paymentId: string, data: RefundData) => 
      this.request<RefundResponse>(`/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProviders: () => 
      this.request<PaymentProvider[]>('/payments/providers/list'),

    getProviderCapabilities: (provider: string) => 
      this.request<ProviderCapabilities>(`/payments/providers/${provider}/capabilities`),
  };

  // Notifications APIs
  notifications = {
    send: (data: SendNotificationData) => 
      this.request<void>('/notifications/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    sendEmail: (data: SendEmailData) => 
      this.request<void>('/notifications/email/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    resendTickets: (orderId: string) => 
      this.request<void>(`/notifications/resend/${orderId}/tickets`, {
        method: 'POST',
      }),
  };
}

// Type definitions based on your backend
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'organizer' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venueId: string;
  venue: Venue;
  categoryId: string;
  category: Category;
  organizerId: string;
  organizer: User;
  ticketTypes: TicketType[];
  imageUrl?: string;
  images?: string[];
  status: 'draft' | 'published' | 'cancelled';
  maxAttendees?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  description?: string;
  capacity?: number;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  facilities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  maxPerOrder?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  benefits?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  ticketTypeId: string;
  ticketType: TicketType;
  eventId: string;
  event: Event;
  userId: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled' | 'expired';
  usedAt?: string;
  seatInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  ticketTypeId: string;
  ticketType: TicketType;
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
  reservedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  totalAmount: number;
  serviceFee: number;
  discount: number;
  items: OrderItem[];
  payments: Payment[];
  sagaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  ticketType: TicketType;
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
  tickets: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'mpesa' | 'flutterwave';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SagaStatus {
  sagaId: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed' | 'compensating';
  steps: SagaStep[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SagaStep {
  name: string;
  status: 'pending' | 'completed' | 'failed' | 'compensated';
  error?: string;
  timestamp: string;
}

// Request/Response types
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface EventFilters {
  category?: string;
  location?: string;
  dateRange?: string;
  priceRange?: string;
  search?: string;
  sortBy?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  longDescription?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venueId: string;
  categoryId: string;
  maxAttendees?: number;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
}

export interface PurchaseTicketData {
  ticketTypeId: string;
  quantity: number;
  paymentMethod: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface ReserveTicketData {
  ticketTypeId: string;
  quantity: number;
  expiresInMinutes?: number;
}

export interface AddToCartData {
  ticketTypeId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface CreateOrderData {
  cartId?: string;
  items?: {
    ticketTypeId: string;
    quantity: number;
  }[];
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  promoCode?: string;
}

export interface CheckoutData {
  orderId: string;
  paymentMethod: 'stripe' | 'mpesa' | 'flutterwave';
  paymentData: Record<string, any>;
}

export interface CreatePaymentData {
  orderId: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'mpesa' | 'flutterwave';
  paymentMethod: string;
  metadata?: Record<string, any>;
}

export interface RefundData {
  amount?: number;
  reason?: string;
}

// Response types
export interface PurchaseResponse {
  order: Order;
  payment: Payment;
  tickets: Ticket[];
}

export interface ReservationResponse {
  reservationId: string;
  expiresAt: string;
  reserved: boolean;
}

export interface CheckoutResponse {
  order: Order;
  payment: Payment;
  sagaId: string;
}

export interface AvailabilityResponse {
  ticketTypeId: string;
  available: number;
  total: number;
  reserved: number;
}

export interface EventInventory {
  eventId: string;
  ticketTypes: Array<{
    ticketTypeId: string;
    available: number;
    total: number;
    reserved: number;
  }>;
}

export interface PaymentProvider {
  name: string;
  id: string;
  displayName: string;
  supportedMethods: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  available: boolean;
}

export interface ProviderCapabilities {
  provider: string;
  methods: string[];
  currencies: string[];
  features: string[];
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  estimatedCompletion?: string;
}

// Additional interfaces for inventory management
export interface ReserveInventoryData {
  ticketTypeId: string;
  quantity: number;
  userId: string;
  expiresInMinutes?: number;
}

export interface ReleaseInventoryData {
  reservationId: string;
}

export interface ConfirmInventoryData {
  reservationId: string;
  orderId: string;
}

export interface SendNotificationData {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  template: string;
  data: Record<string, any>;
}

export interface SendEmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create and export the API client instance
export const api = new APIClient();
export default api;