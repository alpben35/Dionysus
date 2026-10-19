import { useState, useEffect } from 'react';
import { FoodItem, CartItem, Order, FoodCategory } from './types';
import { DEFAULT_FOOD_ITEMS, DEFAULT_MOCK_ORDERS } from './data/defaultFood';
import { fetchActualNearbyRestaurants } from './utils/geolocation';
import { Navigation } from './components/Navigation';
import { Marketplace } from './components/Marketplace';
import { SellerDashboard } from './components/SellerDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { DeliveryTracker } from './components/DeliveryTracker';
import { RatingModal } from './components/RatingModal';
import { AccountPage } from './components/AccountPage';
import { AuthScreen } from './components/AuthScreen';
import { HelpCircle, RefreshCcw, Landmark, Sparkles, Star, Heart, Check } from 'lucide-react';

export default function App() {
  // State Initialization with robust try-catch wrappers to prevent white screen outputs
  const [currentRole, setCurrentRole] = useState<'buyer' | 'seller' | 'account'>('buyer');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('dionysus_logged_in_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem('cs_food_items');
      if (saved) {
        const parsed: FoodItem[] = JSON.parse(saved);
        return parsed.map((item) => ({
          ...item,
          sourceType: item.sourceType || 'Homemade',
        }));
      }
      return DEFAULT_FOOD_ITEMS;
    } catch (e) {
      console.warn("Dionysus state corruption check: Resetting dishes", e);
      localStorage.removeItem('cs_food_items');
      return DEFAULT_FOOD_ITEMS;
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      localStorage.removeItem('cs_cart');
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('cs_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_MOCK_ORDERS as Order[];
    } catch (e) {
      localStorage.removeItem('cs_orders');
      return DEFAULT_MOCK_ORDERS as Order[];
    }
  });
  const [userBalance, setUserBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cs_balance');
      return saved ? parseFloat(saved) : 85.00;
    } catch (e) {
      return 85.00;
    }
  });

  // Seller Flat $10 Registration Charge state (without additional taxes)
  const [isSellerPaid, setIsSellerPaid] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cs_seller_paid') === 'true';
    } catch {
      return false;
    }
  });

  const handlePaySellerFee = () => {
    setIsSellerPaid(true);
    localStorage.setItem('cs_seller_paid', 'true');
    // Save transaction entry in ledger
    const newTx = {
      id: `tx_seller_fee_${Date.now()}`,
      type: 'FeeDeduction',
      amount: 10.00,
      description: 'Stripe Seller Account License Fee ($10.00 Flat - No Added Tax)',
      date: new Date().toISOString()
    };
    try {
      const existing = localStorage.getItem('dionysus_topups_ledger');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('dionysus_topups_ledger', JSON.stringify([newTx, ...parsed]));
    } catch (e) {
      console.warn("Could not record seller fee ledger entry", e);
    }
  };

  // User Profile Ratings
  const [buyerRating, setBuyerRating] = useState(4.9);
  const [sellerRating, setSellerRating] = useState(4.8);

  // Progressive Dionysian feast loading sequence
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Pouring Nectar of the Neighbors...');

  // Filter/Search variables (Buyer)
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeRatingOrder, setActiveRatingOrder] = useState<{ order: Order; role: 'buyer' | 'seller' } | null>(null);

  // Seller credentials
  const CURRENT_SELLER_ID = 's_local_user';
  const CURRENT_SELLER_NAME = 'Your Dionysian Kitchen';

  // Geolocation and actual restaurants state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting your location...');
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingRestaurants, setIsFetchingRestaurants] = useState(false);

  // Trigger geolocation lookup and fetch actual nearby restaurants
  const handleRefreshLocation = async () => {
    setIsLocating(true);
    const defaultLat = 51.5074;
    const defaultLng = -0.1278;

    const runWithCoords = async (lat: number, lng: number, name: string) => {
      setUserLocation({ lat, lng });
      setLocationName(name);
      setIsLocating(false);
      setIsFetchingRestaurants(true);
      try {
        const actualRestaurants = await fetchActualNearbyRestaurants(lat, lng);
        if (actualRestaurants.length > 0) {
          setFoodItems((prev) => {
            // Retain Homemade items, replace existing Restaurant items with actual ones
            const homemadeItems = prev.filter(item => item.sourceType === 'Homemade');
            return [...homemadeItems, ...actualRestaurants];
          });
        }
      } catch (err) {
        console.error("Failed to load actual nearby restaurants:", err);
      } finally {
        setIsFetchingRestaurants(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          await runWithCoords(lat, lng, `Nearby (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        },
        async (error) => {
          console.warn("Geolocation denied or error, using default London:", error);
          await runWithCoords(defaultLat, defaultLng, "Westminster, London (Simulation Default)");
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      await runWithCoords(defaultLat, defaultLng, "Westminster, London (Simulation Default)");
    }
  };

  useEffect(() => {
    handleRefreshLocation();
  }, []);

  // Loading Sequence Timer
  useEffect(() => {
    const stages = [
      'Pouring Nectar of the Neighbors...',
      'Locating your browser coordinates...',
      'Querying Overpass API for actual local restaurants...',
      'Assembling real kitchen menus near you...',
      'Dionysus Welcomes You to the Feast!'
    ];
    let index = 0;
    const stageInterval = setInterval(() => {
      index++;
      if (index < stages.length) {
        setLoadingStage(stages[index]);
      }
    }, 600);

    const finishTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2400);

    return () => {
      clearInterval(stageInterval);
      clearTimeout(finishTimeout);
    };
  }, []);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('cs_food_items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('cs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cs_balance', userBalance.toString());
  }, [userBalance]);

  // Real-Time Delivery Simulation Engine (Interval timer)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        let modified = false;
        const nextOrders = prevOrders.map((order) => {
          // Increment tracking values for active orders
          if (order.status === 'Preparing') {
            modified = true;
            const nextProgress = order.deliveryProgress + 10;
            if (nextProgress >= 100) {
              return {
                ...order,
                status: 'Out for Delivery' as const,
                deliveryStep: 2,
                deliveryProgress: 0,
              };
            }
            return { ...order, deliveryProgress: nextProgress };
          }

          if (order.status === 'Out for Delivery') {
            modified = true;
            const nextProgress = order.deliveryProgress + 15;
            if (nextProgress >= 100) {
              // Mark order as delivered, prompt for rating!
              setTimeout(() => {
                setActiveRatingOrder({ order: { ...order, status: 'Delivered', deliveryStep: 3, deliveryProgress: 100 }, role: 'buyer' });
              }, 400);

              return {
                ...order,
                status: 'Delivered' as const,
                deliveryStep: 3,
                deliveryProgress: 100,
              };
            }
            return { ...order, deliveryProgress: nextProgress };
          }

          return order;
        });

        return modified ? nextOrders : prevOrders;
      });
    }, 4000); // Progress ticking tick cycles

    return () => clearInterval(interval);
  }, []);

  // Action: Add Listing (Seller Mode)
  const handleAddListing = (listing: Omit<FoodItem, 'id' | 'sellerId' | 'sellerName' | 'sellerRating' | 'sellerTotalRatings'>) => {
    const newItem: FoodItem = {
      ...listing,
      id: 'f_user_' + Date.now(),
      sellerId: CURRENT_SELLER_ID,
      sellerName: CURRENT_SELLER_NAME,
      sellerRating: 5.0,
      sellerTotalRatings: 1,
    };

    setFoodItems((prev) => [newItem, ...prev]);
  };

  // Action: Add to Cart (Buyer Mode)
  const handleAddToCart = (item: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.foodItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.foodItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { foodItem: item, quantity: 1 }];
    });
  };

  // Action: One-click "Buy Now" triggers Cart reset & checkout
  const handleInstantBuy = (item: FoodItem) => {
    setCart([{ foodItem: item, quantity: 1 }]);
    setIsCartOpen(true);
  };

  // Cart quantity adjusters
  const handleUpdateCartQuantity = (itemId: string, qty: number) => {
    setCart((prev) => prev.map((c) => (c.foodItem.id === itemId ? { ...c, quantity: qty } : c)));
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.foodItem.id !== itemId));
  };

  // Secure checkout completion handler
  const handleConfirmPurchase = (ccDetails: { holder: string; num: string }) => {
    // Generate order entities grouped by their underlying sellers
    const subtotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
    const platformFee = subtotal * 0.10; // 10% owner fee, clearly listed
    const taxAmount = subtotal * 0.10; // 10% sales tax
    const deliveryFee = 3.99;
    const orderTotal = subtotal + deliveryFee + taxAmount;

    // Split items into separate orders if multiple sellers exist
    const itemsBySeller: Record<string, CartItem[]> = {};
    cart.forEach((c) => {
      const sId = c.foodItem.sellerId;
      if (!itemsBySeller[sId]) itemsBySeller[sId] = [];
      itemsBySeller[sId].push(c);
    });

    const newOrdersList: Order[] = Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
      const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
      const sellerPlatformFee = sellerSubtotal * 0.10;
      const sellerTax = sellerSubtotal * 0.10;
      
      return {
        id: 'ord_' + Math.floor(Math.random() * 9000000 + 1000000),
        buyerId: 'b_local_user',
        buyerName: ccDetails.holder || 'Dionysian Guest',
        items: sellerItems,
        subtotal: sellerSubtotal,
        platformFee: sellerPlatformFee,
        tax: sellerTax,
        deliveryFee: 3.99 / Object.keys(itemsBySeller).length,
        total: sellerSubtotal + sellerTax + (3.99 / Object.keys(itemsBySeller).length),
        status: 'Pending',
        createdAt: new Date().toISOString(),
        sellerId: sellerId,
        sellerName: sellerItems[0].foodItem.sellerName,
        deliveryStep: 0,
        deliveryProgress: 0,
      };
    });

    // Deduct user balance
    setUserBalance((prev) => prev - orderTotal);
    
    // Add to order list
    setOrders((prev) => [...newOrdersList, ...prev]);

    // Clear client shopping bag
    setCart([]);
    setIsCartOpen(false);
  };

  // Action: Modify cooking dispatch statuses
  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'Preparing' | 'Out for Delivery' | 'Delivered') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        
        // Map states accordingly
        let step = 0;
        if (nextStatus === 'Preparing') step = 1;
        if (nextStatus === 'Out for Delivery') step = 2;
        if (nextStatus === 'Delivered') {
          step = 3;
          // Prompt order rating from seller's prospective too
          setTimeout(() => {
            setActiveRatingOrder({ order: { ...o, status: nextStatus, deliveryStep: 3, deliveryProgress: 100 }, role: 'seller' });
          }, 350);
        }

        return {
          ...o,
          status: nextStatus,
          deliveryStep: step,
          deliveryProgress: nextStatus === 'Delivered' ? 100 : 0
        };
      })
    );
  };

  // Rating input submittal handler
  const handleSubmitRatingComment = (orderId: string, ratingValue: number, comment: string, ratedRole: 'buyer' | 'seller') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (ratedRole === 'buyer') {
          // Buyer rates seller
          return { ...o, buyerRatedSeller: true, status: 'Completed' };
        } else {
          // Seller rates buyer
          return { ...o, sellerRatedBuyer: true, status: 'Completed' };
        }
      })
    );

    // Update aggregate score values for simulation highlights
    if (ratedRole === 'buyer') {
      setSellerRating((prev) => parseFloat(((prev * 11 + ratingValue) / 12).toFixed(1)));
    } else {
      setBuyerRating((prev) => parseFloat(((prev * 8 + ratingValue) / 9).toFixed(1)));
    }

    // Dismiss active rating popup
    setActiveRatingOrder(null);
  };

  const handleSandboxReset = () => {
    localStorage.removeItem('cs_food_items');
    localStorage.removeItem('cs_cart');
    localStorage.removeItem('cs_orders');
    localStorage.removeItem('cs_balance');
    setFoodItems(DEFAULT_FOOD_ITEMS);
    setCart([]);
    setOrders([]);
    setUserBalance(85.00);
    setBuyerRating(4.9);
    setSellerRating(4.8);
    handleRefreshLocation();
  };
 
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white select-none transition-all duration-500">
        <div className="absolute inset-0 bg-radial-gradient from-rose-950/25 to-zinc-950 opacity-40"></div>
        
        {/* Glowing circular backdrop */}
        <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-3 animate-pulse">
            <span className="font-cursive text-6xl text-white tracking-wide select-none pt-2">
              Dionysus
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16 stroke-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Realistic wine glass bowl path */}
              <path d="M6 3 h12 v2 c0 4.5 -3 7.5 -6 7.5 s-6 -3 -6 -7.5 Z" />
              {/* Realistic soft liquid rim outline */}
              <path d="M6.5 6.5 c2.5 1 8.5 1 11 0" />
              {/* Stem of the glass */}
              <path d="M12 12.5 v7.5" />
              {/* Realistic glass foot base */}
              <path d="M8 20 h8" />
            </svg>
          </div>
 
          <div className="space-y-1">
            <p className="text-[10px] text-red-500 font-mono tracking-[0.2em] uppercase font-extrabold">Artisanal Neighborhood Gastronomy</p>
          </div>
 
          {/* Progressive Loader stage line */}
          <div className="w-48 bg-zinc-850 bg-zinc-800 h-1.5 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-rose-400 h-full rounded-full animate-loader"></div>
          </div>
 
          {/* Live pulsing text stream */}
          <p className="text-[11px] text-zinc-400 font-mono tracking-wide min-h-[16px]">
            {loadingStage}
          </p>
 
          <p className="text-[9px] text-zinc-500 italic max-w-xs pt-4 border-t border-zinc-900 leading-relaxed font-sans">
            "Feast collectively, live abundantly. Rent raw culinary devotion directly from local hearths."
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(email, name) => {
          const user = { email, name };
          setCurrentUser(user);
          localStorage.setItem('dionysus_logged_in_user', JSON.stringify(user));
          // Pre-populate name inside local storage for profile screen syncing
          localStorage.setItem('dionysus_user_name', name);
        }}
      />
    );
  }
 
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-red-200">
      {/* Visual Navigation Header */}
      <Navigation
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        userBalance={userBalance}
        buyerRating={buyerRating}
        sellerRating={sellerRating}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Core dynamic role routing */}
        {currentRole === 'buyer' && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Column: Local Menu search and list options (Spans 3/4 layout for visual rhythm) */}
            <div className="lg:col-span-3 space-y-8">
              <Marketplace
                items={foodItems}
                cart={cart}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                locationName={locationName}
                isLocating={isLocating}
                isFetchingRestaurants={isFetchingRestaurants}
                onRefreshLocation={handleRefreshLocation}
              />
            </div>

            {/* Right Column: Mini Utility block (Real-time tracking feed + wallet helpers) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                
                {/* Visual Active Delivery Section */}
                <div className="border border-red-100 rounded-2xl bg-white shadow-sm overflow-hidden text-zinc-950">
                  <div className="bg-red-600 p-3 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-between">
                    <span>Active Deliveries</span>
                    <span className="animate-pulse h-2 w-2 rounded-full bg-white"></span>
                  </div>
                  <div className="p-4 space-y-4">
                    <DeliveryTracker
                      orders={orders}
                      buyerId="b_local_user"
                    />
                  </div>
                </div>

                {/* Local Sandbox utilities & platform policies */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-900 tracking-tight flex items-center gap-1.5 uppercase font-mono">
                    <Landmark className="h-4 w-4 text-red-600" />
                    Administrative Ledger
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Welcome to the sandbox environment. Pre-loaded with <strong className="text-zinc-950">$85.00 sandbox cash</strong> to purchase and trace deliveries immediately.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => setUserBalance((prev) => prev + 50)}
                      className="w-full text-center rounded-xl bg-zinc-150 bg-zinc-100 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition"
                    >
                      + Topup $50 Sandbox Cash
                    </button>
                    <button
                      onClick={handleSandboxReset}
                      className="w-full text-center rounded-xl border border-zinc-200 py-2.5 text-[10px] uppercase tracking-wide font-black text-red-600 hover:bg-rose-50/50 transition flex items-center justify-center gap-1"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      Reset Database defaults
                    </button>
                  </div>
                </div>

                {/* Beautiful Red-and-White Brand card */}
                <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-5 text-white shadow-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-white/5 blur-xl"></div>
                  <Heart className="h-6 w-6 text-white fill-white/20" />
                  <h5 className="text-sm font-black tracking-tight">The 10% Co-Op Promise</h5>
                  <p className="text-[10px] text-rose-100 leading-relaxed">
                    We keep local food dollars local. <strong>10% of list prices</strong> automatically funds community development efforts, giving you a seat at the table.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {currentRole === 'seller' && (
          <SellerDashboard
            items={foodItems}
            orders={orders}
            onAddListing={handleAddListing}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            sellerId={CURRENT_SELLER_ID}
            isSellerPaid={isSellerPaid}
            onPaySellerFee={handlePaySellerFee}
          />
        )}

        {currentRole === 'account' && (
          <AccountPage
            userBalance={userBalance}
            onTopup={(amt) => setUserBalance((prev) => prev + amt)}
            buyerRating={buyerRating}
            sellerRating={sellerRating}
            orders={orders}
            onResetDB={handleSandboxReset}
            onSignOut={() => {
              localStorage.removeItem('dionysus_logged_in_user');
              setCurrentUser(null);
            }}
            currentUserEmail={currentUser.email}
            isSellerPaid={isSellerPaid}
            onPaySellerFee={handlePaySellerFee}
          />
        )}
      </main>

      {/* Footer Details */}
      <footer className="mt-32 border-t border-zinc-200 bg-white py-12 text-center text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-serif font-black text-red-600 tracking-wide uppercase">THE DIONYSIAN COMMUNE</p>
          <p>Dionysus — Neighbors sharing home-cooked meals. This is an experimental sandbox prototype. All transactions and balances are fully simulated.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-[10px] px-2.5 py-0.5 text-red-700 font-bold border border-red-105">
              Platform Deduction Schedule: 10.00%
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[10px] px-2.5 py-0.5 text-emerald-700 font-bold border border-emerald-100">
              Seller Account Access: $10.00 Flat (Tax Exempt)
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-0.5">
              Made by Eclipse
            </span>
          </div>
        </div>
      </footer>

      {/* Cart/Checkout Modal */}
      {isCartOpen && (
        <CheckoutModal
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClose={() => setIsCartOpen(false)}
          onConfirmPurchase={handleConfirmPurchase}
          userBalance={userBalance}
        />
      )}

      {/* Rating / Review Interactive Dialog */}
      {activeRatingOrder && (
        <RatingModal
          order={activeRatingOrder.order}
          role={activeRatingOrder.role}
          onClose={() => setActiveRatingOrder(null)}
          onSubmitRating={handleSubmitRatingComment}
        />
      )}
    </div>
  );
}
