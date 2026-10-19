import React, { useState } from 'react';
import { FoodItem, Order, FoodCategory, SourceType } from '../types';
import { Plus, ChefHat, CheckCircle2, TrendingUp, DollarSign, HelpCircle, Utensils, AlertTriangle, Shield, Lock, CreditCard } from 'lucide-react';

interface SellerDashboardProps {
  items: FoodItem[];
  orders: Order[];
  onAddListing: (listing: Omit<FoodItem, 'id' | 'sellerId' | 'sellerName' | 'sellerRating' | 'sellerTotalRatings'>) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: 'Preparing' | 'Out for Delivery' | 'Delivered') => void;
  sellerId: string;
  isSellerPaid: boolean;
  onPaySellerFee: () => void;
}

const TEMPLATE_IMAGES = [
  { name: 'Warm Soup / Chili', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=600' },
  { name: 'Fresh Woodfired Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600' },
  { name: 'Artisan Pastry / Scone', url: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?auto=format&fit=crop&q=80&w=600' },
  { name: 'Fresh Leafy Salad', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' },
  { name: 'Golden Pastry crust', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600' },
  { name: 'Sweet Baked Berry Waffle', url: 'https://images.unsplash.com/photo-1519676867240-f03562fa1493?auto=format&fit=crop&q=80&w=600' },
];

export function SellerDashboard({
  items,
  orders,
  onAddListing,
  onUpdateOrderStatus,
  sellerId,
  isSellerPaid,
  onPaySellerFee,
}: SellerDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Hot Meals');
  const [sourceType, setSourceType] = useState<SourceType>('Homemade');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('20');
  const [distance, setDistance] = useState('1.5');
  const [tagsInput, setTagsInput] = useState('Artisanal, Hot');
  const [selectedImgUrl, setSelectedImgUrl] = useState(TEMPLATE_IMAGES[0].url);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImgUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImgUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter listings and orders belonging to this kitchen/seller
  const myListings = items.filter((item) => item.sellerId === sellerId);
  const myOrders = orders.filter((order) => order.sellerId === sellerId);

  // Financial calculations
  // Deduct 20% platform share
  const grossIncome = myOrders
    .filter((o) => o.status === 'Delivered' || o.status === 'Completed' || o.status === 'Preparing' || o.status === 'Out for Delivery')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const platformShare = grossIncome * 0.10; // 10% of sales goes to application owner
  const netEarnings = grossIncome * 0.90; // 90% kept by the seller

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddListing({
      title,
      price: parsedPrice,
      category,
      sourceType,
      description,
      prepTime: parseInt(prepTime) || 15,
      distance: parseFloat(distance) || 1.0,
      tags,
      image: selectedImgUrl,
      isAvailable: true,
    });

    // Reset Form
    setTitle('');
    setPrice('');
    setCategory('Hot Meals');
    setSourceType('Homemade');
    setDescription('');
    setTagsInput('Artisanal');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="font-cursive text-3.5xl text-red-650 leading-none select-none block">Dionysian Hearth</span>
          <h2 className="text-2xl font-serif font-black text-zinc-950 tracking-tight leading-none mt-1">Host Kitchen Hub</h2>
          <p className="text-xs text-zinc-500 mt-1.5">Manage your local menu listings, review incoming foodie requests, and analyze earnings.</p>
        </div>
        <button
          id="btn-toggle-add-listing"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/10 hover:bg-red-700 transition self-start"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Close Food Maker' : 'Create Food Listing'}
        </button>
      </div>

      {/* Seller $10 Flat Access Fee Card or Verification Banner */}
      {!isSellerPaid ? (
        <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/20 shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-serif font-black text-zinc-950">Seller Registration Required</h3>
                  <span className="rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                    $10.00 Flat (No Added Tax)
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                  Each account must pay this $10 charge without additional taxes to activate food selling privileges on Dionysus.
                </p>
              </div>
            </div>
            <div className="bg-white border border-rose-200 rounded-2xl px-4 py-2.5 text-center shrink-0 shadow-2xs">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 block font-mono">Seller Access Charge</span>
              <span className="text-xl font-mono font-black text-red-600">$10.00</span>
              <span className="text-[9px] text-emerald-600 font-bold block">+ $0.00 Tax Exempt</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white rounded-xl p-3 border border-zinc-200/80">
              <span className="text-zinc-400 text-[9px] font-bold uppercase block font-mono">Fee Amount</span>
              <span className="font-mono font-bold text-zinc-850 text-sm">$10.00 Flat</span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-zinc-200/80">
              <span className="text-zinc-400 text-[9px] font-bold uppercase block font-mono">Tax Rate</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">0% (No Tax)</span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-zinc-200/80">
              <span className="text-zinc-400 text-[9px] font-bold uppercase block font-mono">Payout Engine</span>
              <span className="font-mono font-bold text-zinc-850 text-sm">Stripe Connect Instant</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-red-600" />
                Pay $10 Seller Charge via Stripe
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Stripe Direct Charge
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                defaultValue="4242 •••• •••• 4242"
                readOnly
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 font-mono font-bold text-zinc-700"
              />
              <input
                type="text"
                defaultValue="12/28  CVC: 888"
                readOnly
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 font-mono font-bold text-zinc-700"
              />
            </div>
            <button
              id="btn-pay-seller-fee"
              onClick={onPaySellerFee}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-xs transition shadow-md shadow-red-600/10 flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Pay $10.00 Flat & Unlock Food Selling
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50/90 border border-emerald-200/80 p-4 text-emerald-950 text-xs font-bold shadow-2xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-sm font-serif font-bold text-emerald-950">Seller License Verified</span>
              <span className="block text-[11px] text-emerald-800 font-normal mt-0.5">
                $10.00 flat seller account fee paid via Stripe (without additional taxes). You have full food listing access.
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[10px] font-mono text-emerald-800 font-bold uppercase shrink-0">
            $10 Flat Paid • Tax $0.00
          </span>
        </div>
      )}

      {/* Finance Metrics Overview Card */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Gross revenue card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Gross Co-Op Sales</span>
            <span className="rounded-lg bg-zinc-50 p-2 text-zinc-500">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-mono font-bold text-zinc-950">${grossIncome.toFixed(2)}</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Total revenue generated through listed orders.</p>
          </div>
        </div>

        {/* 20% platform commission note card */}
        <div className="rounded-2xl border border-red-100 bg-red-50/20 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Platform Administration Contribution</span>
            <span className="rounded-lg bg-red-100 p-2 text-red-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h4 id="platform-share-value" className="text-2xl font-mono font-extrabold text-red-600">${platformShare.toFixed(2)}</h4>
            <p className="text-[10px] text-red-700/80 font-medium mt-1">10% deducted fee automatically provided to administrator.</p>
          </div>
        </div>

        {/* Net seller earnings */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Net Pocketed Profit</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-mono font-bold text-emerald-700">${netEarnings.toFixed(2)}</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Your pure take-home kitchen earnings (90% of sales).</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Bar */}
      {grossIncome > 0 && (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
          <h5 className="text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wide">Sales Split Breakdown</h5>
          <div className="relative h-6 w-full overflow-hidden rounded-lg bg-zinc-200 flex">
            <div 
              style={{ width: '90%' }} 
              className="bg-emerald-600 h-full flex items-center justify-center text-[10px] font-bold text-white"
              title="Your share (90%)"
            >
              90% Your Profit
            </div>
            <div 
              style={{ width: '10%' }} 
              className="bg-red-600 h-full flex items-center justify-center text-[10px] font-bold text-white"
              title="Platform Fee (10%)"
            >
              10% Platform Fee
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 text-center">Transparent financial models keep community-led logistics healthy and accessible!</p>
        </div>
      )}

      {/* Add New Listing Form Overlay Mode */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-red-100 bg-white p-6 shadow-md space-y-4 animate-scale-up">
          <div className="border-b border-rose-100 pb-3">
            <h3 className="text-md font-extrabold text-zinc-900 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-red-600" />
              Post Your Culinary Special
            </h3>
            <p className="text-xs text-zinc-500">List high-quality homemade dishes for local foodies. Remember 10% contribution is itemized automatically.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Dish Name</label>
              <input
                id="form-dish-title"
                type="text"
                required
                placeholder="e.g., Authentic Homemade Neapolitan Pizza"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Portion Menu Listing Price ($ USD)</label>
              <input
                id="form-dish-price"
                type="number"
                step="0.01"
                min="0.50"
                required
                placeholder="e.g., 12.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400 block font-mono">
                {price ? `You receive $${(parseFloat(price) * 0.90 || 0).toFixed(2)} after 10% commission` : '10% commission applied on checkout.'}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Food Group Category</label>
              <select
                id="form-dish-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              >
                <option value="Hot Meals">Hot Meals</option>
                <option value="Bakery">Bakery</option>
                <option value="Desserts">Desserts</option>
                <option value="Healthy">Healthy</option>
                <option value="Homecooked">Homecooked</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Kitchen Type (Source)</label>
              <select
                id="form-dish-source-type"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none text-zinc-800 font-medium"
              >
                <option value="Homemade">Homemade (Neighborhood Kitchen)</option>
                <option value="Restaurant">Restaurant (Registered Eatery)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Prep Estimate (minutes)</label>
              <input
                id="form-dish-prep"
                type="number"
                min="1"
                required
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Local Delivery Radius (miles)</label>
              <input
                id="form-dish-distance"
                type="number"
                step="0.1"
                required
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 font-sans">Short Appetizing Description</label>
            <textarea
              id="form-dish-description"
              required
              rows={2}
              placeholder="Detail ingredients, organic sources, allergens, warming instructions or flavor profiles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">Comma-separated Tags (e.g. Vegetarian, Spiked, Organic)</label>
            <input
              id="form-dish-tags"
              type="text"
              placeholder="e.g., Organic, Spicy, Gluten-Free"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
            />
          </div>

          {/* Custom Photo Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block flex items-center gap-1.5 justify-between">
              <span>Dish Portrait Image</span>
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600 border border-red-105 uppercase tracking-widest">Supports Actual Device Files</span>
            </label>
            
            <div className="grid sm:grid-cols-5 gap-3">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`sm:col-span-3 relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer min-h-[110px] ${
                  isDragging 
                    ? 'border-red-600 bg-rose-50/50 scale-[0.98]' 
                    : 'border-zinc-200 hover:border-red-500 hover:bg-zinc-50/30'
                }`}
              >
                <input
                  type="file"
                  id="dish-photo-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="space-y-1 text-center pointer-events-none">
                  <span className="text-2xl">📸</span>
                  <p className="text-[11px] font-bold text-zinc-700">Drag & drop your photo, or <span className="text-red-500 underline">browse device</span></p>
                  <p className="text-[9px] text-zinc-400 font-mono">Accepts JPG, PNG, WEBP files</p>
                </div>
              </div>

              {/* Active Image Visualizer */}
              <div className="sm:col-span-2 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl p-2 relative overflow-hidden min-h-[110px] group">
                {selectedImgUrl ? (
                  <>
                    <img
                      src={selectedImgUrl}
                      alt="Active Dish Portrait"
                      className="absolute inset-0 h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-extrabold text-white bg-black/60 px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest">Active Preview</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-zinc-400 pointer-events-none">
                    <p className="text-[10px] uppercase font-bold tracking-wider">No Image selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preset image selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block text-zinc-500 text-[10px] uppercase tracking-wide">Or select from quick templates:</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {TEMPLATE_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  id={`preset-img-btn-${img.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedImgUrl(img.url)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImgUrl === img.url
                      ? 'border-red-600 ring-2 ring-red-100 scale-95'
                      : 'border-transparent hover:border-zinc-300'
                  }`}
                  title={img.name}
                >
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/50 text-[8px] font-semibold text-white truncate p-0.5 text-center">{img.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="form-submit-listing-btn"
            type="submit"
            className="w-full rounded-xl bg-red-600 py-3 text-xs font-extrabold text-white shadow-md shadow-red-600/10 hover:bg-red-700 transition"
          >
            Submit Listing and Publish Live
          </button>
        </form>
      )}

      {/* Incoming Requests / Cooking Stage Orders */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-md font-bold text-zinc-950">Active Customer Orders ({myOrders.length})</h3>
          <p className="text-xs text-zinc-400">Process incoming menus, prepare dishes, and prompt real-time local couriers.</p>
        </div>

        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
            <ChefHat className="h-10 w-10 text-zinc-300 animate-bounce" />
            <h5 className="mt-4 text-xs font-bold text-zinc-800">No client orders yet</h5>
            <p className="text-[11px] text-zinc-400 max-w-xs mt-1">When customers order dishes from your kitchen, they will show up here immediately with tracking updates.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead>
                <tr className="border-b border-zinc-100 font-bold text-zinc-400 uppercase text-[10px]">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Buyer</th>
                  <th className="py-2.5">Ordered Food</th>
                  <th className="py-2.5">Cost Split (Gross vs Yours)</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-850">
                {myOrders.map((order) => {
                  return (
                    <tr id={`seller-order-row-${order.id}`} key={order.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 font-mono font-bold text-red-600">#{order.id.slice(0, 8)}</td>
                      <td className="py-3">
                        <span className="block font-bold">{order.buyerName}</span>
                        <span className="text-[10px] text-zinc-400">Buyer Rating: 5.0★</span>
                      </td>
                      <td className="py-3 max-w-[150px] truncate">
                        {order.items.map((it) => `${it.quantity}x ${it.foodItem.title}`).join(', ')}
                      </td>
                      <td className="py-3">
                        <span className="block font-bold">${order.subtotal.toFixed(2)} total</span>
                        <span className="text-[10px] text-zinc-400 block">Your share: ${(order.subtotal * 0.90).toFixed(2)} (90%)</span>
                        <span className="text-[9px] text-red-600 block leading-tight">Admin Fee: ${(order.subtotal * 0.10).toFixed(2)} (10%)</span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] uppercase font-bold ${
                          order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'Preparing' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {order.status === 'Pending' && (
                          <button
                            id={`action-prep-${order.id}`}
                            onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                            className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600 hover:bg-orange-100 transition"
                          >
                            Accept & Cook
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            id={`action-dispatch-${order.id}`}
                            onClick={() => onUpdateOrderStatus(order.id, 'Out for Delivery')}
                            className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 transition"
                          >
                            Dispatch Courier
                          </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button
                            id={`action-delivered-${order.id}`}
                            onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                            className="rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600 hover:bg-green-100 transition"
                          >
                            Set Delivered
                          </button>
                        )}
                        {(order.status === 'Delivered' || order.status === 'Completed') && (
                          <span className="text-zinc-400 text-[10px] italic">Courier completed delivery</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current Active Kitchen Listings */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-md font-bold text-zinc-950">Your Kitchen Listings ({myListings.length})</h3>
          <p className="text-xs text-zinc-400">Menus you listed in the shared marketplace feed.</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((listing) => (
            <div key={listing.id} className="flex gap-3 items-center p-3 rounded-xl border border-zinc-100">
              <img src={listing.image} alt={listing.title} className="h-12 w-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-zinc-950 text-xs truncate">{listing.title}</h5>
                <span className="text-[10px] text-zinc-500 font-mono block">${listing.price.toFixed(2)} • {listing.category}</span>
                <span className="text-[9px] text-green-600 font-bold inline">{listing.isAvailable ? '● Active' : '● Paused'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
