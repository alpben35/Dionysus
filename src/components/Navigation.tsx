import { ShoppingCart, ChefHat, Store, Wallet, Star, User } from 'lucide-react';

interface NavigationProps {
  currentRole: 'buyer' | 'seller' | 'account';
  onChangeRole: (role: 'buyer' | 'seller' | 'account') => void;
  cartCount: number;
  onOpenCart: () => void;
  userBalance: number;
  buyerRating: number;
  sellerRating: number;
}

export function Navigation({
  currentRole,
  onChangeRole,
  cartCount,
  onOpenCart,
  userBalance,
  buyerRating,
  sellerRating,
}: NavigationProps) {
  const currentUserName = (() => {
    try {
      const saved = localStorage.getItem('dionysus_logged_in_user');
      if (saved) {
        return JSON.parse(saved).name;
      }
    } catch {
      // noop
    }
    return 'Guest (You)';
  })();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-100 bg-white/90 backdrop-blur-xl transition-all duration-200 shadow-xs">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onChangeRole('buyer')}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity active:scale-[0.98]"
          >
            <span className="font-cursive text-4xl text-[#cb1212] leading-none select-none pt-1 font-bold">
              Dionysus
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 stroke-[#cb1212]" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3 h12 v2 c0 4.5 -3 7.5 -6 7.5 s-6 -3 -6 -7.5 Z" />
              <path d="M6.5 6.5 c2.5 1 8.5 1 11 0" />
              <path d="M12 12.5 v7.5" />
              <path d="M8 20 h8" />
            </svg>
          </button>
          <div className="hidden md:block pl-3 border-l border-red-100 py-0.5">
            <p className="text-[10px] text-red-600 font-bold tracking-wider uppercase">Neighbourhood Feast Co-Op</p>
          </div>
        </div>

        {/* Apple Segmented Control Navigation Bar - Strict Red/White */}
        <nav className="flex items-center bg-rose-50/70 p-1 rounded-full border border-red-100/80 shadow-inner">
          <button
            id="nav-buyer-btn"
            onClick={() => onChangeRole('buyer')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
              currentRole === 'buyer'
                ? 'bg-[#cb1212] text-white shadow-md shadow-red-600/20'
                : 'text-zinc-600 hover:text-[#cb1212]'
            }`}
          >
            <Store className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Marketplace</span>
            <span className="inline sm:hidden">Market</span>
          </button>
          
          <button
            id="nav-seller-btn"
            onClick={() => onChangeRole('seller')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
              currentRole === 'seller'
                ? 'bg-[#cb1212] text-white shadow-md shadow-red-600/20'
                : 'text-zinc-600 hover:text-[#cb1212]'
            }`}
          >
            <ChefHat className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Host Kitchen</span>
            <span className="inline sm:hidden">Kitchen</span>
          </button>

          <button
            id="nav-account-btn"
            onClick={() => onChangeRole('account')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
              currentRole === 'account'
                ? 'bg-[#cb1212] text-white shadow-md shadow-red-600/20'
                : 'text-zinc-600 hover:text-[#cb1212]'
            }`}
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Account</span>
            <span className="inline sm:hidden">Account</span>
          </button>
        </nav>

        {/* User Status / Wallet / Bag Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Overview */}
          <button 
            onClick={() => onChangeRole('account')}
            className="hidden lg:flex items-center gap-2.5 rounded-full bg-rose-50/60 hover:bg-rose-100/60 border border-red-100 px-3.5 py-1.5 text-xs font-medium text-zinc-900 transition-all active:scale-[0.97]"
            title="View Account Profile"
          >
            <span className="font-bold text-[#cb1212]">{currentUserName}</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold" title="Your Buyer Rating">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {buyerRating.toFixed(1)}
              </span>
            </div>
          </button>

          {/* Virtual Wallet Pill */}
          <button 
            onClick={() => onChangeRole('account')}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-900 shadow-xs hover:bg-rose-50/50 transition-all active:scale-[0.97]"
          >
            <Wallet className="h-3.5 w-3.5 text-[#cb1212]" />
            <span className="font-mono text-[#cb1212]">${userBalance.toFixed(2)}</span>
          </button>

          {/* Shopping Cart Pill Button */}
          {currentRole === 'buyer' && (
            <button
              id="navigation-cart-trigger"
              onClick={onOpenCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#cb1212] text-white shadow-sm transition-all hover:bg-[#a30e0e] active:scale-95"
              aria-label="Shopping Bag"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-extrabold text-[#cb1212] ring-2 ring-[#cb1212] animate-scale">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

