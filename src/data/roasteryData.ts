export type ProductCategory = 'beans' | 'elixirs' | 'hardware';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  weightOrVolume: string;
  origin: string;
  elevation: string;
  process: string;
  roastLevel: 'Light-Filter' | 'Medium-Omni' | 'Dark-Espresso' | 'Botanical Cold Extraction' | 'Precision Hardware';
  tastingNotes: string[];
  harvestLot: string;
  availability: string;
  description: string;
  brewingRecipe: {
    dose: string;
    waterTemp: string;
    ratio: string;
    bloomTime: string;
  };
  image: string;
  variants: string[];
  featured?: boolean;
}

export interface RewardOption {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  minOrderAmount: number;
  badgeText: string;
  applicableCategory?: ProductCategory | 'all';
}

export interface PointsTransaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  pointsDelta: number;
  type: 'earned' | 'redeemed' | 'bonus';
}

export interface OrderRecord {
  id: string;
  date: string;
  customerName: string;
  memberId: string;
  items: {
    productId: string;
    productName: string;
    variant: string;
    isSubscription: boolean;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  discountApplied: number;
  appliedRewardTitle?: string;
  shippingCost: number;
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  status: 'Confirmed — Preparing Micro-Lot Roast' | 'Roasted & Resting — Out for Courier' | 'Delivered to Porch';
  shippingAddress: string;
}

export interface CustomerMember {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  pointsBalance: number;
  lifetimePoints: number;
  completedBonusIds: string[];
  transactions: PointsTransaction[];
}

export interface BonusChallenge {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  verificationPrompt: string;
  defaultInputPlaceholder: string;
}

export const HERO_IMAGE = '/src/assets/images/hero_roastery_pour_over_1790695948756.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'ethiopia-worka-sakaro',
    name: 'Ethiopia Worka Sakaro',
    subtitle: 'Anaerobic Washed Heirloom · Gedeb District',
    category: 'beans',
    categoryLabel: 'Single-Origin Beans',
    price: 26.00,
    weightOrVolume: '250g Whole / Ground',
    origin: 'Gedeb, Yirgacheffe, Ethiopia',
    elevation: '2,150m ASL',
    process: '72-Hour Anaerobic Washed',
    roastLevel: 'Light-Filter',
    tastingNotes: ['Bergamot Blossom', 'White Peach', 'Candied Lemon Peel'],
    harvestLot: 'Lot #ET-2026-04',
    availability: 'Limited Micro-Lot',
    description:
      'Grown by 42 smallholder farmers surrounding the Worka Sakaro washing station in Gedeb. Cherries undergo a 72-hour sealed fermentation in stainless tanks before slow drying on raised African beds, yielding luminous floral clarity and a silky white-tea finish.',
    brewingRecipe: {
      dose: '18g coffee',
      waterTemp: '94°C (201°F)',
      ratio: '1 : 16.5 (300ml)',
      bloomTime: '45s with 55ml water',
    },
    image: '/src/assets/images/coffee_bag_ethiopia_yirgacheffe_1790695963488.jpg',
    variants: ['Whole Bean', 'Pour-Over (Medium-Fine)', 'Espresso (Fine)', 'Aeropress (Medium)'],
    featured: true,
  },
  {
    id: 'colombia-finca-la-palma',
    name: 'Colombia Cerro Azul Geisha',
    subtitle: 'Lactic Natural Reserve · Valle del Cauca',
    category: 'beans',
    categoryLabel: 'Single-Origin Beans',
    price: 38.00,
    weightOrVolume: '200g Collector Canister',
    origin: 'Trujillo, Valle del Cauca, Colombia',
    elevation: '1,980m ASL',
    process: 'Lactic Natural Fermentation',
    roastLevel: 'Light-Filter',
    tastingNotes: ['Night-Blooming Jasmine', 'Blood Orange', 'Raw Cacao Nibs'],
    harvestLot: 'Lot #CO-2026-01',
    availability: 'Roaster Reserve',
    description:
      'Sealed in nitrogen-flushed matte ultraviolet canisters to preserve volatile aromatics. Cultivated on steep cloud-forest slopes in Valle del Cauca, this Geisha cultivar offers tropical nectar sweetness balanced by crisp citrus acidity.',
    brewingRecipe: {
      dose: '15g coffee',
      waterTemp: '93°C (199°F)',
      ratio: '1 : 17 (255ml)',
      bloomTime: '40s gentle swirl',
    },
    image: '/src/assets/images/coffee_bag_colombia_geisha_1790695978403.jpg',
    variants: ['Whole Bean', 'Pour-Over (Medium-Fine)', 'Cupping Grind (Coarse)'],
    featured: true,
  },
  {
    id: 'kyoto-cold-brew-elixir',
    name: 'Nocturne Slow-Drip Elixir',
    subtitle: '14-Hour Ice-Water Extraction · Single-Origin Concentrate',
    category: 'elixirs',
    categoryLabel: 'Cold Brew & Elixirs',
    price: 22.00,
    weightOrVolume: '500ml Amber Apothecary Bottle',
    origin: 'Huehuetenango, Guatemala & Gedeb Blend',
    elevation: '1,850m ASL',
    process: 'Kyoto Glass Tower Slow-Drip',
    roastLevel: 'Botanical Cold Extraction',
    tastingNotes: ['Dark Cherry', 'Toasted Hazelnut', 'Molasses'],
    harvestLot: 'Batch #EL-089',
    availability: 'In Stock',
    description:
      'Extracted drop by individual drop over 14 hours through hand-blown borosilicate towers using mineral-balanced glacier water. Dilute 1:2 over hand-carved crystal ice or warm gently with oat milk for an effortlessly velvety cup.',
    brewingRecipe: {
      dose: '80ml concentrate',
      waterTemp: '4°C over clear ice',
      ratio: '1 : 2 water or milk',
      bloomTime: 'Ready to pour',
    },
    image: '/src/assets/images/coffee_cold_brew_bottle_1790695990979.jpg',
    variants: ['Single 500ml Bottle', 'Duo Pack (2 × 500ml)', 'Smoked Cardamom Infusion'],
    featured: true,
  },
  {
    id: 'vespera-gooseneck-set',
    name: 'Kurogane Pour-Over Atelier Set',
    subtitle: 'Matte Counterbalanced Kettle & Fluted Porcelain Dripper',
    category: 'hardware',
    categoryLabel: 'Brewing Hardware',
    price: 84.00,
    weightOrVolume: '600ml Kettle + Size 02 Dripper',
    origin: 'Tsubame-Sanjo & Mino, Japan',
    elevation: 'Studio Craft',
    process: 'Hand-Spun 304 Stainless & High-Fire Porcelain',
    roastLevel: 'Precision Hardware',
    tastingNotes: ['Laminar Flow Spout', '20-Rib Thermal Flutes', 'Borosilicate Server'],
    harvestLot: 'Edition #HW-12',
    availability: 'In Stock',
    description:
      'Engineered in Tsubame-Sanjo for micro-millimeter flow rate control. The counterbalanced handle shifts the center of mass toward the wrist, paired with a high-thermal-mass Mino porcelain dripper that prevents temperature drop during extraction.',
    brewingRecipe: {
      dose: '15g – 24g capacity',
      waterTemp: 'Stovetop & Induction safe',
      ratio: 'Laminar 4.5ml/sec flow',
      bloomTime: 'Includes 40 bleached paper filters',
    },
    image: '/src/assets/images/coffee_pour_over_kettle_1790696002793.jpg',
    variants: ['Matte Obsidian + Alabaster Dripper', 'Brushed Steel + Slate Dripper'],
    featured: true,
  },
  {
    id: 'guatemala-el-injerto-pacamara',
    name: 'Guatemala El Injerto Pacamara',
    subtitle: 'Washed Mountain Spring · Huehuetenango',
    category: 'beans',
    categoryLabel: 'Single-Origin Beans',
    price: 29.00,
    weightOrVolume: '250g Whole / Ground',
    origin: 'La Libertad, Huehuetenango, Guatemala',
    elevation: '1,920m ASL',
    process: 'Fully Washed & Patio Sun-Dried',
    roastLevel: 'Medium-Omni',
    tastingNotes: ['Roasted Fig', 'Marzipan', 'Meyer Lemon'],
    harvestLot: 'Lot #GT-2026-09',
    availability: 'In Stock',
    description:
      'An heirloom large-screen Pacamara lot roasted for omni-method versatility. Equally expressive as a syrupy 1:2 espresso shot or a structured Kalita flat-bottom pour-over with lingering almond nougat sweetness.',
    brewingRecipe: {
      dose: '19g coffee',
      waterTemp: '92°C (198°F)',
      ratio: '1 : 16 filter / 1 : 2.2 espresso',
      bloomTime: '35s bloom',
    },
    image: '/src/assets/images/coffee_bag_ethiopia_yirgacheffe_1790695963488.jpg',
    variants: ['Whole Bean', 'Espresso (Fine)', 'Pour-Over (Medium-Fine)', 'French Press (Coarse)'],
    featured: false,
  },
  {
    id: 'kenya-kirinyaga-aa',
    name: 'Kenya Kirinyaga Kainamui AA',
    subtitle: 'Double-Washed SL28 & SL34 · Mount Kenya Slopes',
    category: 'beans',
    categoryLabel: 'Single-Origin Beans',
    price: 32.00,
    weightOrVolume: '200g Collector Canister',
    origin: 'Kirinyaga County, Kenya',
    elevation: '1,800m ASL',
    process: '72-Hour Kenyan Double Fermentation',
    roastLevel: 'Light-Filter',
    tastingNotes: ['Blackcurrant Cordial', 'Pink Grapefruit', 'Cane Sugar'],
    harvestLot: 'Lot #KE-2026-03',
    availability: 'Limited Micro-Lot',
    description:
      'Grown in mineral-rich volcanic red loam on the southern slopes of Mount Kenya. Our light-filter profile preserves the signature Kenyan phosphoric sparkle and deep blackcurrant nectar structure.',
    brewingRecipe: {
      dose: '16g coffee',
      waterTemp: '95°C (203°F)',
      ratio: '1 : 16.5 (265ml)',
      bloomTime: '45s bloom',
    },
    image: '/src/assets/images/coffee_bag_colombia_geisha_1790695978403.jpg',
    variants: ['Whole Bean', 'Pour-Over (Medium-Fine)', 'Aeropress (Medium)'],
    featured: false,
  },
];

export const REWARD_OPTIONS: RewardOption[] = [
  {
    id: 'reward-5-off',
    title: '$5.00 Off Single-Origin Release',
    description: 'Redeemable immediately on any whole bean bag, canister, or cold brew bottle.',
    pointsCost: 250,
    discountAmount: 5.00,
    minOrderAmount: 15.00,
    badgeText: '250 PTS · $5.00 CREDIT',
    applicableCategory: 'all',
  },
  {
    id: 'reward-12-off',
    title: '$12.00 Off Roastery Order',
    description: 'Applies a $12.00 member deduction to any cart subtotal of $25.00 or more.',
    pointsCost: 500,
    discountAmount: 12.00,
    minOrderAmount: 25.00,
    badgeText: '500 PTS · $12.00 CREDIT',
    applicableCategory: 'all',
  },
  {
    id: 'reward-22-elixir',
    title: 'Complimentary Nocturne Elixir ($22 Value)',
    description: 'Deducts the full $22.00 value of a 500ml Slow-Drip Cold Brew Elixir from your order.',
    pointsCost: 800,
    discountAmount: 22.00,
    minOrderAmount: 22.00,
    badgeText: '800 PTS · $22.00 CREDIT',
    applicableCategory: 'all',
  },
  {
    id: 'reward-35-reserve',
    title: '$35.00 Collector Canister & Hardware Credit',
    description: 'Our highest-yield tier voucher for Geisha reserves or Japanese pouring hardware.',
    pointsCost: 1200,
    discountAmount: 35.00,
    minOrderAmount: 38.00,
    badgeText: '1,200 PTS · $35.00 CREDIT',
    applicableCategory: 'all',
  },
];

export const BONUS_CHALLENGES: BonusChallenge[] = [
  {
    id: 'bonus-batch-code',
    title: 'Register Roastery Lot Stamp',
    description: 'Enter the 6-character lot code stamped on your coffee bag valve (e.g., ET-2026-04).',
    pointsReward: 75,
    verificationPrompt: 'Enter Lot Stamp Code',
    defaultInputPlaceholder: 'ET-2026-04',
  },
  {
    id: 'bonus-canister-return',
    title: 'Log Reusable Canister Return',
    description: 'Returned a steel canister to our roastery bar? Log your canister return tag for circularity points.',
    pointsReward: 100,
    verificationPrompt: 'Canister Return Tag #',
    defaultInputPlaceholder: 'CAN-8841',
  },
  {
    id: 'bonus-water-profile',
    title: 'Calibrate Home Brew Profile',
    description: 'Save your primary brewing method and grinder setting to unlock personalized extraction recipes.',
    pointsReward: 60,
    verificationPrompt: 'Primary Brewer & Grinder',
    defaultInputPlaceholder: 'Origami Dripper + Fellow Ode Gen 2',
  },
];

export const INITIAL_MEMBERS: CustomerMember[] = [
  {
    id: 'member-clara',
    name: 'Clara Vance',
    email: 'clara.vance@atelier-arch.io',
    memberSince: 'October 2024',
    pointsBalance: 860,
    lifetimePoints: 1640,
    completedBonusIds: [],
    transactions: [
      {
        id: 'tx-104',
        date: '2026-09-21',
        reference: 'Order #VR-1039',
        description: 'Colombia Cerro Azul Geisha (Bi-Weekly Subscription · 2× Gold Multiplier)',
        pointsDelta: 380,
        type: 'earned',
      },
      {
        id: 'tx-103',
        date: '2026-09-08',
        reference: 'Voucher #RD-500',
        description: 'Redeemed $12.00 Off Roastery Order Voucher',
        pointsDelta: -500,
        type: 'redeemed',
      },
      {
        id: 'tx-102',
        date: '2026-08-29',
        reference: 'Order #VR-1018',
        description: 'Kurogane Pour-Over Atelier Set + Ethiopia Worka Sakaro',
        pointsDelta: 880,
        type: 'earned',
      },
      {
        id: 'tx-101',
        date: '2026-08-14',
        reference: 'Circularity #CR-19',
        description: 'Reusable Ultraviolet Canister Return at Roastery Bar',
        pointsDelta: 100,
        type: 'bonus',
      },
    ],
  },
  {
    id: 'member-marcus',
    name: 'Marcus Thorne',
    email: 'm.thorne@nordicpress.org',
    memberSince: 'March 2025',
    pointsBalance: 540,
    lifetimePoints: 790,
    completedBonusIds: [],
    transactions: [
      {
        id: 'tx-203',
        date: '2026-09-18',
        reference: 'Order #VR-1031',
        description: 'Ethiopia Worka Sakaro × 2 + Nocturne Slow-Drip Elixir',
        pointsDelta: 490,
        type: 'earned',
      },
      {
        id: 'tx-202',
        date: '2026-09-02',
        reference: 'Voucher #RD-250',
        description: 'Redeemed $5.00 Off Single-Origin Release',
        pointsDelta: -250,
        type: 'redeemed',
      },
      {
        id: 'tx-201',
        date: '2026-08-19',
        reference: 'Order #VR-0994',
        description: 'Guatemala El Injerto Pacamara (First Member Order + Welcome Bonus)',
        pointsDelta: 300,
        type: 'earned',
      },
    ],
  },
  {
    id: 'member-elena',
    name: 'Elena Rostova',
    email: 'elena@rostovastudio.com',
    memberSince: 'August 2026',
    pointsBalance: 265,
    lifetimePoints: 265,
    completedBonusIds: [],
    transactions: [
      {
        id: 'tx-302',
        date: '2026-09-15',
        reference: 'Order #VR-1027',
        description: 'Nocturne Slow-Drip Elixir (One-Time Order)',
        pointsDelta: 115,
        type: 'earned',
      },
      {
        id: 'tx-301',
        date: '2026-08-30',
        reference: 'Welcome #WL-01',
        description: 'Vespera Apothecary Initiate Enrollment Grant',
        pointsDelta: 150,
        type: 'bonus',
      },
    ],
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'VR-1039',
    date: '2026-09-21',
    customerName: 'Clara Vance',
    memberId: 'member-clara',
    items: [
      {
        productId: 'colombia-finca-la-palma',
        productName: 'Colombia Cerro Azul Geisha',
        variant: 'Whole Bean',
        isSubscription: true,
        quantity: 1,
        unitPrice: 34.20,
      },
    ],
    subtotal: 34.20,
    discountApplied: 0,
    shippingCost: 0,
    total: 34.20,
    pointsEarned: 380,
    pointsRedeemed: 0,
    status: 'Delivered to Porch',
    shippingAddress: '742 Evergreen Terrace, Suite 4B, Portland, OR 97205',
  },
  {
    id: 'VR-1031',
    date: '2026-09-18',
    customerName: 'Marcus Thorne',
    memberId: 'member-marcus',
    items: [
      {
        productId: 'ethiopia-worka-sakaro',
        productName: 'Ethiopia Worka Sakaro',
        variant: 'Pour-Over (Medium-Fine)',
        isSubscription: false,
        quantity: 2,
        unitPrice: 26.00,
      },
      {
        productId: 'kyoto-cold-brew-elixir',
        productName: 'Nocturne Slow-Drip Elixir',
        variant: 'Single 500ml Bottle',
        isSubscription: false,
        quantity: 1,
        unitPrice: 22.00,
      },
    ],
    subtotal: 74.00,
    discountApplied: 0,
    shippingCost: 0,
    total: 74.00,
    pointsEarned: 490,
    pointsRedeemed: 0,
    status: 'Roasted & Resting — Out for Courier',
    shippingAddress: '118 Mercer Street, Apt 3A, Seattle, WA 98101',
  },
];

export interface TierDetails {
  name: 'Bronze Initiate' | 'Silver Regular' | 'Gold Connoisseur';
  shortName: 'Bronze' | 'Silver' | 'Gold';
  pointsPerDollar: number;
  minLifetimePoints: number;
  nextTierName?: string;
  nextTierThreshold?: number;
  freeShippingThreshold: number;
  perks: string[];
}

export function getMemberTier(lifetimePoints: number): TierDetails {
  if (lifetimePoints >= 1200) {
    return {
      name: 'Gold Connoisseur',
      shortName: 'Gold',
      pointsPerDollar: 10,
      minLifetimePoints: 1200,
      freeShippingThreshold: 0,
      perks: [
        '10 points per $1 spent (20 pts/$1 on subscriptions)',
        'Complimentary priority courier shipping on all orders',
        'First-48h allocation access to Geisha & competition micro-lots',
        'Quarterly sample vial included with every bean shipment',
      ],
    };
  }
  if (lifetimePoints >= 500) {
    return {
      name: 'Silver Regular',
      shortName: 'Silver',
      pointsPerDollar: 8,
      minLifetimePoints: 500,
      nextTierName: 'Gold Connoisseur',
      nextTierThreshold: 1200,
      freeShippingThreshold: 35,
      perks: [
        '8 points per $1 spent (16 pts/$1 on subscriptions)',
        'Complimentary courier shipping on orders $35+',
        'Precision custom burr grind calibration on request',
      ],
    };
  }
  return {
    name: 'Bronze Initiate',
    shortName: 'Bronze',
    pointsPerDollar: 5,
    minLifetimePoints: 0,
    nextTierName: 'Silver Regular',
    nextTierThreshold: 500,
    freeShippingThreshold: 50,
    perks: [
      '5 points per $1 spent (10 pts/$1 on subscriptions)',
      'Complimentary courier shipping on orders $50+',
      '150 welcome points upon registration',
    ],
  };
}
