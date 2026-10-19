import React, { useState } from 'react';
import { CartItem, FoodItem } from '../types';
import { CreditCard, ShieldCheck, AlertCircle, ShoppingBag, Trash, Plus, Minus, Info } from 'lucide-react';

interface CheckoutModalProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClose: () => void;
  onConfirmPurchase: (creditCardDetails: { holder: string; num: string }) => void;
  userBalance: number;
}

export function CheckoutModal({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
  onConfirmPurchase,
  userBalance,
}: CheckoutModalProps) {
  const [holder, setHolder] = useState('Dionysian Citizen');
  const [cardNumber, setCardNumber] = useState('4532 7183 9102 4432');
  const [expiry, setExpiry] = useState('09/29');
  const [cvv, setCvv] = useState('284');
  const [errorText, setErrorText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Math Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const platformFee = subtotal * 0.10; // 10% goes to "me" (the user/admin)
  const taxAmount = subtotal * 0.10; // 10% sales tax
  const deliveryFee = subtotal > 0 ? 3.99 : 0;
  const total = subtotal + deliveryFee + taxAmount;

  const handleCardNumberChange = (val: string) => {
    // Keep digits only, max 16 digits
    const digits = val.replace(/\D/g, '').slice(0, 16);
    // Format with spaces every 4 characters
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiry(clean);
    }
  };

  const handleCvvChange = (val: string) => {
    setCvv(val.replace(/\D/g, '').slice(0, 3));
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (cart.length === 0) {
      setErrorText('Your grocery bag is currently empty.');
      return;
    }

    if (!holder.trim() || cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) {
      setErrorText('Please fill out all credit card processing credentials correctly.');
      return;
    }

    if (userBalance < total) {
      setErrorText(`Insufficient Funds. Your current Co-Op Wallet has $${userBalance.toFixed(2)}, but this total costs $${total.toFixed(2)}. Please list or sell meals to earn credits!`);
      return;
    }

    setIsProcessing(true);

    // Simulate Secure Bank Ledger confirmation
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPurchase({ holder, num: cardNumber });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-black/[0.06] animate-scale-up">
        
        {/* Left Side: Shopping Bag Items */}
        <div className="flex-1 p-6 overflow-y-auto border-r border-black/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
              <h3 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#cb1212]" />
                Shopping Bag
              </h3>
              <span className="text-xs font-semibold text-[#cb1212] font-mono bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                {cart.length} unique orders
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-[#86868b] space-y-3">
                <div className="h-10 w-10 text-[#86868b] mx-auto animate-bounce">🛒</div>
                <h5 className="text-xs font-bold text-[#1d1d1f]">Your bag is empty</h5>
                <p className="text-[11px] text-[#86868b] max-w-xs mx-auto">Explore our fresh chef-curated menus and add artisan delicacies to start checkout.</p>
                <button
                  onClick={onClose}
                  className="rounded-full bg-[#cb1212] px-5 py-2 text-xs font-semibold text-white hover:bg-[#a30e0e] transition active:scale-95 shadow-xs"
                >
                  Return to Marketplace
                </button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-black/[0.05]">
                {cart.map((item) => (
                  <div key={item.foodItem.id} className="flex gap-3 py-3 items-center justify-between">
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.title}
                      className="h-12 w-12 rounded-xl object-cover bg-[#f5f5f7] border border-black/[0.05]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#1d1d1f] text-xs truncate">{item.foodItem.title}</h4>
                      <p className="text-[10px] text-[#86868b]">By {item.foodItem.sellerName}</p>
                      <span className="text-xs font-bold text-[#cb1212] font-mono block mt-0.5">${item.foodItem.price.toFixed(2)} ea</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.foodItem.id, Math.max(1, item.quantity - 1))}
                        className="rounded-full p-1 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e5e5ea] border border-black/[0.06] transition active:scale-95"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold font-mono text-[#1d1d1f] px-1">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.foodItem.id, item.quantity + 1)}
                        className="rounded-full p-1 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e5e5ea] border border-black/[0.06] transition active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.foodItem.id)}
                        className="ml-1 text-[#86868b] hover:text-[#cb1212] transition"
                        title="Delete order"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Outline */}
          {cart.length > 0 && (
            <div className="mt-6 border-t border-black/[0.05] pt-4 space-y-2">
              <div className="flex justify-between text-xs text-[#515154]">
                <span>Food Subtotal</span>
                <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#515154]">
                <span>Sales Tax (10%)</span>
                <span className="font-mono font-semibold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#515154] pb-2 border-b border-black/[0.05]">
                <span>Local Eco Delivery</span>
                <span className="font-mono font-semibold">${deliveryFee.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-[#cb1212] bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                <div className="flex gap-1.5 items-start">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block">10% Platform Fee Included</span>
                    <span className="text-[10px] opacity-85 block">This meal order allocates <strong>${platformFee.toFixed(2)}</strong> to standard database maintenance & developer support.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm pt-2">
                <span className="font-bold text-[#1d1d1f]">Grand Combined Total</span>
                <span className="font-mono text-base font-bold text-[#cb1212]">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Secure Card Form */}
        {cart.length > 0 && (
          <form onSubmit={handlePurchase} className="w-full md:w-[360px] bg-[#f5f5f7] p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-black/[0.05]">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secure Checkout
                </h4>
                <p className="text-[10px] text-[#86868b] mt-1">SSL Encrypted Sandbox Payments Processing System.</p>
              </div>

              {/* Virtual Wallet Banner */}
              <div className="rounded-2xl border border-black/[0.05] bg-white p-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#86868b] block text-[10px] uppercase font-semibold">Your Co-Op Balance</span>
                  <span className="font-mono font-bold text-[#1d1d1f]">${userBalance.toFixed(2)}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${userBalance >= total ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {userBalance >= total ? 'Funds OK' : 'Overdraft'}
                </span>
              </div>

              {/* Secure Input Form fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Cardholder Name</label>
                  <input
                    id="cardholder-name"
                    type="text"
                    required
                    placeholder="e.g. Dionysian Citizen"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    className="w-full rounded-2xl border border-black/[0.08] bg-white px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#cb1212]/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Card Number</label>
                  <div className="relative">
                    <input
                      id="card-number-input"
                      type="text"
                      required
                      placeholder="4532 7183 9102 4432"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full rounded-2xl border border-black/[0.08] bg-white px-3.5 py-2 pl-9 text-xs font-mono focus:ring-2 focus:ring-[#cb1212]/30 focus:outline-none"
                    />
                    <CreditCard className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Expiry date</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="w-full rounded-2xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-mono text-center focus:ring-2 focus:ring-[#cb1212]/30 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Security CVV</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      required
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      className="w-full rounded-2xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-mono text-center focus:ring-2 focus:ring-[#cb1212]/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {errorText && (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-[11px] text-[#cb1212] flex items-start gap-1.5 leading-snug">
                  <AlertCircle className="h-4 w-4 text-[#cb1212] shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <button
                id="sumbit-checkout-card"
                type="submit"
                disabled={isProcessing}
                className="w-full rounded-full bg-[#cb1212] py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#a30e0e] transition flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validating Card...</span>
                  </>
                ) : (
                  <span>Charge & Pay ${total.toFixed(2)}</span>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-black/[0.06] bg-white py-2.5 text-[11px] font-semibold text-[#515154] hover:bg-[#e5e5ea] transition active:scale-95"
              >
                Go Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
