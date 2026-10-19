import { useState } from 'react';
import { FoodItem, FoodCategory, SourceType } from '../types';
import { Search, Star, Clock, MapPin, Sparkles, AlertCircle, ShoppingCart, ArrowUpDown, SlidersHorizontal, Home, Store, Compass } from 'lucide-react';

interface MarketplaceProps {
  items: FoodItem[];
  cart: { foodItem: FoodItem; quantity: number }[];
  onAddToCart: (item: FoodItem) => void;
  onInstantBuy: (item: FoodItem) => void;
  onSelectCategory: (category: FoodCategory | 'All') => void;
  selectedCategory: FoodCategory | 'All';
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  locationName?: string;
  isLocating?: boolean;
  isFetchingRestaurants?: boolean;
  onRefreshLocation?: () => void;
}

const CATEGORIES: (FoodCategory | 'All')[] = ['All', 'Hot Meals', 'Bakery', 'Desserts', 'Healthy', 'Homecooked', 'Beverages'];

export function Marketplace({
  items,
  cart,
  onAddToCart,
  onInstantBuy,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  onSearchQueryChange,
  locationName = 'Detecting location...',
  isLocating = false,
  isFetchingRestaurants = false,
  onRefreshLocation,
}: MarketplaceProps) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'homemade' | 'restaurant'>('all');
  const [sortBy, setSortBy] = useState<'quality' | 'closeness' | 'price-asc' | 'price-desc'>('closeness');
  const [maxRadius, setMaxRadius] = useState<number>(3.0);

  // Filter items based on criteria and availability
  const filteredItems = items.filter((item) => {
    // Items must strictly be within the user-specified maxRadius to be listed as local
    if (item.distance > maxRadius) {
      return false;
    }

    const matchesSection =
      activeSection === 'all' ||
      (activeSection === 'homemade' && item.sourceType === 'Homemade') ||
      (activeSection === 'restaurant' && item.sourceType === 'Restaurant');

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSection && matchesCategory && matchesSearch && item.isAvailable;
  });

  // Sort/Rank the filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'quality') {
      return b.sellerRating - a.sellerRating || b.sellerTotalRatings - a.sellerTotalRatings;
    }
    if (sortBy === 'closeness') {
      return a.distance - b.distance;
    }
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Visual Hero Banner - Strict Red & White */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#dc2626] via-[#cb1212] to-[#991b1b] text-white p-8 md:p-12 shadow-[0_8px_30px_rgba(203,18,18,0.2)]">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md text-white shadow-xs">
            <Sparkles className="h-3 w-3 text-amber-300" fill="currentColor" />
            100% Certified Local Kitchens
          </span>
          <div className="space-y-1">
            <p className="font-cursive text-5xl text-rose-100 select-none leading-none">Welcome to the feast</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight pt-1 text-white">
              Rent a Plate from Your Neighbor's Table.
            </h2>
          </div>
          <p className="text-xs md:text-sm text-rose-100 max-w-lg font-normal leading-relaxed">
            Order delicious direct hot meals, baked treats, and fresh artisan foods crafted with love by registered chefs in your local community. 
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-rose-200" />
              <input
                id="search-input"
                type="text"
                placeholder="Search favorite foods, tags, or bakeries..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full rounded-full bg-white/15 py-2.5 pr-4 pl-10 text-xs md:text-sm text-white placeholder-rose-200 backdrop-blur-md border border-white/25 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white focus:text-zinc-900 focus:placeholder-zinc-400 transition-all font-medium"
              />
            </div>
          </div>
        </div>
        {/* Soft Radial Highlights */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-[20%] -mb-40 h-80 w-80 rounded-full bg-red-400/20 blur-3xl"></div>
      </div>

      {/* Interactive Sections & Ranking controls */}
      <div className="space-y-4 bg-white border border-red-100 rounded-3xl p-6 shadow-xs">
        {/* The Main Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 animate-fade-in max-w-2xl">
            <h3 className="font-serif text-lg font-black text-zinc-950 tracking-tight flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#cb1212]" />
              Gather Around the Neighbor’s Table
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Discover delicious hand-cooked dishes shared by local neighbors, or order professional gourmet meals from actual, verified nearby restaurants.
            </p>
          </div>

          {/* Real-time Geolocation Status / Badge */}
          <div className="flex flex-wrap items-center gap-2 rounded-full bg-rose-50/70 border border-red-100 p-1.5 text-xs font-semibold text-zinc-900">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-2xs border border-red-100">
              <MapPin className="h-3.5 w-3.5 text-[#cb1212] animate-bounce" />
              <span className="font-bold text-[#cb1212] font-mono text-[11px]">{locationName}</span>
            </div>
            {onRefreshLocation && (
              <button
                onClick={onRefreshLocation}
                disabled={isLocating || isFetchingRestaurants}
                className="px-3 py-1 rounded-full bg-[#cb1212] hover:bg-[#a30e0e] text-white text-[11px] font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
              >
                <span>🔄</span>
                {isLocating ? 'Locating...' : isFetchingRestaurants ? 'Fetching...' : 'Re-detect'}
              </button>
            )}
          </div>
        </div>

        {/* Minitabs (Home Cooked and Restaurants) - Strict Red & White */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-100 pb-4">
          <div className="inline-flex rounded-full bg-rose-50/70 p-1 select-none border border-red-100">
            <button
              id="section-btn-all"
              onClick={() => setActiveSection('all')}
              className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                activeSection === 'all'
                  ? 'bg-[#cb1212] text-white shadow-md shadow-red-600/20'
                  : 'text-zinc-600 hover:text-[#cb1212]'
              }`}
            >
              <span>✨</span> All Kitchens
            </button>
            <button
              id="section-btn-homemade"
              onClick={() => setActiveSection('homemade')}
              className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                activeSection === 'homemade'
                  ? 'bg-[#cb1212] text-white shadow-md shadow-red-600/20'
                  : 'text-zinc-600 hover:text-[#cb1212]'
              }`}
            >
              <Home className="h-3.5 w-3.5 shrink-0" /> Home Cooked
            </button>
            <button
              id="section-btn-restaurant"
              onClick={() => setActiveSection('restaurant')}
              className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                activeSection === 'restaurant'
                  ? 'bg-[#cb1212] text-white shadow-md shadow-red-600/20'
                  : 'text-zinc-600 hover:text-[#cb1212]'
              }`}
            >
              <Store className="h-3.5 w-3.5 shrink-0" /> Restaurants
            </button>
          </div>

          {/* Info pill about local radius and Dynamic Radius Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-rose-50/60 border border-red-100 rounded-full px-3.5 py-1.5 text-xs font-bold text-zinc-900">
              <Compass className="h-3.5 w-3.5 text-[#cb1212] shrink-0" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mr-1">Radius:</span>
              <select
                id="radius-select"
                value={maxRadius}
                onChange={(e) => setMaxRadius(parseFloat(e.target.value))}
                className="bg-transparent outline-none border-none focus:ring-0 text-[#cb1212] cursor-pointer font-sans text-xs font-bold py-0 pr-6 pl-0"
              >
                <option value="0.5">0.5 miles (Walking)</option>
                <option value="1.25">1.25 miles (Local Neighborhood)</option>
                <option value="3.0">3.0 miles (Quick Delivery)</option>
                <option value="5.0">5.0 miles (City-wide)</option>
                <option value="10.0">10.0 miles (Regional)</option>
                <option value="25.0">25.0 miles (Greater Area)</option>
              </select>
            </div>

            {activeSection === 'restaurant' && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-[#cb1212] animate-fade-in self-start sm:self-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cb1212]"></span>
                </span>
                <span>Restaurants within {maxRadius} miles</span>
              </div>
            )}
            {activeSection === 'homemade' && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-[#cb1212] animate-fade-in self-start sm:self-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cb1212]"></span>
                </span>
                <span>Homemade food within {maxRadius} miles</span>
              </div>
            )}
            {activeSection === 'all' && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-[#cb1212] animate-fade-in self-start sm:self-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cb1212]"></span>
                </span>
                <span>All listings within {maxRadius} miles</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Categories scrubber & Sorting selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category List Scrollbar */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Category Groups</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  id={`category-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(category)}
                  className={`flex-none rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                    selectedCategory === category
                      ? 'bg-[#cb1212] text-white shadow-xs'
                      : 'bg-rose-50/60 text-zinc-700 hover:bg-rose-100/60 hover:text-[#cb1212]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Ranking select item */}
          <div className="lg:w-72 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Sort Dishes By</span>
            <div className="relative flex items-center gap-2 bg-rose-50/60 border border-red-100 hover:border-red-200 rounded-full px-3.5 py-1.5 text-xs font-bold text-zinc-900 transition-all cursor-pointer select-none">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#cb1212] shrink-0" />
              <select
                id="rank-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-transparent outline-none border-none focus:ring-0 text-[#cb1212] cursor-pointer font-sans font-bold"
              >
                <option value="closeness">Closeness • Nearest First</option>
                <option value="quality">Quality • Top Rated First</option>
                <option value="price-asc">Price • Lowest First</option>
                <option value="price-desc">Price • Highest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary tag stats bar */}
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500 bg-rose-50/50 border border-red-100 px-4 py-2 rounded-full">
          <span className="uppercase">Filter Mode: {activeSection.toUpperCase()}</span>
          <span className="text-[#cb1212] font-sans font-extrabold">{sortedItems.length} active dishes available</span>
        </div>
      </div>

      {/* Food Grid */}
      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
            <Search className="h-6 w-6" />
          </div>
          <h4 className="mt-4 text-sm font-bold text-zinc-950">No culinary delights found</h4>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">We couldn't match any food item with your current search parameters. Trying listing custom culinary requests or search generic tags!</p>
          <button 
            onClick={() => { onSearchQueryChange(''); onSelectCategory('All'); setActiveSection('all'); }}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => {
            const inCart = cart.find((c) => c.foodItem.id === item.id)?.quantity || 0;
            return (
              <div
                id={`food-card-${item.id}`}
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Distance Badge & Image Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#f5f5f7]">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#1d1d1f] shadow-xs backdrop-blur-md border border-black/5">
                      <MapPin className="h-3 w-3 text-[#cb1212]" />
                      {item.distance} mi
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#1d1d1f] shadow-xs backdrop-blur-md border border-black/5">
                      <Clock className="h-3 w-3 text-[#cb1212]" />
                      {item.prepTime} min
                    </span>
                  </div>
                  {/* Category overlay pill */}
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#1d1d1f]/90 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-white backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                {/* Listing Details */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-1.5">
                    {/* Seller details with rating */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-zinc-900 truncate max-w-[90px] sm:max-w-[110px]">{item.sellerName}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border shrink-0 ${
                          item.sourceType === 'Homemade'
                            ? 'text-[#cb1212] bg-rose-50 border-rose-100'
                            : 'text-zinc-800 bg-zinc-100 border-zinc-200'
                        }`}>
                          {item.sourceType === 'Homemade' ? (
                            <>
                              <Home className="h-2.5 w-2.5 shrink-0 text-[#cb1212]" />
                              <span>Home</span>
                            </>
                          ) : (
                            <>
                              <Store className="h-2.5 w-2.5 shrink-0 text-zinc-700" />
                              <span>Eatery</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 font-bold text-zinc-900 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {item.sellerRating.toFixed(1)} <span className="text-[10px] text-zinc-400 font-normal">({item.sellerTotalRatings})</span>
                      </span>
                    </div>

                    <h4 
                      onClick={() => setSelectedItem(item)}
                      className="text-base font-bold text-zinc-950 line-clamp-1 group-hover:text-[#cb1212] cursor-pointer transition-colors pt-0.5"
                    >
                      {item.title}
                    </h4>
                    
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-rose-50/70 text-[#cb1212] font-semibold rounded-full px-2.5 py-0.5 border border-red-100/60">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions and Pricing */}
                  <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-3.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#86868b] font-semibold uppercase tracking-wider">Price</span>
                      <span className="text-lg font-bold text-[#1d1d1f] font-mono">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`item-buy-now-${item.id}`}
                        onClick={() => onInstantBuy(item)}
                        className="rounded-full bg-[#cb1212] hover:bg-[#a30e0e] text-white text-xs font-semibold px-4 py-2 transition-all active:scale-95 shadow-xs"
                      >
                        Order Now
                      </button>
                      <button
                        id={`item-add-cart-${item.id}`}
                        onClick={() => onAddToCart(item)}
                        className={`relative rounded-full p-2 text-xs font-semibold border transition-all active:scale-95 ${
                          inCart > 0
                            ? 'bg-rose-50 text-[#cb1212] border-rose-200'
                            : 'bg-[#f5f5f7] text-[#1d1d1f] border-black/[0.05] hover:bg-[#e5e5ea]'
                        }`}
                        title="Add to Shopping Bag"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {inCart > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-[9px] font-extrabold text-white ring-2 ring-white animate-scale">
                            {inCart}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official & Legal Compliance Footer Disclaimer */}
      <div className="mt-8 rounded-2xl bg-zinc-50 border border-zinc-200/50 p-5 space-y-3.5 animate-fade-in text-zinc-500 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓</span>
            <span className="font-bold text-zinc-800 uppercase tracking-wider text-[10px]">100% Legal & Compliant</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">Database License: ODbL • Media: Public Domain</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
          <div className="space-y-1">
            <h5 className="font-bold text-zinc-700">Nominative Fair Use Protection</h5>
            <p className="text-zinc-500">
              The listing of trademarked establishment names (such as <strong>PizzaExpress</strong>, <strong>Nando's</strong>, <strong>Wagamama</strong>, etc.) is used solely for descriptive and informational identification of actual local businesses relative to your current browser geolocation. This factual usage is fully protected under <strong>Nominative Fair Use</strong> and does not imply official endorsement, sponsorship, or affiliation.
            </p>
          </div>
          
          <div className="space-y-1">
            <h5 className="font-bold text-zinc-700">Permitted Media & Open Data Attribution</h5>
            <p className="text-zinc-500">
              Restaurant geographical coordinates and operational names are retrieved securely from open-source maps powered by <strong>© OpenStreetMap contributors</strong> under the Open Database License (ODbL). All high-quality official-looking food images are published under the royalty-free <strong>Unsplash License</strong>, permitting worldwide commercial use with zero copyright restrictions.
            </p>
          </div>
        </div>
      </div>

      {/* Food Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-black/[0.06] animate-scale-up">
            {/* Image Header with close option */}
            <div className="relative aspect-video w-full bg-[#f5f5f7]">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition cursor-pointer active:scale-95"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 flex gap-1.5">
                <span className="rounded-full bg-[#1d1d1f]/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  {selectedItem.category}
                </span>
              </div>
            </div>

            {/* Food Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#1d1d1f]">{selectedItem.title}</h3>
                  <p className="text-xs text-[#86868b] mt-1">Made fresh by <strong className="text-[#cb1212]">{selectedItem.sellerName}</strong> • {selectedItem.distance} miles away</p>
                </div>
                <span className="text-2xl font-bold text-[#1d1d1f] font-mono">${selectedItem.price.toFixed(2)}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#515154] leading-relaxed bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.04]">
                {selectedItem.description}
              </p>

              {/* Commission disclosure note */}
              <div className="flex items-start gap-2.5 rounded-2xl bg-orange-50/70 border border-orange-200/60 p-3.5 text-xs text-orange-950">
                <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-orange-950">10% Platform Contribution Included</h5>
                  <p className="mt-0.5 text-orange-900/80">To build self-sustaining local channels, <strong>10% of this sale (${(selectedItem.price * 0.10).toFixed(2)})</strong> is forwarded back to developers for platform verification and local food security programs.</p>
                </div>
              </div>

              {/* Culinary details table */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-black/[0.05] bg-[#f5f5f7] p-3.5 text-center text-xs">
                <div>
                  <span className="block text-[#86868b] font-semibold uppercase text-[10px]">Prep Estimate</span>
                  <span className="block mt-0.5 font-bold text-[#1d1d1f]">{selectedItem.prepTime} minutes</span>
                </div>
                <div className="border-x border-black/[0.06]">
                  <span className="block text-[#86868b] font-semibold uppercase text-[10px]">Distance</span>
                  <span className="block mt-0.5 font-bold text-[#1d1d1f]">{selectedItem.distance} miles</span>
                </div>
                <div>
                  <span className="block text-[#86868b] font-semibold uppercase text-[10px]">Rating</span>
                  <span className="block mt-0.5 font-bold text-[#1d1d1f] flex items-center justify-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {selectedItem.sellerRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  id="modal-add-to-cart"
                  onClick={() => {
                    onAddToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 rounded-full border border-black/[0.06] bg-[#f5f5f7] py-3 text-xs font-semibold text-[#1d1d1f] hover:bg-[#e5e5ea] transition active:scale-95"
                >
                  Add to Bag
                </button>
                <button
                  id="modal-checkout-instant"
                  onClick={() => {
                    onInstantBuy(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 rounded-full bg-[#cb1212] py-3 text-xs font-semibold text-white hover:bg-[#a30e0e] shadow-md shadow-red-600/10 transition active:scale-95"
                >
                  Buy Instantly
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
