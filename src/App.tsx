import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import {
  PRODUCTS,
  INITIAL_MEMBERS,
  INITIAL_ORDERS,
  REWARD_OPTIONS,
  HERO_IMAGE,
  Product,
  ProductCategory,
  CustomerMember,
  RewardOption,
  BonusChallenge,
  OrderRecord,
  getMemberTier,
} from './data/roasteryData';
import { ResilientImage } from './components/ResilientImage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LoyaltySection } from './components/LoyaltySection';
import { CartCheckoutDrawer, CartItem } from './components/CartCheckoutDrawer';

const STORAGE_KEYS = {
  MEMBERS: 'vespera_roasters_members_v1',
  ACTIVE_MEMBER_ID: 'vespera_roasters_active_member_v1',
  CART: 'vespera_roasters_cart_v1',
  ORDERS: 'vespera_roasters_orders_v1',
  SELECTED_REWARD_ID: 'vespera_roasters_reward_v1',
};

export default function App() {
  // Persistent State initialization
  const [members, setMembers] = useState<CustomerMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER_ID) || INITIAL_MEMBERS[0].id;
    } catch {
      return INITIAL_MEMBERS[0].id;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        key: `${PRODUCTS[0].id}__Whole Bean__onetime`,
        product: PRODUCTS[0],
        variant: 'Whole Bean',
        isSubscription: false,
        quantity: 1,
      },
    ];
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_REWARD_ID) || null;
    } catch {
      return null;
    }
  });

  // Storefront Filter & Search State
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Active PDP Modal & Cart Drawer State
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  // Order Lookup State
  const [orderLookupQuery, setOrderLookupQuery] = useState<string>('');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch {
      // ignore storage errors
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, activeMemberId);
    } catch {
      // ignore
    }
  }, [activeMemberId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (selectedRewardId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_REWARD_ID, selectedRewardId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_REWARD_ID);
      }
    } catch {
      // ignore
    }
  }, [selectedRewardId]);

  const activeMember = useMemo(
    () => members.find((m) => m.id === activeMemberId) || members[0],
    [members, activeMemberId]
  );

  const activeTier = useMemo(
    () => getMemberTier(activeMember.lifetimePoints),
    [activeMember]
  );

  const selectedReward = useMemo(
    () => REWARD_OPTIONS.find((r) => r.id === selectedRewardId) || null,
    [selectedRewardId]
  );

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.origin.toLowerCase().includes(q) ||
        product.tastingNotes.some((n) => n.toLowerCase().includes(q)) ||
        product.process.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [categoryFilter, searchQuery, sortBy]);

  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    variant: string,
    isSubscription: boolean,
    quantity: number
  ) => {
    const key = `${product.id}__${variant}__${isSubscription ? 'sub' : 'onetime'}`;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === key);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { key, product, variant, isSubscription, quantity }];
    });
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart(product, product.variants[0], false, 1);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1200);
  };

  const handleUpdateCartQuantity = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  // Loyalty Handlers
  const handleCreateMember = (name: string, email: string) => {
    const newId = `member-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const newMember: CustomerMember = {
      id: newId,
      name,
      email,
      memberSince: 'September 2026',
      pointsBalance: 150,
      lifetimePoints: 150,
      completedBonusIds: [],
      transactions: [
        {
          id: `tx-${Date.now()}`,
          date: today,
          reference: 'Welcome #WL-150',
          description: 'Vespera Apothecary Society Enrollment Grant',
          pointsDelta: 150,
          type: 'bonus',
        },
      ],
    };
    setMembers((prev) => [newMember, ...prev]);
    setActiveMemberId(newId);
    setSelectedRewardId(null);
  };

  const handleCompleteBonusChallenge = (
    challenge: BonusChallenge,
    inputVal: string
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== activeMember.id) return m;
        if (m.completedBonusIds.includes(challenge.id)) return m;
        return {
          ...m,
          pointsBalance: m.pointsBalance + challenge.pointsReward,
          lifetimePoints: m.lifetimePoints + challenge.pointsReward,
          completedBonusIds: [...m.completedBonusIds, challenge.id],
          transactions: [
            {
              id: `tx-${Date.now()}`,
              date: today,
              reference: `Verified (${inputVal})`,
              description: challenge.title,
              pointsDelta: challenge.pointsReward,
              type: 'bonus',
            },
            ...m.transactions,
          ],
        };
      })
    );
  };

  const handleCompleteOrder = (orderData: {
    shippingAddress: string;
    paymentMethod: string;
    subtotal: number;
    discountApplied: number;
    appliedReward: RewardOption | null;
    shippingCost: number;
    total: number;
    pointsEarned: number;
  }): OrderRecord => {
    const orderNumber = `VR-${Math.floor(1045 + orders.length * 7)}`;
    const today = new Date().toISOString().slice(0, 10);
    const pointsRedeemed = orderData.appliedReward
      ? orderData.appliedReward.pointsCost
      : 0;

    const newOrder: OrderRecord = {
      id: orderNumber,
      date: today,
      customerName: activeMember.name,
      memberId: activeMember.id,
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        variant: c.variant,
        isSubscription: c.isSubscription,
        quantity: c.quantity,
        unitPrice: c.isSubscription
          ? Number((c.product.price * 0.9).toFixed(2))
          : c.product.price,
      })),
      subtotal: orderData.subtotal,
      discountApplied: orderData.discountApplied,
      appliedRewardTitle: orderData.appliedReward?.title,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      pointsEarned: orderData.pointsEarned,
      pointsRedeemed,
      status: 'Confirmed — Preparing Micro-Lot Roast',
      shippingAddress: orderData.shippingAddress,
    };

    // Update member balance and append ledger transactions
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== activeMember.id) return m;
        const newTxs = [...m.transactions];
        if (orderData.appliedReward && pointsRedeemed > 0) {
          newTxs.unshift({
            id: `tx-redeem-${Date.now()}`,
            date: today,
            reference: `Order #${orderNumber}`,
            description: `Redeemed ${orderData.appliedReward.title}`,
            pointsDelta: -pointsRedeemed,
            type: 'redeemed',
          });
        }
        newTxs.unshift({
          id: `tx-earn-${Date.now() + 1}`,
          date: today,
          reference: `Order #${orderNumber}`,
          description: `Roastery Dispatch (${cart
            .map((i) => `${i.quantity}× ${i.product.name}`)
            .join(', ')})`,
          pointsDelta: orderData.pointsEarned,
          type: 'earned',
        });

        return {
          ...m,
          pointsBalance: m.pointsBalance - pointsRedeemed + orderData.pointsEarned,
          lifetimePoints: m.lifetimePoints + orderData.pointsEarned,
          transactions: newTxs,
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setSelectedRewardId(null);
    return newOrder;
  };

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredOrders = useMemo(() => {
    const q = orderLookupQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
    );
  }, [orders, orderLookupQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111315]">
      {/* Top Bar Contract: Strictly 1 row, 3 zones (Brand Wordmark — 4 Nav Links — 2 Primary Actions) */}
      <header className="sticky top-0 z-40 bg-[#F8F9FA]/95 backdrop-blur-xs border-b border-zinc-200/80">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-2xl font-semibold tracking-tight text-zinc-950 whitespace-nowrap shrink-0"
          >
            Vespera Roasters
          </a>

          {/* Zone 2: 4 clean text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-600"
          >
            <a
              href="#storefront"
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Storefront
            </a>
            <a
              href="#rewards-ledger"
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Rewards Ledger
            </a>
            <a
              href="#craftsmanship"
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Roastery Story
            </a>
            <a
              href="#order-lookup"
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Order Lookup
            </a>
          </nav>

          {/* Zone 3: 2 primary actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#rewards-ledger"
              className="px-3 py-2 text-xs font-mono tabular-nums font-medium text-zinc-800 bg-white border border-zinc-200/90 rounded-lg hover:border-zinc-300 transition-colors whitespace-nowrap"
            >
              {activeMember.pointsBalance.toLocaleString()} pts · {activeTier.shortName}
            </a>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-[#14532D] hover:bg-[#0f3f22] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">Bag ({totalBagCount})</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* SECTION 1: Storefront Hero (Split-Screen Architectural Campaign Showcase) */}
        <section className="border-b border-zinc-200/80 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left 6 Columns: Editorial Narrative & Single Dominant CTA */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs text-zinc-500">
                  <span>Autumn 2026 Micro-Lot Allocation</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>Portland & Kyoto Roasteries</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-[#14532D] font-medium">
                    Earn up to 20 pts / $1
                  </span>
                </div>

                <h1
                  className="font-display text-4xl sm:text-5xl lg:text-[54px] font-semibold text-zinc-950 leading-[1.08] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  High-Altitude Cultivars, Roasted to Architectural Precision.
                </h1>

                <p className="text-base text-zinc-600 leading-relaxed max-w-[62ch]">
                  We source single-estate heirloom lots above 1,800 meters and roast in small convective batches every Tuesday and Friday. Members earn redeemable Roast Points on every bag, canister return, and bi-weekly dispatch.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="#storefront"
                    className="px-6 py-3 rounded-lg bg-[#14532D] hover:bg-[#0f3f22] text-white text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Explore Autumn Releases</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#rewards-ledger"
                    className="px-5 py-3 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Redeem Member Points ({activeMember.pointsBalance} pts)
                  </a>
                </div>

                {/* Unboxed Key Specifications */}
                <div className="pt-6 border-t border-zinc-200/80 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-mono tabular-nums text-base font-semibold text-zinc-950">
                      88.5+ SCA
                    </div>
                    <div className="text-zinc-500 mt-0.5">Minimum Cupping Score</div>
                  </div>
                  <div>
                    <div className="font-mono tabular-nums text-base font-semibold text-zinc-950">
                      Within 24h
                    </div>
                    <div className="text-zinc-500 mt-0.5">Roast-to-Courier Window</div>
                  </div>
                  <div>
                    <div className="font-mono tabular-nums text-base font-semibold text-[#14532D]">
                      $5 – $35 Off
                    </div>
                    <div className="text-zinc-500 mt-0.5">Instant Loyalty Vouchers</div>
                  </div>
                </div>
              </div>

              {/* Right 6 Columns: 16:9 Architectural Hero Photography with Measured Scrim */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/80 shadow-sm">
                  <ResilientImage
                    src={HERO_IMAGE}
                    alt="Precision brass and glass pour-over brewer on dark slate counter at Vespera Roasters"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6">
                    <div className="text-xs text-zinc-300">
                      <span>Featured Allocation</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Lot #ET-2026-04</span>
                    </div>
                    <div className="mt-1 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl font-semibold text-white">
                          Ethiopia Worka Sakaro — 72h Anaerobic Washed
                        </p>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          Bergamot Blossom · White Peach · Candied Lemon Peel
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveProductModal(PRODUCTS[0])}
                        className="px-3.5 py-2 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Inspect Lot — $26.00
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Featured Collection Grid (3-Column Storefront) */}
        <section id="storefront" className="py-16 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200/80">
              <div>
                <div className="text-xs text-zinc-500">
                  <span>01. Roastery Storefront</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>Whole Bean, Custom Burr Grinds & Slow-Drip Elixirs</span>
                </div>
                <h2
                  className="font-display text-3xl sm:text-4xl font-semibold text-zinc-950 mt-1 tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Current Harvest & Pouring Hardware
                </h2>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search origin, note, process..."
                    aria-label="Search coffee releases"
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-2 focus:outline-[#14532D] w-56"
                  />
                </div>

                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
                  }
                  className="px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-700 focus:outline-2 focus:outline-[#14532D]"
                >
                  <option value="featured">Sort: Roaster Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Interactive Category Filter Bar (Functional Segmented Buttons) */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="Product category filter"
                className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
              >
                {(
                  [
                    { id: 'all', label: 'All Releases' },
                    { id: 'beans', label: 'Single-Origin Beans' },
                    { id: 'elixirs', label: 'Cold Brew & Elixirs' },
                    { id: 'hardware', label: 'Brewing Hardware' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={categoryFilter === tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      categoryFilter === tab.id
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-zinc-500 font-mono tabular-nums">
                Showing {filteredProducts.length} of {PRODUCTS.length} releases ·{' '}
                {activeTier.pointsPerDollar} pts/$1 active rate
              </div>
            </div>

            {/* 3-Column Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="mt-8 bg-white rounded-xl border border-zinc-200/80 p-12 text-center space-y-3">
                <p className="font-display text-2xl text-zinc-900">
                  No releases match “{searchQuery}”
                </p>
                <p className="text-xs text-zinc-500">
                  Try clearing your search filter or switching product categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Reset Storefront Filters
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredProducts.map((product) => {
                  const ptsEarned = Math.round(product.price * activeTier.pointsPerDollar);
                  const isQuickAdded = quickAddedId === product.id;

                  return (
                    <article
                      key={product.id}
                      onClick={() => setActiveProductModal(product)}
                      className="group bg-white rounded-xl border border-zinc-200/80 overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    >
                      <div>
                        {/* 4:3 Product Image Container */}
                        <div className="aspect-[4/3] w-full bg-[#F1F3F5] overflow-hidden border-b border-zinc-100">
                          <ResilientImage
                            src={product.image}
                            alt={product.name}
                            fallbackLabel={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>

                        {/* Card Body: Unboxed Metadata with · Separators */}
                        <div className="p-6">
                          <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                            <span className="truncate">
                              {product.categoryLabel} · {product.roastLevel}
                            </span>
                            <span className="font-mono tabular-nums text-[#14532D] font-medium shrink-0">
                              +{ptsEarned} pts
                            </span>
                          </div>

                          <h3 className="font-display text-2xl font-semibold text-zinc-950 mt-1.5 tracking-tight">
                            {product.name}
                          </h3>

                          <p className="text-xs text-zinc-500 mt-0.5">
                            {product.origin} · {product.elevation}
                          </p>

                          {/* Unboxed Tasting Notes */}
                          <div className="mt-3 text-xs text-zinc-700">
                            {product.tastingNotes.map((note, idx) => (
                              <React.Fragment key={note}>
                                <span>{note}</span>
                                {idx < product.tastingNotes.length - 1 && (
                                  <span className="mx-1.5 text-zinc-300" aria-hidden="true">
                                    ·
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Tabular Price & Actions */}
                      <div className="px-6 pb-6 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-mono tabular-nums text-base font-semibold text-zinc-950">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-zinc-400 block">
                            {product.weightOrVolume}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProductModal(product);
                            }}
                            className="px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Customize
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(product, e)}
                            className="px-3.5 py-2 rounded-lg bg-[#14532D] hover:bg-[#0f3f22] text-white text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            {isQuickAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <span>Quick Add</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: Loyalty Rewards Program & Member Ledger */}
        <LoyaltySection
          members={members}
          activeMember={activeMember}
          onSelectMember={(id) => {
            setActiveMemberId(id);
            setSelectedRewardId(null);
          }}
          onCreateMember={handleCreateMember}
          selectedRewardId={selectedRewardId}
          onSelectRewardForCart={(reward) => {
            setSelectedRewardId(reward ? reward.id : null);
          }}
          onCompleteBonusChallenge={handleCompleteBonusChallenge}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* SECTION 4: Roastery Craftsmanship, Quantitative Proof & Order Verification Lookup */}
        <section id="craftsmanship" className="py-16 sm:py-20 border-t border-zinc-200/80 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Craftsmanship + Claim-to-Proof Adjacency */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs text-zinc-500">
                  <span>03. Direct-Trade Transparency & Calorimetry</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>2026 Harvest Report</span>
                </div>
                <h2
                  className="font-display text-3xl sm:text-4xl font-semibold text-zinc-950 tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Farm-Gate Compensation Paired with Convective Roast Telemetry
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed max-w-[65ch]">
                  Every micro-lot in the Vespera archive is contracted directly with producer cooperatives in Gedeb, Valle del Cauca, Huehuetenango, and Kirinyaga. By eliminating secondary commodity brokers and returning reusable steel canisters through our loyalty program, we fund wet-mill fermentation upgrades at origin.
                </p>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-zinc-200/80">
                  <div>
                    <div className="font-mono tabular-nums text-2xl font-semibold text-zinc-950">
                      +310% Above C-Price
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Verified farm-gate price paid across 14 partner washing stations in 2025–2026.
                    </div>
                  </div>
                  <div>
                    <div className="font-mono tabular-nums text-2xl font-semibold text-zinc-950">
                      4,820 Canisters
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Closed-loop steel canisters returned & sanitized by loyalty members in 12 months.
                    </div>
                  </div>
                  <div>
                    <div className="font-mono tabular-nums text-2xl font-semibold text-[#14532D]">
                      99.4% Lot Traceability
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Every bag stamped with harvest elevation, fermentation hours, and roast date.
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributable Testimonial Card */}
              <blockquote className="lg:col-span-5 bg-[#F8F9FA] p-6 sm:p-8 rounded-xl border border-zinc-200/80 flex flex-col justify-between">
                <p className="font-display text-xl sm:text-2xl italic text-zinc-900 leading-relaxed">
                  “Switching our tasting room program to Vespera’s anaerobic Gedeb and Valle del Cauca lots cut dial-in waste by 28% while our guests immediately noticed the jasmine clarity. Their canister return loyalty credits now fund our entire cold-brew program.”
                </p>
                <footer className="mt-6 pt-4 border-t border-zinc-200/70 text-xs">
                  <div className="font-semibold text-zinc-950">Soren Lindqvist</div>
                  <div className="text-zinc-500 mt-0.5">
                    Beverage Director, Restaurant Kaskad (Portland, OR) · Gold Connoisseur Member
                  </div>
                </footer>
              </blockquote>
            </div>

            {/* Order Lookup & Post-Order Verification Table */}
            <div id="order-lookup" className="pt-12 border-t border-zinc-200/80">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs text-zinc-500">
                    <span>04. Roastery Dispatch Verification</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>Live Order & Points Accrual Log</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-950 mt-1">
                    Recent Roastery Dispatches
                  </h3>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={orderLookupQuery}
                    onChange={(e) => setOrderLookupQuery(e.target.value)}
                    placeholder="Lookup Order # (e.g. VR-1039)..."
                    aria-label="Lookup order by ID or customer name"
                    className="pl-8 pr-3 py-2 text-xs bg-[#F8F9FA] border border-zinc-200 rounded-lg text-zinc-900 w-64 focus:bg-white focus:outline-2 focus:outline-[#14532D]"
                  />
                </div>
              </div>

              <div className="bg-[#F8F9FA] rounded-xl border border-zinc-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200/80 text-xs text-zinc-500 bg-zinc-100/70">
                        <th className="py-3.5 px-6 font-medium">Order ID</th>
                        <th className="py-3.5 px-6 font-medium">Date</th>
                        <th className="py-3.5 px-6 font-medium">Member</th>
                        <th className="py-3.5 px-6 font-medium">Items & Grind</th>
                        <th className="py-3.5 px-6 font-medium">Status</th>
                        <th className="py-3.5 px-6 font-medium text-right">Total & Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 text-xs">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="bg-white hover:bg-zinc-50/80 transition-colors">
                          <td className="py-4 px-6 font-mono tabular-nums font-semibold text-zinc-950 whitespace-nowrap">
                            #{order.id}
                          </td>
                          <td className="py-4 px-6 font-mono tabular-nums text-zinc-500 whitespace-nowrap">
                            {order.date}
                          </td>
                          <td className="py-4 px-6 font-medium text-zinc-900 whitespace-nowrap">
                            {order.customerName}
                          </td>
                          <td className="py-4 px-6 text-zinc-600">
                            {order.items
                              .map(
                                (i) =>
                                  `${i.quantity}× ${i.productName} (${i.variant}${
                                    i.isSubscription ? ' · Sub' : ''
                                  })`
                              )
                              .join(', ')}
                          </td>
                          <td className="py-4 px-6 text-zinc-800 whitespace-nowrap">
                            {order.status}
                          </td>
                          <td className="py-4 px-6 font-mono tabular-nums text-right whitespace-nowrap">
                            <span className="font-semibold text-zinc-950">
                              ${order.total.toFixed(2)}
                            </span>
                            <span className="mx-1.5 text-zinc-300" aria-hidden="true">·</span>
                            <span className="text-[#14532D] font-medium">
                              +{order.pointsEarned} pts
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Quiet Footer */}
      <footer className="bg-[#F1F3F5] border-t border-zinc-200/80 py-12 text-xs text-zinc-500">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="font-display text-lg font-semibold text-zinc-900">
              Vespera Roasters & Apothecary
            </div>
            <p>
              412 NW Couch Street, Portland, OR · Open Daily 07:00 – 17:00 · Single-Origin Micro-Lots Roasted Tue & Fri
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#storefront" className="hover:text-zinc-900 transition-colors">
              Storefront
            </a>
            <a href="#rewards-ledger" className="hover:text-zinc-900 transition-colors">
              Loyalty Program
            </a>
            <a href="#order-lookup" className="hover:text-zinc-900 transition-colors">
              Order Lookup
            </a>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Contiguous Purchase Module Modal */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        pointsPerDollar={activeTier.pointsPerDollar}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-Over Cart & Loyalty Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        activeMember={activeMember}
        selectedReward={selectedReward}
        onSelectReward={(reward) => setSelectedRewardId(reward ? reward.id : null)}
        onCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
}
