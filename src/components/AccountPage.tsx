import { useState, useEffect, FormEvent } from 'react';
import { 
  User, MapPin, Phone, Mail, History, Award, DollarSign, Shield, Check, RotateCcw, 
  Sparkles, Star, Plus, CreditCard, Receipt, FileText, X, Printer, Search, 
  Filter, CheckCircle2, Clock, ChefHat, Truck, ShoppingBag
} from 'lucide-react';
import { Order } from '../types';

interface AccountPageProps {
  userBalance: number;
  onTopup: (amount: number) => void;
  buyerRating: number;
  sellerRating: number;
  orders: Order[];
  onResetDB: () => void;
  onSignOut?: () => void;
  currentUserEmail?: string;
  isSellerPaid?: boolean;
  onPaySellerFee?: () => void;
}

interface Transaction {
  id: string;
  type: 'Purchase' | 'Topup' | 'Income' | 'Refund' | 'FeeDeduction';
  amount: number;
  description: string;
  date: string;
}

export function AccountPage({
  userBalance,
  onTopup,
  buyerRating,
  sellerRating,
  orders,
  onResetDB,
  onSignOut,
  currentUserEmail = 'guest.cook@dionysus.local',
  isSellerPaid = false,
  onPaySellerFee,
}: AccountPageProps) {
  // Account Information state
  const [profileName, setProfileName] = useState(() => localStorage.getItem('dionysus_user_name') || 'Dionysian Guest');
  const [profilePhone, setProfilePhone] = useState(() => localStorage.getItem('dionysus_user_phone') || '+1 (555) 019-2026');
  const [profileAddress, setProfileAddress] = useState(() => localStorage.getItem('dionysus_user_address') || '404 Olympus Heights Terrace, Ward 4');
  const [profileBio, setProfileBio] = useState(() => localStorage.getItem('dionysus_user_bio') || 'Passionate epicurean seeking direct neighborhood feast culture. Believer in warm ovens, shared standard plates, and local micro-kitchens.');
  
  // Custom preferences
  const [dietPreference, setDietPreference] = useState(() => localStorage.getItem('dionysus_user_diet') || 'All');
  const [deliveryRadius, setDeliveryRadius] = useState(() => parseInt(localStorage.getItem('dionysus_user_radius') || '5'));
  const [customTopupAmount, setCustomTopupAmount] = useState('50');
  
  // Save status notifications
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  // Receipt Modal and Table Filters state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filtered orders list for table
  const filteredOrders = orders
    .filter((ord) => {
      const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ord.id.toLowerCase().includes(q) ||
        ord.sellerName.toLowerCase().includes(q) ||
        ord.items.some((it) => it.foodItem.title.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Generate dynamic ledger of previous transactions based on sandbox state & order placements
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Generate transactions from user orders
    const history: Transaction[] = [];
    
    // Default welcome starter deposit
    history.push({
      id: 'tx_init_001',
      type: 'Topup',
      amount: 85.00,
      description: 'Sandbox Starter feast credits endowed by Dionysus',
      date: new Date(Date.now() - 86400000 * 2).toISOString()
    });

    // Orders purchased
    orders.forEach((or) => {
      // If Alp purchased it
      if (or.buyerId === 'b_local_user') {
        history.push({
          id: `tx_buy_${or.id}`,
          type: 'Purchase',
          amount: or.total,
          description: `Rented a plate: "${or.items[0]?.foodItem.title || 'Artisan Dish'}" from ${or.sellerName}`,
          date: or.createdAt
        });
      }
      // If Alp cooked & hosted it (simulated)
      if (or.sellerId === 's_local_user') {
        const netEarnt = or.subtotal - or.platformFee;
        history.push({
          id: `tx_sel_${or.id}`,
          type: 'Income',
          amount: netEarnt,
          description: `Dispatched feast plate to ${or.buyerName}`,
          date: or.createdAt
        });
        history.push({
          id: `tx_fee_${or.id}`,
          type: 'FeeDeduction',
          amount: or.platformFee,
          description: `10% Co-Op pledge automatic deduction for ${or.id}`,
          date: or.createdAt
        });
      }
    });

    // Parse manual tops from localStorage or balance changes
    const savedTopupsRaw = localStorage.getItem('dionysus_topups_ledger');
    if (savedTopupsRaw) {
      try {
        const tops = JSON.parse(savedTopupsRaw) as Transaction[];
        history.push(...tops);
      } catch (e) {
        // No-op
      }
    }

    // Sort by chronological order descending
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(history);
  }, [orders, userBalance]);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dionysus_user_name', profileName);
    localStorage.setItem('dionysus_user_phone', profilePhone);
    localStorage.setItem('dionysus_user_address', profileAddress);
    localStorage.setItem('dionysus_user_bio', profileBio);
    localStorage.setItem('dionysus_user_diet', dietPreference);
    localStorage.setItem('dionysus_user_radius', deliveryRadius.toString());
    
    // Pulse saved checkmark
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 2500);
  };

  const handleCustomTopUp = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customTopupAmount);
    if (!isNaN(amount) && amount > 0) {
      onTopup(amount);
      
      // Save topup transaction ledger dynamically
      const raw = localStorage.getItem('dionysus_topups_ledger') || '[]';
      try {
        const parsed = JSON.parse(raw) as Transaction[];
        const newTx: Transaction = {
          id: `tx_top_${Date.now()}`,
          type: 'Topup',
          amount: amount,
          description: 'Topup sandbox wallet with instant mock currency',
          date: new Date().toISOString()
        };
        parsed.push(newTx);
        localStorage.setItem('dionysus_topups_ledger', JSON.stringify(parsed));
      } catch (err) {
        // Clean ledger error
      }
      setCustomTopupAmount('50');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.05] pb-6">
        <div>
          <span className="font-cursive text-3xl text-[#cb1212] leading-none select-none block">Dionysian Citizen</span>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mt-1">Profile & Ledger</h2>
          <p className="text-xs text-[#86868b] mt-1">Manage your registered delivery details, analyze transactions, and audit co-op contribution fees.</p>
        </div>
        <div className="flex items-center gap-2">
          {showSavedNotification && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-scale">
              <Check className="h-4 w-4 text-emerald-600" />
              Settings saved
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Section: Visual Profile Card & Quick Wallet */}
        <div className="md:col-span-1 space-y-6">
          {/* Main Card */}
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-rose-50 to-transparent -mr-4 -mt-4 rounded-bl-full pointer-events-none"></div>
            
            {/* Header with Profile Icon */}
            <div className="flex flex-col items-center text-center space-y-3.5">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f5f5f7] border border-black/[0.06] text-[#cb1212] shadow-xs">
                  <User className="h-10 w-10 text-[#cb1212] stroke-[1.5]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#cb1212] text-[10px] text-white shadow font-bold border-2 border-white">★</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">{profileName}</h3>
                <p className="text-[10px] text-[#cb1212] font-mono tracking-wider uppercase font-semibold mt-0.5">Dionysus Connoisseur</p>
              </div>

              <p className="text-xs text-[#86868b] italic max-w-xs">{profileBio}</p>
            </div>

            {/* Ratings Summary */}
            <div className="grid grid-cols-2 gap-3 border-t border-b border-black/[0.05] py-4 my-5 text-center">
              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-[#86868b]">Buyer Rating</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span className="text-sm font-bold text-[#1d1d1f]">{buyerRating.toFixed(1)}</span>
                </div>
                <p className="text-[9px] text-[#86868b] mt-0.5 font-mono">8 Feast Rents</p>
              </div>
              <div className="border-l border-black/[0.05]">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-[#86868b]">Host Rating</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-[#cb1212]">
                  <Star className="h-4 w-4 fill-[#cb1212]" />
                  <span className="text-sm font-bold text-[#1d1d1f]">{sellerRating.toFixed(1)}</span>
                </div>
                <p className="text-[9px] text-[#86868b] mt-0.5 font-mono">11 Feasts Prepared</p>
              </div>
            </div>

            {/* Micro Details list */}
            <div className="space-y-3.5 text-xs text-[#515154]">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#cb1212] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1d1d1f] text-[11px]">Primary Hearth Node</p>
                  <p className="text-[11px] text-[#86868b] leading-tight mt-0.5">{profileAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#cb1212] shrink-0" />
                <div>
                  <p className="font-semibold text-[#1d1d1f] text-[11px]">Contact Line</p>
                  <p className="text-[11px] text-[#86868b] mt-0.5">{profilePhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#cb1212] shrink-0" />
                <div>
                  <p className="font-semibold text-[#1d1d1f] text-[11px]">Email Node</p>
                  <p className="text-[11px] text-[#86868b] mt-0.5">{currentUserEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Wallet Loader Card - Strict Red & White */}
          <div className="bg-gradient-to-br from-[#dc2626] via-[#cb1212] to-[#991b1b] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-rose-200 font-mono">Sandbox Treasury</span>
              <DollarSign className="h-5 w-5 text-white" />
            </div>

            <p className="text-2xl font-black tracking-tight text-white font-mono">${userBalance.toFixed(2)}</p>
            <p className="text-[10px] text-rose-100 mt-0.5 font-medium">Instant spendable neighbor feast credits</p>

            <form onSubmit={handleCustomTopUp} className="mt-5 space-y-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={customTopupAmount}
                  onChange={(e) => setCustomTopupAmount(e.target.value)}
                  className="w-full text-zinc-900 bg-white rounded-full border-none pl-7 pr-4 py-2 text-xs font-bold placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Reload Sum"
                />
              </div>
              <button
                type="submit"
                className="w-full text-center rounded-full bg-white hover:bg-rose-50 text-[#cb1212] px-4 py-2.5 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Recharge Sandbox Balance
              </button>
            </form>
          </div>

          {/* Ledger Reset Utility */}
          <div className="rounded-3xl border border-black/[0.05] bg-white p-5 space-y-3">
            <h4 className="text-[10px] font-semibold text-[#86868b] tracking-wider uppercase font-mono">Administrative settings</h4>
            
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full text-center rounded-full bg-[#1d1d1f] hover:bg-black py-2 text-[11px] font-semibold text-white transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                Sign Out of Account
              </button>
            )}

            <p className="text-[10px] text-[#86868b] leading-normal pt-2 border-t border-black/[0.04]">
              Need to restart testing? Instantly clean cooking metrics, orders, delivery feeds, and wallet state to default specs.
            </p>
            <button
              onClick={onResetDB}
              className="w-full text-center rounded-full border border-[#cb1212]/30 py-1.5 text-[10px] uppercase font-semibold tracking-wide text-[#cb1212] hover:bg-rose-50/50 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Database to default
            </button>
          </div>
        </div>

        {/* Center & Right sections: settings edit + transactions history */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Edit Profile Form */}
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="text-md font-serif font-black text-[#1d1d1f] tracking-tight border-b border-black/[0.05] pb-3 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-[#cb1212]" />
              Neighborhood Citizen Registry Form
            </h3>
            
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d1d1f] block">Dionysian Guest Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-2xl border border-black/[0.08] px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-red-500/30 focus:outline-none bg-[#f5f5f7]/50"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d1d1f] block">Encrypted Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-2xl border border-black/[0.08] px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-red-500/30 focus:outline-none bg-[#f5f5f7]/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d1d1f] block">Hearth Delivery Address Node</label>
                <input
                  type="text"
                  required
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full rounded-2xl border border-black/[0.08] px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-red-500/30 focus:outline-none bg-[#f5f5f7]/50"
                />
                <span className="text-[9px] text-[#86868b] italic block mt-0.5">Where local neighbors will bring hot plates.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d1d1f] block">Your Taste Profile Biography</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full rounded-2xl border border-black/[0.08] px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-red-500/30 focus:outline-none bg-[#f5f5f7]/50 resize-none"
                  placeholder="Share your culinary story with neighboring ovens..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d1d1f] block">Dietary Preferences Default</label>
                  <select
                    value={dietPreference}
                    onChange={(e) => setDietPreference(e.target.value)}
                    className="w-full rounded-2xl border border-black/[0.08] px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#007aff]/30 focus:outline-none bg-[#f5f5f7]/50"
                  >
                    <option value="All">All Diets (Omnivore)</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Healthy">Healthy & Low Carb</option>
                    <option value="SweetTooth">Dedicated Desserts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d1d1f] block flex items-center justify-between">
                    <span>Feast Search Range</span>
                    <span className="text-[#cb1212] font-mono text-[10px] font-bold">{deliveryRadius} Miles</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                    className="w-full accent-[#cb1212] h-1.5 bg-[#f5f5f7] rounded-lg cursor-pointer mt-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.05] flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-[#cb1212] hover:bg-[#a30e0e] text-white px-5 py-2.5 text-xs font-semibold transition-all shadow-xs active:scale-95"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          {/* Stripe Connect & Sales Tax Setup */}
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
              <h3 className="text-md font-serif font-black text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-[#cb1212]" />
                Stripe Connect & Sales Tax Engine
              </h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-0.5 text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest">
                Stripe Sandbox Active
              </span>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed mt-3">
              Configure how payments flow from local foodies to your connected Stripe account. Set local compliance sales taxes and manage peer-to-peer exchanges seamlessly.
            </p>

            {/* Flat $10 Seller Charge Breakdown Box */}
            <div className="mt-4 rounded-2xl border border-black/[0.05] bg-[#f5f5f7]/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#cb1212]" />
                  Seller Account Registration Charge
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
                  isSellerPaid 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {isSellerPaid ? '$10.00 Paid (Active Seller)' : '$10.00 Fee Pending'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-white border border-black/[0.05] p-2 rounded-xl">
                  <span className="block text-[#86868b] font-semibold">Registration Fee</span>
                  <span className="block text-[#1d1d1f] font-bold text-xs">$10.00 Flat</span>
                </div>
                <div className="bg-white border border-black/[0.05] p-2 rounded-xl">
                  <span className="block text-[#86868b] font-semibold">Tax Applied</span>
                  <span className="block text-emerald-600 font-bold text-xs">$0.00 (No Tax)</span>
                </div>
                <div className="bg-white border border-black/[0.05] p-2 rounded-xl">
                  <span className="block text-[#86868b] font-semibold">Total Seller Charge</span>
                  <span className="block text-[#cb1212] font-bold text-xs">$10.00</span>
                </div>
              </div>

              <p className="text-[10px] text-[#86868b] leading-relaxed">
                Every account must pay this flat $10 charge (without additional taxes) to list and sell food on the platform.
              </p>

              {!isSellerPaid && onPaySellerFee && (
                <button
                  onClick={onPaySellerFee}
                  className="w-full rounded-full bg-[#cb1212] hover:bg-[#a30e0e] text-white text-xs font-semibold py-2.5 transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                >
                  Pay $10.00 Flat Seller Fee Now
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Tax Rate Setting */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d1d1f] block">Compliance Sales Tax Rate</label>
                  <select
                    id="stripe-tax-rate"
                    value="10"
                    disabled
                    className="w-full rounded-2xl border border-black/[0.08] px-3.5 py-2.5 text-xs bg-[#f5f5f7] text-[#1d1d1f] font-semibold focus:outline-none"
                  >
                    <option value="10">10% Default (Tax compliance active)</option>
                    <option value="5">5% (Reduced rate)</option>
                    <option value="15">15% (Luxury premium tax)</option>
                    <option value="0">0% (Tax exempt co-op)</option>
                  </select>
                  <span className="text-[9px] text-[#86868b] block mt-1">
                    Standard 10% sales tax rate configured by platform decree.
                  </span>
                </div>

                {/* Stripe Connected Account */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d1d1f] block">Your Stripe Connect Account</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-black/[0.08] px-3.5 py-2 bg-[#f5f5f7]">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-mono text-xs font-bold text-zinc-700">acct_1NJ93vDionysus</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 block mt-1">
                    Instantly verified sandbox account to receive neighborly payouts.
                  </span>
                </div>
              </div>

              {/* Stripe Money Exchange Diagram */}
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200/50 p-4 space-y-3">
                <h5 className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider font-mono text-zinc-500">How Money Exchanges on Stripe</h5>
                
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-sans">
                  <div className="bg-white border border-zinc-200 p-2.5 rounded-xl space-y-1 shadow-2xs">
                    <span className="block font-bold text-zinc-800">1. Foodie Pays</span>
                    <span className="block text-zinc-500 leading-tight">100% of dish list-price + 10% tax + $3.99 delivery fee</span>
                  </div>
                  <div className="bg-white border border-zinc-200 p-2.5 rounded-xl space-y-1 shadow-2xs">
                    <span className="block font-bold text-emerald-600">2. Stripe Split</span>
                    <span className="block text-zinc-500 leading-tight">Stripe splits funds in real-time on checkout</span>
                  </div>
                  <div className="bg-white border border-zinc-200 p-2.5 rounded-xl space-y-1 shadow-2xs">
                    <span className="block font-bold text-red-650">3. Connected Payouts</span>
                    <span className="block text-zinc-500 leading-tight">90% goes to Seller's Stripe. 10% platform fee holds.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/40 text-[10px] text-zinc-500 flex justify-between">
                  <span>Payout Schedule: <strong>Instant Daily Transfers</strong></span>
                  <span className="font-mono text-zinc-400">Status: stripe_connect_v3_onboarded</span>
                </div>
              </div>

              {/* Secret keys configuration helper */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 flex gap-2.5 items-start text-[10px] leading-relaxed text-amber-800">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950">Exchanging Real Money via Stripe Production API</span>
                  To go live and process actual credit card transactions, declare your secret keys in your environment variables:
                  <code className="block mt-1 font-mono bg-amber-100/50 px-1.5 py-0.5 rounded text-amber-900 border border-amber-200/40 whitespace-pre-wrap">
                    STRIPE_SECRET_KEY=sk_live_...&#10;STRIPE_CONNECT_CLIENT_ID=ca_...
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table of Past Orders & Receipts */}
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.05] pb-4">
              <div>
                <h3 className="text-md font-serif font-black text-[#1d1d1f] tracking-tight flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#cb1212]" />
                  Past Orders History & Itemized Receipts
                </h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Audit past feast requests, inspect delivery timeline status, and view itemized receipts for each.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-[#f5f5f7] border border-black/[0.06] px-3.5 py-1 text-[10px] font-mono font-semibold text-[#1d1d1f] uppercase tracking-wider">
                  {orders.length} {orders.length === 1 ? 'Order Record' : 'Order Records'}
                </span>
              </div>
            </div>

            {/* Search & Status Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868b]" />
                <input
                  type="text"
                  placeholder="Filter order ID, kitchen, item..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-black/[0.08] pl-9 pr-3.5 py-2 text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="h-3.5 w-3.5 text-[#86868b] shrink-0 hidden sm:block" />
                {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition whitespace-nowrap active:scale-95 ${
                      statusFilter === st
                        ? 'bg-[#1d1d1f] text-white shadow-xs'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-black/[0.05]">
              <table className="w-full text-left text-xs text-[#1d1d1f] border-collapse">
                <thead>
                  <tr className="bg-[#f5f5f7] border-b border-black/[0.05] text-[10px] font-mono font-semibold uppercase tracking-wider text-[#86868b]">
                    <th className="py-3 px-4">Order Ref & Date</th>
                    <th className="py-3 px-4">Kitchen / Seller</th>
                    <th className="py-3 px-4">Dishes & Items</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Total Price</th>
                    <th className="py-3 px-4 text-center">Receipt Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] bg-white">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#86868b]">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <ShoppingBag className="h-8 w-8 text-[#86868b] stroke-[1.5]" />
                          <p className="text-xs font-semibold text-[#1d1d1f]">No past orders match your criteria.</p>
                          <p className="text-[11px] text-[#86868b] max-w-xs">
                            Place an order in the Marketplace to see detailed itemized receipts and status logs here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusConfig = {
                        Pending: { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock },
                        Preparing: { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: ChefHat },
                        'Out for Delivery': { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Truck },
                        Delivered: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
                        Completed: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
                      }[order.status] || { bg: 'bg-zinc-100 text-zinc-800 border-zinc-200', icon: Clock };

                      const StatusIcon = statusConfig.icon;
                      const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={order.id} className="hover:bg-[#f5f5f7]/60 transition-colors">
                          {/* Order ID & Date */}
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-[#cb1212] block text-[11px]">#{order.id.toUpperCase()}</span>
                            <span className="text-[10px] text-[#86868b] block mt-0.5">{formattedDate}</span>
                          </td>

                          {/* Seller / Kitchen */}
                          <td className="py-3.5 px-4 font-semibold text-[#1d1d1f]">
                            <span className="block">{order.sellerName}</span>
                            <span className="text-[10px] font-normal text-[#86868b] font-mono">ID: {order.sellerId}</span>
                          </td>

                          {/* Dishes Summary */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[10px] font-medium text-[#1d1d1f] border border-black/[0.04]">
                                  <span className="font-bold text-[#cb1212]">{item.quantity}×</span>
                                  <span className="truncate max-w-[130px]">{item.foodItem.title}</span>
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold ${statusConfig.bg}`}>
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              {order.status}
                            </span>
                          </td>

                          {/* Total Price */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-mono font-bold text-sm text-[#1d1d1f] block">${order.total.toFixed(2)}</span>
                            <span className="text-[9px] text-[#86868b] font-mono block">Subtotal: ${order.subtotal.toFixed(2)}</span>
                          </td>

                          {/* Receipt Link */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              id={`btn-view-receipt-${order.id}`}
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] font-semibold text-[11px] transition border border-black/[0.05] shadow-2xs group active:scale-95"
                            >
                              <FileText className="h-3.5 w-3.5 text-[#cb1212] group-hover:scale-110 transition-transform" />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Sandbox Transaction History Ledger */}
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
              <h3 className="text-md font-serif font-black text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-[#cb1212]" />
                Citizen Transaction Ledger
              </h3>
              <span className="rounded-full bg-[#f5f5f7] border border-black/[0.05] px-3 py-0.5 text-[9px] font-mono font-semibold text-[#1d1d1f] uppercase tracking-widest">
                Real-Time Ledger
              </span>
            </div>

            <div className="mt-5 space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-[#86868b]">
                  <p className="text-xs">No recorded neighborhood transactions in memory.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.05] bg-[#f5f5f7]/50 hover:bg-white hover:shadow-sm transition duration-200">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-2xl shrink-0 text-center font-bold text-xs ${
                        tx.type === 'Topup' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : tx.type === 'Purchase' 
                          ? 'bg-rose-50 text-[#cb1212]'
                          : tx.type === 'Income'
                          ? 'bg-blue-50 text-[#007aff]'
                          : 'bg-zinc-100 text-zinc-650'
                      }`}>
                        {tx.type === 'Topup' ? '➕' : tx.type === 'Purchase' ? '🍕' : tx.type === 'Income' ? '🍳' : '🛡️'}
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-[#1d1d1f] leading-snug">{tx.description}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-[#86868b] font-mono">
                          <span>{tx.id.toUpperCase()}</span>
                          <span>•</span>
                          <span>{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold ${
                        tx.type === 'Topup' || tx.type === 'Income'
                          ? 'text-emerald-600' 
                          : 'text-[#1d1d1f]'
                      }`}>
                        {tx.type === 'Topup' || tx.type === 'Income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <p className="text-[9px] text-[#86868b] font-semibold uppercase tracking-wider mt-0.5">{tx.type}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Platform policy guarantee footnote */}
            <div className="mt-5 bg-[#f5f5f7] border border-black/[0.05] rounded-2xl p-4 flex items-start gap-3 text-[11px] text-[#515154] leading-normal">
              <Shield className="h-5 w-5 text-[#cb1212] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#1d1d1f]">Co-Op Pledge Integrity Guarantee</p>
                <p className="text-[#86868b]">
                  Dionysus automatically routes precisely 10% of list-prices to fund direct raw materials for cook-hearths and server maintenance feeds. You can review fee breakdown codes on each finalized ledger ticket.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Itemized Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/[0.06] p-6 sm:p-8 relative space-y-6 animate-scale-up">
            
            {/* Receipt Header Bar */}
            <div className="flex items-start justify-between border-b border-black/[0.05] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-cursive text-2xl text-[#cb1212] leading-none">Dionysus</span>
                  <span className="rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[9px] font-mono font-semibold px-2.5 py-0.5 uppercase tracking-wider border border-black/[0.05]">
                    Itemized Receipt
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                  Official Feast Receipt
                </h3>
                <p className="text-xs text-[#86868b] font-mono mt-0.5">
                  Ref: #{selectedReceiptOrder.id.toUpperCase()} • Issued {new Date(selectedReceiptOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                id="btn-close-receipt-modal"
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition cursor-pointer"
                aria-label="Close Receipt Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Seller & Buyer Info Box */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] p-4 text-xs">
              <div>
                <span className="text-[9px] font-mono font-semibold uppercase text-[#86868b] block">Kitchen / Seller</span>
                <p className="font-bold text-[#1d1d1f] text-sm mt-0.5">{selectedReceiptOrder.sellerName}</p>
                <p className="text-[10px] text-[#86868b] mt-0.5">Kitchen ID: {selectedReceiptOrder.sellerId}</p>
              </div>
              <div className="border-l border-black/[0.06] pl-4">
                <span className="text-[9px] font-mono font-semibold uppercase text-[#86868b] block">Customer / Buyer</span>
                <p className="font-bold text-[#1d1d1f] text-sm mt-0.5">{selectedReceiptOrder.buyerName}</p>
                <p className="text-[10px] text-[#86868b] mt-0.5">Account: {currentUserEmail}</p>
              </div>
            </div>

            {/* Itemized Breakdown Table */}
            <div>
              <h4 className="text-xs font-mono font-semibold text-[#86868b] uppercase tracking-wider mb-2">Itemized Breakdown</h4>
              <div className="rounded-2xl border border-black/[0.05] overflow-hidden">
                <table className="w-full text-left text-xs text-[#1d1d1f]">
                  <thead className="bg-[#f5f5f7] border-b border-black/[0.05] text-[10px] font-mono uppercase text-[#86868b] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {selectedReceiptOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#f5f5f7]/50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.foodItem.image}
                              alt={item.foodItem.title}
                              className="h-9 w-9 rounded-xl object-cover border border-black/[0.05] shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-[#1d1d1f] leading-tight">{item.foodItem.title}</p>
                              <span className="text-[9px] text-[#86868b] font-mono">
                                {item.foodItem.category} • {item.foodItem.sourceType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#1d1d1f]">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#515154]">
                          ${item.foodItem.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#1d1d1f]">
                          ${(item.foodItem.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="rounded-2xl border border-black/[0.05] bg-[#f5f5f7] p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#515154]">
                <span>Food Subtotal</span>
                <span className="font-mono font-semibold">${selectedReceiptOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#515154]">
                <span>Sales Tax (10%)</span>
                <span className="font-mono font-semibold">
                  ${(selectedReceiptOrder.tax ?? selectedReceiptOrder.subtotal * 0.10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#515154]">
                <span>Local Eco Delivery</span>
                <span className="font-mono font-semibold">${selectedReceiptOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#cb1212] bg-white p-2.5 rounded-xl border border-black/[0.05] font-mono">
                <span>Platform Support (10% Co-Op Fee Included)</span>
                <span className="font-bold">${selectedReceiptOrder.platformFee.toFixed(2)}</span>
              </div>
              
              <div className="pt-2 border-t border-black/[0.06] flex justify-between items-center text-sm">
                <span className="font-bold text-[#1d1d1f]">Grand Total Paid</span>
                <span className="font-mono font-bold text-base text-[#cb1212]">
                  ${selectedReceiptOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer Payment Verification */}
            <div className="flex items-center justify-between text-[10px] text-[#86868b] font-mono border-t border-black/[0.05] pt-4">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-[#86868b]" />
                <span>Payment Verified via Stripe Sandbox •••• 4242</span>
              </div>
              <span className="text-emerald-600 font-bold uppercase">Paid & Cleared</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-full border border-black/[0.06] bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] font-semibold py-3 text-xs transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer className="h-4 w-4 text-[#1d1d1f]" />
                Print / Export Receipt
              </button>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="flex-1 rounded-full bg-[#cb1212] hover:bg-[#a30e0e] text-white font-semibold py-3 text-xs transition shadow-xs active:scale-95"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
