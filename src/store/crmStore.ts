import { create } from 'zustand';
import { api } from '../lib/api';

export interface CustomerRestaurantProfile {
  id: string;
  customerId: string;
  restaurantId: string;
  totalSpend: number;
  totalOrders: number;
  aov: number;
  ltv: number;
  firstVisit: string;
  lastVisit: string;
  visitFrequency: number;
  repeatStatus: string;
  churnProbability: number;
  predictedLtv: number;
  healthScore: number;
  engagementScore: number;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  userId: string;
  noteText: string;
  isSystem: boolean;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface Customer {
  id: string;
  brandId: string;
  name: string;
  phone: string;
  email: string | null;
  acquisitionSource: string;
  metadataJson: any;
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
  profiles: CustomerRestaurantProfile[];
  notes?: CustomerNote[];
}

export interface TimelineEvent {
  id: string;
  type: 'ORDER' | 'NOTE' | 'REGISTRATION' | 'LOYALTY';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface LoyaltyTier {
  id: string;
  brandId: string;
  name: string;
  minSpend: number;
  multiplier: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  brandId: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface SegmentCriteria {
  minSpend?: number;
  minOrders?: number;
  lastVisitDaysAgo?: number;
  visitedWithinDays?: number;
  dietary?: string;
  seating?: string;
}

export interface Segment {
  id: string;
  brandId: string;
  name: string;
  description: string | null;
  criteriaJson: SegmentCriteria;
  createdAt: string;
  _count?: {
    customers: number;
  };
}

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  segmentId: string | null;
  templateSubject: string | null;
  templateBody: string;
  status: 'DRAFT' | 'QUEUED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  scheduledAt: string;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  segment?: {
    name: string;
  } | null;
}

export interface Ticket {
  id: string;
  brandId: string;
  feedbackId: string | null;
  customerId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedUserId: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    phone: string;
  } | null;
  feedback?: {
    rating: number;
    comments: string | null;
  } | null;
  assignedUser?: {
    name: string;
  } | null;
}

interface CRMState {
  customers: Customer[];
  total: number;
  loading: boolean;
  error: string | null;
  search: string;
  restaurantId: string;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentCustomer: Customer | null;
  currentCustomerLoading: boolean;
  timeline: TimelineEvent[];
  timelineLoading: boolean;
  
  // Loyalty states
  loyaltyTiers: LoyaltyTier[];
  loyaltyTiersLoading: boolean;

  // Coupon states
  coupons: Coupon[];
  couponsLoading: boolean;

  // Segment states
  segments: Segment[];
  segmentsLoading: boolean;

  // Campaign states
  campaigns: Campaign[];
  campaignsLoading: boolean;

  // Ticket states
  tickets: Ticket[];
  ticketsLoading: boolean;

  setSearch: (search: string) => void;
  setRestaurantId: (restaurantId: string) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setPagination: (limit: number, offset: number) => void;
  fetchCustomers: () => Promise<void>;
  fetchCustomerById: (id: string) => Promise<void>;
  fetchTimeline: (id: string) => Promise<void>;
  updateCustomer: (id: string, data: { name?: string; email?: string | null; phone?: string }) => Promise<void>;
  addCustomerNote: (id: string, noteText: string) => Promise<void>;
  
  // Loyalty actions
  fetchLoyaltyTiers: () => Promise<void>;
  upsertLoyaltyTier: (data: { id?: string; name: string; minSpend: number; multiplier: number }) => Promise<void>;
  deleteLoyaltyTier: (id: string) => Promise<void>;

  // Coupon actions
  fetchCoupons: () => Promise<void>;
  createCoupon: (data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number | null;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Segment actions
  fetchSegments: () => Promise<void>;
  createSegment: (data: {
    name: string;
    description: string | null;
    criteria: SegmentCriteria;
  }) => Promise<void>;
  deleteSegment: (id: string) => Promise<void>;
  retraceSegment: (id: string) => Promise<number>;
  fetchSegmentMembers: (id: string) => Promise<Customer[]>;

  // Campaign actions
  fetchCampaigns: () => Promise<void>;
  createCampaign: (data: {
    name: string;
    channel: 'SMS' | 'EMAIL' | 'PUSH';
    segmentId: string | null;
    templateSubject: string | null;
    templateBody: string;
    scheduledAt: string;
  }) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  fetchCampaignLogs: (id: string) => Promise<any[]>;

  // Ticket actions
  fetchTickets: () => Promise<void>;
  updateTicketStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => Promise<void>;
  
  clearError: () => void;
}

export const useCRMStore = create<CRMState>((set, get) => ({
  customers: [],
  total: 0,
  loading: false,
  error: null,
  search: '',
  restaurantId: '',
  limit: 20,
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentCustomer: null,
  currentCustomerLoading: false,
  timeline: [],
  timelineLoading: false,
  
  loyaltyTiers: [],
  loyaltyTiersLoading: false,

  coupons: [],
  couponsLoading: false,

  segments: [],
  segmentsLoading: false,

  campaigns: [],
  campaignsLoading: false,

  tickets: [],
  ticketsLoading: false,

  setSearch: (search) => {
    set({ search, offset: 0 });
    get().fetchCustomers();
  },

  setRestaurantId: (restaurantId) => {
    set({ restaurantId, offset: 0 });
    get().fetchCustomers();
  },

  setSort: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder });
    get().fetchCustomers();
  },

  setPagination: (limit, offset) => {
    set({ limit, offset });
    get().fetchCustomers();
  },

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const { search, restaurantId, limit, offset, sortBy, sortOrder } = get();
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (restaurantId) params.append('restaurantId', restaurantId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/crm/customers?${params.toString()}`);
      set({ customers: response.customers, total: response.total, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerById: async (id) => {
    set({ currentCustomerLoading: true, error: null });
    try {
      const response = await api.get(`/crm/customers/${id}`);
      set({ currentCustomer: response.customer, currentCustomerLoading: false });
    } catch (err: any) {
      set({ error: err.message, currentCustomerLoading: false });
    }
  },

  fetchTimeline: async (id) => {
    set({ timelineLoading: true, error: null });
    try {
      const response = await api.get(`/crm/customers/${id}/timeline`);
      set({ timeline: response.timeline, timelineLoading: false });
    } catch (err: any) {
      set({ error: err.message, timelineLoading: false });
    }
  },

  updateCustomer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/crm/customers/${id}`, data);
      
      const updatedCustomers = get().customers.map((c) =>
        c.id === id ? { ...c, ...response.customer } : c
      );
      
      const current = get().currentCustomer;
      const updatedCurrent = current && current.id === id ? { ...current, ...response.customer } : current;

      set({ customers: updatedCustomers, currentCustomer: updatedCurrent, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addCustomerNote: async (id, noteText) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/crm/customers/${id}/notes`, { noteText });
      
      const current = get().currentCustomer;
      if (current && current.id === id) {
        const updatedNotes = [response.note, ...(current.notes || [])];
        set({ currentCustomer: { ...current, notes: updatedNotes } });
      }

      get().fetchTimeline(id);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Loyalty actions
  fetchLoyaltyTiers: async () => {
    set({ loyaltyTiersLoading: true, error: null });
    try {
      const response = await api.get('/crm/loyalty/tiers');
      set({ loyaltyTiers: response.tiers, loyaltyTiersLoading: false });
    } catch (err: any) {
      set({ error: err.message, loyaltyTiersLoading: false });
    }
  },

  upsertLoyaltyTier: async (data) => {
    set({ loading: true, error: null });
    try {
      if (data.id) {
        await api.put(`/crm/loyalty/tiers/${data.id}`, {
          name: data.name,
          minSpend: data.minSpend,
          multiplier: data.multiplier,
        });
      } else {
        await api.post('/crm/loyalty/tiers', {
          name: data.name,
          minSpend: data.minSpend,
          multiplier: data.multiplier,
        });
      }
      await get().fetchLoyaltyTiers();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteLoyaltyTier: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/loyalty/tiers/${id}`);
      await get().fetchLoyaltyTiers();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Coupon actions
  fetchCoupons: async () => {
    set({ couponsLoading: true, error: null });
    try {
      const response = await api.get('/crm/coupons');
      set({ coupons: response.coupons, couponsLoading: false });
    } catch (err: any) {
      set({ error: err.message, couponsLoading: false });
    }
  },

  createCoupon: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post('/crm/coupons', data);
      await get().fetchCoupons();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteCoupon: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/coupons/${id}`);
      await get().fetchCoupons();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Segment actions
  fetchSegments: async () => {
    set({ segmentsLoading: true, error: null });
    try {
      const response = await api.get('/crm/segments');
      set({ segments: response.segments, segmentsLoading: false });
    } catch (err: any) {
      set({ error: err.message, segmentsLoading: false });
    }
  },

  createSegment: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post('/crm/segments', data);
      await get().fetchSegments();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteSegment: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/segments/${id}`);
      await get().fetchSegments();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  retraceSegment: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/crm/segments/${id}/retrace`);
      await get().fetchSegments();
      set({ loading: false });
      return response.size;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchSegmentMembers: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/crm/segments/${id}/members`);
      set({ loading: false });
      return response.members;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Campaign actions
  fetchCampaigns: async () => {
    set({ campaignsLoading: true, error: null });
    try {
      const response = await api.get('/crm/campaigns');
      set({ campaigns: response.campaigns, campaignsLoading: false });
    } catch (err: any) {
      set({ error: err.message, campaignsLoading: false });
    }
  },

  createCampaign: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post('/crm/campaigns', data);
      await get().fetchCampaigns();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteCampaign: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/campaigns/${id}`);
      await get().fetchCampaigns();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchCampaignLogs: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/crm/campaigns/${id}/logs`);
      set({ loading: false });
      return response.logs;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Ticket actions implementation
  fetchTickets: async () => {
    set({ ticketsLoading: true, error: null });
    try {
      const response = await api.get('/crm/feedback/tickets');
      set({ tickets: response.tickets, ticketsLoading: false });
    } catch (err: any) {
      set({ error: err.message, ticketsLoading: false });
    }
  },

  updateTicketStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/crm/feedback/tickets/${id}`, { status });
      await get().fetchTickets();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
