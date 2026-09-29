import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Product } from '../data/roasteryData';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  pointsPerDollar: number;
  onAddToCart: (
    product: Product,
    variant: string,
    isSubscription: boolean,
    quantity: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  pointsPerDollar,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] || 'Standard');
      setIsSubscription(false);
      setQuantity(1);
      setJustAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const canSubscribe = product.category !== 'hardware';
  const effectiveUnitPrice =
    canSubscribe && isSubscription
      ? Number((product.price * 0.9).toFixed(2))
      : product.price;
  const lineTotal = Number((effectiveUnitPrice * quantity).toFixed(2));
  const multiplier = canSubscribe && isSubscription ? 2 : 1;
  const estimatedPoints = Math.round(lineTotal * pointsPerDollar * multiplier);

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, canSubscribe && isSubscription, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#F8F9FA] border border-zinc-200 rounded-xl shadow-xl overflow-hidden my-auto">
        <button
          onClick={onClose}
          aria-label="Close product detail view"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg bg-white/90 border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#14532D]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contiguous Purchase Module: Sticky Gallery Left, Purchase Module Right */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Product Imagery & Brewing Spec */}
          <div className="md:col-span-6 bg-[#F1F3F5] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/80">
            <div>
              <div className="text-xs text-zinc-500 mb-3">
                <span>{product.categoryLabel}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>{product.harvestLot}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="text-[#14532D] font-medium">{product.availability}</span>
              </div>

              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-white border border-zinc-200/60">
                <ResilientImage
                  src={product.image}
                  alt={product.name}
                  fallbackLabel={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-200/80">
              <div className="text-xs font-medium text-zinc-800 mb-2.5">
                Roastery Extraction Protocol
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                <div>
                  <span className="text-zinc-500 block">Dose / Capacity</span>
                  <span className="font-mono tabular-nums text-zinc-900 font-medium">
                    {product.brewingRecipe.dose}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Temperature</span>
                  <span className="font-mono tabular-nums text-zinc-900 font-medium">
                    {product.brewingRecipe.waterTemp}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Target Ratio</span>
                  <span className="font-mono tabular-nums text-zinc-900 font-medium">
                    {product.brewingRecipe.ratio}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Bloom / Notes</span>
                  <span className="font-mono tabular-nums text-zinc-900 font-medium">
                    {product.brewingRecipe.bloomTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="text-xs text-zinc-500">
                <span>{product.origin}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{product.elevation}</span>
              </div>

              <h2
                id="pdp-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold text-zinc-950 mt-1 tracking-tight"
              >
                {product.name}
              </h2>

              <p className="text-xs text-zinc-600 mt-1">{product.subtitle}</p>

              <div className="mt-4 flex items-baseline justify-between pb-4 border-b border-zinc-200/80">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono tabular-nums text-2xl font-semibold text-zinc-950">
                    ${effectiveUnitPrice.toFixed(2)}
                  </span>
                  {canSubscribe && isSubscription && (
                    <span className="font-mono tabular-nums text-sm text-zinc-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">
                    / {product.weightOrVolume}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-xs font-medium text-[#14532D]">
                  Earns +{estimatedPoints} pts
                </span>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Unboxed Tasting Notes */}
              <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                <span className="font-medium text-zinc-900">Tasting Profile: </span>
                {product.tastingNotes.map((note, idx) => (
                  <React.Fragment key={note}>
                    <span>{note}</span>
                    {idx < product.tastingNotes.length - 1 && (
                      <span className="mx-1.5 text-zinc-400" aria-hidden="true">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Variant / Grind Selector */}
              <div className="mt-5">
                <label className="block text-xs font-medium text-zinc-800 mb-2">
                  {product.category === 'beans'
                    ? 'Select Burr Grind Calibration'
                    : 'Select Configuration'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => {
                    const active = selectedVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap truncate ${
                          active
                            ? 'border-[#14532D] bg-[#14532D]/5 text-[#14532D]'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Purchase Cadence Selector */}
              {canSubscribe && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-zinc-800 mb-2">
                    Fulfillment Cadence
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsSubscription(false)}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        !isSubscription
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      One-Time Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSubscription(true)}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        isSubscription
                          ? 'bg-white text-[#14532D] shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Bi-Weekly (Save 10% · 2× Pts)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & Primary Add Action */}
            <div className="mt-6 pt-4 border-t border-zinc-200/80 flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-mono tabular-nums text-sm font-medium text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-2.5 px-5 rounded-lg bg-[#14532D] hover:bg-[#0f3f22] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag · ${lineTotal.toFixed(2)}</span>
                  </>
                ) : (
                  <span>
                    Add to Bag — ${lineTotal.toFixed(2)} (+{estimatedPoints} pts)
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
