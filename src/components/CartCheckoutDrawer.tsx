import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Check, ArrowRight } from 'lucide-react';
import {
  Product,
  CustomerMember,
  RewardOption,
  REWARD_OPTIONS,
  OrderRecord,
  getMemberTier,
} from '../data/roasteryData';
import { ResilientImage } from './ResilientImage';

export interface CartItem {
  key: string;
  product: Product;
  variant: string;
  isSubscription: boolean;
  quantity: number;
}

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  activeMember: CustomerMember;
  selectedReward: RewardOption | null;
  onSelectReward: (reward: RewardOption | null) => void;
  onCompleteOrder: (orderData: {
    shippingAddress: string;
    paymentMethod: string;
    subtotal: number;
    discountApplied: number;
    appliedReward: RewardOption | null;
    shippingCost: number;
    total: number;
    pointsEarned: number;
  }) => OrderRecord;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  activeMember,
  selectedReward,
  onSelectReward,
  onCompleteOrder,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [address, setAddress] = useState('742 Evergreen Terrace, Suite 4B');
  const [cityPostal, setCityPostal] = useState('Portland, OR 97205');
  const [phone, setPhone] = useState('(503) 555-0194');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  const tier = getMemberTier(activeMember.lifetimePoints);

  const subtotal = Number(
    cart
      .reduce((acc, item) => {
        const unit = item.isSubscription
          ? Number((item.product.price * 0.9).toFixed(2))
          : item.product.price;
        return acc + unit * item.quantity;
      }, 0)
      .toFixed(2)
  );

  // Validate if selectedReward is eligible
  const isRewardEligible =
    selectedReward &&
    activeMember.pointsBalance >= selectedReward.pointsCost &&
    subtotal >= selectedReward.minOrderAmount;

  const discountApplied = isRewardEligible
    ? Math.min(subtotal, selectedReward.discountAmount)
    : 0;

  const discountedSubtotal = Math.max(0, Number((subtotal - discountApplied).toFixed(2)));

  const shippingCost =
    cart.length === 0 || discountedSubtotal >= tier.freeShippingThreshold
      ? 0
      : 6.50;

  const total = Number((discountedSubtotal + shippingCost).toFixed(2));

  // Points earned calculation (subscriptions earn 2x points on their line item)
  const rawPointsEarned = cart.reduce((acc, item) => {
    const unit = item.isSubscription
      ? Number((item.product.price * 0.9).toFixed(2))
      : item.product.price;
    const mult = item.isSubscription ? 2 : 1;
    return acc + unit * item.quantity * tier.pointsPerDollar * mult;
  }, 0);

  // Adjust proportionally if discount applied
  const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 1;
  const pointsEarned = Math.max(10, Math.round(rawPointsEarned * discountRatio));

  const amountToFreeShipping = Math.max(
    0,
    Number((tier.freeShippingThreshold - discountedSubtotal).toFixed(2))
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const record = onCompleteOrder({
      shippingAddress: `${address}, ${cityPostal} · Tel: ${phone}`,
      paymentMethod: paymentMethod === 'card' ? 'Member Card •••• 4812' : 'Cash on Delivery (COD)',
      subtotal,
      discountApplied,
      appliedReward: isRewardEligible ? selectedReward : null,
      shippingCost,
      total,
      pointsEarned,
    });
    setConfirmedOrder(record);
    setStep('confirmed');
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Loyalty Checkout"
    >
      <div className="w-full max-w-lg bg-[#F8F9FA] h-full flex flex-col justify-between border-l border-zinc-200 shadow-2xl overflow-hidden">
        {/* Drawer Top Header */}
        <div className="px-6 py-5 bg-white border-b border-zinc-200/80 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-zinc-950">
              {step === 'cart' && 'Roastery Shopping Bag'}
              {step === 'checkout' && 'Dispatch & Loyalty Verification'}
              {step === 'confirmed' && `Order #${confirmedOrder?.id} Confirmed`}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              <span>{activeMember.name}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#14532D] font-medium">
                {activeMember.pointsBalance.toLocaleString()} pts available
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close shopping bag"
            className="w-10 h-10 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Banner */}
        {step !== 'confirmed' && cart.length > 0 && (
          <div className="px-6 py-2.5 bg-[#F1F3F5] border-b border-zinc-200/80 text-xs text-zinc-700 flex items-center justify-between">
            {amountToFreeShipping === 0 ? (
              <span className="text-[#14532D] font-medium">
                Complimentary {tier.shortName} Tier Courier Shipping unlocked
              </span>
            ) : (
              <span>
                Add{' '}
                <strong className="font-mono tabular-nums">
                  ${amountToFreeShipping.toFixed(2)}
                </strong>{' '}
                more for complimentary courier shipping
              </span>
            )}
            <span className="font-mono tabular-nums text-[11px] text-zinc-500">
              {tier.pointsPerDollar} pts/$1
            </span>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'confirmed' && confirmedOrder ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                <div className="w-10 h-10 rounded-full bg-[#14532D]/10 text-[#14532D] flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono tabular-nums text-[#14532D] font-semibold">
                    STATUS: {confirmedOrder.status}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Roasted to order · Dispatching to {confirmedOrder.shippingAddress}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-medium text-zinc-800">
                  Receipt Summary
                </div>
                {confirmedOrder.items.map((item, i) => (
                  <div
                    key={`${item.productId}-${i}`}
                    className="flex justify-between text-xs text-zinc-600"
                  >
                    <span>
                      {item.quantity}× {item.productName} ({item.variant})
                      {item.isSubscription ? ' · Sub' : ''}
                    </span>
                    <span className="font-mono tabular-nums text-zinc-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">
                    ${confirmedOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                {confirmedOrder.discountApplied > 0 && (
                  <div className="flex justify-between text-[#14532D] font-medium">
                    <span>
                      Loyalty Redemption ({confirmedOrder.pointsRedeemed} pts)
                    </span>
                    <span className="font-mono tabular-nums">
                      -${confirmedOrder.discountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Courier Shipping</span>
                  <span className="font-mono tabular-nums">
                    {confirmedOrder.shippingCost === 0
                      ? 'FREE'
                      : `$${confirmedOrder.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-zinc-950 pt-2 border-t border-zinc-100">
                  <span>Total Paid</span>
                  <span className="font-mono tabular-nums">
                    ${confirmedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#F1F3F5] text-xs space-y-1">
                <div className="font-semibold text-[#14532D] font-mono tabular-nums">
                  +{confirmedOrder.pointsEarned} Roast Points Credited
                </div>
                <div className="text-zinc-600">
                  Updated Member Balance:{' '}
                  <strong className="font-mono tabular-nums text-zinc-950">
                    {activeMember.pointsBalance.toLocaleString()} pts
                  </strong>
                </div>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-display text-2xl text-zinc-800">
                Your roastery bag is currently empty.
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Explore our single-origin micro-lots, cold-drip elixirs, or Japanese pouring hardware to begin earning roast points.
              </p>
            </div>
          ) : step === 'cart' ? (
            <>
              {/* Itemized Cart List */}
              <div className="space-y-4">
                {cart.map((item) => {
                  const unitPrice = item.isSubscription
                    ? Number((item.product.price * 0.9).toFixed(2))
                    : item.product.price;
                  return (
                    <div
                      key={item.key}
                      className="p-4 bg-white rounded-xl border border-zinc-200/80 flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60">
                        <ResilientImage
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-lg font-semibold text-zinc-950 truncate">
                            {item.product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.key)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-zinc-400 hover:text-zinc-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-zinc-500 mt-0.5">
                          <span>{item.variant}</span>
                          {item.isSubscription && (
                            <>
                              <span className="mx-1.5" aria-hidden="true">·</span>
                              <span className="text-[#14532D] font-medium">
                                Bi-Weekly Sub (2× Pts)
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-zinc-200 rounded-md bg-zinc-50">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.key, -1)}
                              aria-label="Decrease item quantity"
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-950"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-mono tabular-nums text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.key, 1)}
                              aria-label="Increase item quantity"
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-950"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono tabular-nums text-sm font-semibold text-zinc-950">
                            ${(unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instant Loyalty Voucher Redemption Picker in Bag */}
              <div className="p-4 bg-white rounded-xl border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900">
                    Redeem Loyalty Points on This Order
                  </span>
                  <span className="font-mono tabular-nums text-xs text-[#14532D]">
                    {activeMember.pointsBalance.toLocaleString()} pts available
                  </span>
                </div>

                <div className="space-y-2">
                  {REWARD_OPTIONS.map((reward) => {
                    const hasPoints = activeMember.pointsBalance >= reward.pointsCost;
                    const meetsMin = subtotal >= reward.minOrderAmount;
                    const eligible = hasPoints && meetsMin;
                    const isPicked = selectedReward?.id === reward.id;

                    return (
                      <div
                        key={reward.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                          isPicked
                            ? 'border-[#14532D] bg-[#14532D]/5'
                            : 'border-zinc-200/80 bg-zinc-50/60'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-zinc-900">
                            {reward.title}
                          </div>
                          <div className="text-[11px] font-mono tabular-nums text-zinc-500 mt-0.5">
                            {reward.pointsCost} pts · Min order ${reward.minOrderAmount}
                          </div>
                        </div>

                        {isPicked ? (
                          <button
                            type="button"
                            onClick={() => onSelectReward(null)}
                            className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium whitespace-nowrap cursor-pointer"
                          >
                            Applied (Remove)
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!eligible}
                            onClick={() => onSelectReward(reward)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                              eligible
                                ? 'bg-[#14532D] text-white hover:bg-[#0f3f22] cursor-pointer'
                                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            {!hasPoints
                              ? `Need ${reward.pointsCost} pts`
                              : !meetsMin
                              ? `Min $${reward.minOrderAmount}`
                              : `Apply -$${reward.discountAmount}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Step === 'checkout' Customer Verification Form */
            <form id="roastery-checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-zinc-200/80 space-y-4">
                <div className="text-xs font-semibold text-zinc-900">
                  Courier Dispatch Destination
                </div>

                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                     readOnly
                    value={activeMember.name}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Street Address & Suite
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">
                      City, State & Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={cityPostal}
                      onChange={(e) => setCityPostal(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">
                      Courier SMS Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200/80 space-y-3">
                <div className="text-xs font-semibold text-zinc-900">
                  Settlement Method
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#14532D] bg-[#14532D]/5 text-[#14532D] font-medium'
                        : 'border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <div>Saved Member Card</div>
                    <div className="font-mono text-[11px] text-zinc-500 mt-0.5">
                      Visa •••• 4812
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-[#14532D] bg-[#14532D]/5 text-[#14532D] font-medium'
                        : 'border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <div>Cash on Delivery</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Pay courier upon arrival
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer Totals & Primary CTA */}
        <div className="p-6 bg-white border-t border-zinc-200/80">
          {step === 'confirmed' ? (
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Return to Storefront & View Updated Ledger
            </button>
          ) : cart.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Bag Subtotal</span>
                  <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {discountApplied > 0 && selectedReward && (
                  <div className="flex justify-between text-[#14532D] font-medium">
                    <span>
                      Loyalty Voucher (-{selectedReward.pointsCost} pts)
                    </span>
                    <span className="font-mono tabular-nums">
                      -${discountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Courier Dispatch</span>
                  <span className="font-mono tabular-nums">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#14532D] pt-1">
                  <span>Roast Points Earned on Order</span>
                  <span className="font-mono tabular-nums font-semibold">
                    +{pointsEarned} pts
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-zinc-950 pt-2 border-t border-zinc-200/80">
                  <span>Total Due</span>
                  <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 px-5 rounded-lg bg-[#14532D] hover:bg-[#0f3f22] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Proceed to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-4 py-3 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="roastery-checkout-form"
                    className="flex-1 py-3 px-5 rounded-lg bg-[#14532D] hover:bg-[#0f3f22] text-white text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Complete Order · ${total.toFixed(2)}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
