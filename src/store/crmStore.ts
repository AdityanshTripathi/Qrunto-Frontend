import { create } from 'zustand';
import { api } from '../lib/api';
import { registerSessionTeardown } from '../lib/session-lifecycle';

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

export interface CampaignLog {
  id: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  errorDetails?: string | null;
  customer?: {
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

interface CursorPagination {
  nextCursor: string | null;
  hasMore: boolean;
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
  campaignsPagination: CursorPagination;
  campaignLogsPagination: CursorPagination;

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
  fetchCampaigns: (cursor?: string) => Promise<void>;
  createCampaign: (data: {
    name: string;
    channel: 'SMS' | 'EMAIL' | 'PUSH';
    segmentId: string | null;
    templateSubject: string | null;
    templateBody: string;
    scheduledAt: string;
  }) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  fetchCampaignLogs: (id: string, cursor?: string) => Promise<CampaignLog[]>;

  // Ticket actions
  fetchTickets: () => Promise<void>;
  updateTicketStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => Promise<void>;
  
  clearError: () => void;
  reset: () => void;
}

let crmSessionGeneration = 0;
const isCurrentCRMGeneration = (generation: number) => generation === crmSessionGeneration;

const initialCRMState = () => ({
  customers: [] as Customer[],
  total: 0,
  loading: false,
  error: null as string | null,
  search: '',
  restaurantId: '',
  limit: 20,
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
  currentCustomer: null as Customer | null,
  currentCustomerLoading: false,
  timeline: [] as TimelineEvent[],
  timelineLoading: false,
  loyaltyTiers: [] as LoyaltyTier[],
  loyaltyTiersLoading: false,
  coupons: [] as Coupon[],
  couponsLoading: false,
  segments: [] as Segment[],
  segmentsLoading: false,
  campaigns: [] as Campaign[],
  campaignsLoading: false,
  campaignsPagination: { nextCursor: null, hasMore: false } as CursorPagination,
  campaignLogsPagination: { nextCursor: null, hasMore: false } as CursorPagination,
  tickets: [] as Ticket[],
  ticketsLoading: false,
});

export const useCRMStore = create<CRMState>((set, get) => ({
  ...initialCRMState(),

  setSearch: (search) => {
    set({ search, offset: 0 });
    get().fetchCustomers();
  },

  setRestaurantId: (restaurantId) => {
    const state = get();
    if (state.restaurantId !== restaurantId) {
      crmSessionGeneration += 1;
      set({
        ...initialCRMState(),
        restaurantId,
        search: state.search,
        limit: state.limit,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      });
    } else {
      set({ offset: 0 });
    }
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
    const generation = crmSessionGeneration;
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
      if (!isCurrentCRMGeneration(generation)) return;
      set({ customers: response.customers, total: response.total, loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerById: async (id) => {
    const generation = crmSessionGeneration;
    set({ currentCustomerLoading: true, error: null });
    try {
      const response = await api.get(`/crm/customers/${id}`);
      if (!isCurrentCRMGeneration(generation)) return;
      set({ currentCustomer: response.customer, currentCustomerLoading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, currentCustomerLoading: false });
    }
  },

  fetchTimeline: async (id) => {
    const generation = crmSessionGeneration;
    set({ timelineLoading: true, error: null });
    try {
      const response = await api.get(`/crm/customers/${id}/timeline`);
      if (!isCurrentCRMGeneration(generation)) return;
      set({ timeline: response.timeline, timelineLoading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, timelineLoading: false });
    }
  },

  updateCustomer: async (id, data) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/crm/customers/${id}`, data);
      if (!isCurrentCRMGeneration(generation)) return;
      
      const updatedCustomers = get().customers.map((c) =>
        c.id === id ? { ...c, ...response.customer } : c
      );
      
      const current = get().currentCustomer;
      const updatedCurrent = current && current.id === id ? { ...current, ...response.customer } : current;

      set({ customers: updatedCustomers, currentCustomer: updatedCurrent, loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addCustomerNote: async (id, noteText) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/crm/customers/${id}/notes`, { noteText });
      if (!isCurrentCRMGeneration(generation)) return;
      
      const current = get().currentCustomer;
      if (current && current.id === id) {
        const updatedNotes = [response.note, ...(current.notes || [])];
        set({ currentCustomer: { ...current, notes: updatedNotes } });
      }

      get().fetchTimeline(id);
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Loyalty actions
  fetchLoyaltyTiers: async () => {
    const generation = crmSessionGeneration;
    set({ loyaltyTiersLoading: true, error: null });
    try {
      const response = await api.get('/crm/loyalty/tiers');
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loyaltyTiers: response.tiers, loyaltyTiersLoading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loyaltyTiersLoading: false });
    }
  },

  upsertLoyaltyTier: async (data) => {
    const generation = crmSessionGeneration;
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
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchLoyaltyTiers();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteLoyaltyTier: async (id) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/loyalty/tiers/${id}`);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchLoyaltyTiers();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Coupon actions
  fetchCoupons: async () => {
    const generation = crmSessionGeneration;
    set({ couponsLoading: true, error: null });
    try {
      const response = await api.get('/crm/coupons');
      if (!isCurrentCRMGeneration(generation)) return;
      set({ coupons: response.coupons, couponsLoading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, couponsLoading: false });
    }
  },

  createCoupon: async (data) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.post('/crm/coupons', data);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchCoupons();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteCoupon: async (id) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/coupons/${id}`);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchCoupons();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Segment actions
  fetchSegments: async () => {
    const generation = crmSessionGeneration;
    set({ segmentsLoading: true, error: null });
    try {
      const response = await api.get('/crm/segments');
      if (!isCurrentCRMGeneration(generation)) return;
      set({ segments: response.segments, segmentsLoading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, segmentsLoading: false });
    }
  },

  createSegment: async (data) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.post('/crm/segments', data);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchSegments();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteSegment: async (id) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/segments/${id}`);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchSegments();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  retraceSegment: async (id) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/crm/segments/${id}/retrace`);
      if (!isCurrentCRMGeneration(generation)) return 0;
      await get().fetchSegments();
      if (!isCurrentCRMGeneration(generation)) return 0;
      set({ loading: false });
      return response.size;
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return 0;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchSegmentMembers: async (id) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/crm/segments/${id}/members`);
      if (!isCurrentCRMGeneration(generation)) return [];
      set({ loading: false });
      return response.members;
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return [];
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Campaign actions
  fetchCampaigns: async (cursor) => {
    const generation = crmSessionGeneration;
    set({ campaignsLoading: true, error: null });
    try {
      const path = cursor ? `/crm/campaigns?cursor=${encodeURIComponent(cursor)}` : '/crm/campaigns';
      const response = await api.get(path);
      if (!isCurrentCRMGeneration(generation)) return;
      const nextCampaigns: Campaign[] = response.campaigns || [];
      set((state) => {
        if (!cursor) {
          return {
            campaigns: nextCampaigns,
            campaignsPagination: {
              nextCursor: response.pagination?.nextCursor ?? null,
              hasMore: response.pagination?.hasMore ?? false,
            },
            campaignsLoading: false,
          };
        }
        const existingIds = new Set(state.campaigns.map((campaign) => campaign.id));
        return {
          campaigns: [...state.campaigns, ...nextCampaigns.filter((campaign) => !existingIds.has(campaign.id))],
          campaignsPagination: {
            nextCursor: response.pagination?.nextCursor ?? null,
            hasMore: response.pagination?.hasMore ?? false,
          },
          campaignsLoading: false,
        };
      });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, campaignsLoading: false });
    }
  },

  createCampaign: async (data) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.post('/crm/campaigns', data);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchCampaigns();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteCampaign: async (id) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.delete(`/crm/campaigns/${id}`);
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchCampaigns();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchCampaignLogs: async (id, cursor) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      const path = cursor
        ? `/crm/campaigns/${id}/logs?cursor=${encodeURIComponent(cursor)}`
        : `/crm/campaigns/${id}/logs`;
      const response = await api.get(path);
      if (!isCurrentCRMGeneration(generation)) return [];
      set({
        campaignLogsPagination: {
          nextCursor: response.pagination?.nextCursor ?? null,
          hasMore: response.pagination?.hasMore ?? false,
        },
        loading: false,
      });
      return response.logs || [];
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return [];
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Ticket actions implementation
  fetchTickets: async () => {
    const generation = crmSessionGeneration;
    set({ ticketsLoading: true, error: null });
    try {
      const response = await api.get('/crm/feedback/tickets');
      if (!isCurrentCRMGeneration(generation)) return;
      set({ tickets: response.tickets, ticketsLoading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, ticketsLoading: false });
    }
  },

  updateTicketStatus: async (id, status) => {
    const generation = crmSessionGeneration;
    set({ loading: true, error: null });
    try {
      await api.put(`/crm/feedback/tickets/${id}`, { status });
      if (!isCurrentCRMGeneration(generation)) return;
      await get().fetchTickets();
      if (!isCurrentCRMGeneration(generation)) return;
      set({ loading: false });
    } catch (err: any) {
      if (!isCurrentCRMGeneration(generation)) return;
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => {
    crmSessionGeneration += 1;
    set(initialCRMState());
  },
}));

registerSessionTeardown(() => useCRMStore.getState().reset());
