import { useEffect, useState } from 'react';
import { Order } from '../types';
import { Map, Clock, AlertCircle, Sparkles, Navigation, ChefHat } from 'lucide-react';

interface DeliveryTrackerProps {
  orders: Order[];
  buyerId: string;
}

export function DeliveryTracker({ orders, buyerId }: DeliveryTrackerProps) {
  const buyerOrders = orders.filter((o) => o.buyerId === buyerId && o.status !== 'Completed');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(15);

  // Set initial selected active order
  useEffect(() => {
    if (buyerOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(buyerOrders[0].id);
    }
  }, [buyerOrders, selectedOrderId]);

  const activeOrder = buyerOrders.find((o) => o.id === selectedOrderId);

  // Countdown simulation hook
  useEffect(() => {
    if (!activeOrder) return;
    
    // Set custom countdown minutes based on status
    let mins = 15;
    if (activeOrder.status === 'Pending') mins = activeOrder.items[0]?.foodItem.prepTime || 20;
    else if (activeOrder.status === 'Preparing') mins = 12;
    else if (activeOrder.status === 'Out for Delivery') mins = 4;
    else if (activeOrder.status === 'Delivered') mins = 0;

    setRemainingMinutes(mins);

    const interval = setInterval(() => {
      setRemainingMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000); // decrement occasionally

    return () => clearInterval(interval);
  }, [activeOrder]);

  if (buyerOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-red-600">
          <Map className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-zinc-900">No Orders in Route</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">Purchase delicious direct menu meals, then enjoy live real-time delivery animation mapping right here.</p>
        </div>
      </div>
    );
  }

  // Define position on map for the delivery courier based on order state progress
  // Kitchen (Start): Point (50, 50)
  // Home (End): Point (260, 160)
  // We calculate a path animation:
  const getCourierCoordinates = (progress: number) => {
    const xStart = 50;
    const yStart = 60;
    const xEnd = 260;
    const yEnd = 160;

    // Direct path calculation
    const currentX = xStart + (xEnd - xStart) * (progress / 100);
    const currentY = yStart + (yEnd - yStart) * (progress / 100);
    return { x: currentX, y: currentY };
  };

  const currentCoords = activeOrder ? getCourierCoordinates(activeOrder.deliveryProgress) : { x: 50, y: 60 };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Selector tab if buyer has multiple active orders */}
      {buyerOrders.length > 1 && (
        <div className="bg-zinc-50 border-b border-zinc-100 p-2.5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-extrabold uppercase text-zinc-400 px-2 shrink-0">Your Orders:</span>
          {buyerOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold shrink-0 transition ${
                selectedOrderId === o.id ? 'bg-red-600 text-white' : 'bg-white text-zinc-650 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              Order #{o.id.slice(0, 6)} ({o.status})
            </button>
          ))}
        </div>
      )}

      {activeOrder && (
        <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-150">
          {/* Left Columns - Stepper & Status Details */}
          <div className="md:col-span-2 p-6 space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-zinc-950">Real-Time Delivery Tracker</h3>
                  <p className="text-[10px] text-zinc-405 font-mono">ORDER ID: <span className="text-red-600">#{activeOrder.id}</span></p>
                </div>
                {activeOrder.status !== 'Delivered' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2.5 py-1 text-[11px] font-black">
                    <Clock className="h-3 w-3 animate-pulse" />
                    ~{remainingMinutes} min
                  </span>
                )}
              </div>

              {/* Steps Progress Checklist */}
              <div className="mt-6 space-y-5">
                {[
                  { title: 'Order Approved', desc: 'Secure payment cleared by platform', step: 0 },
                  { title: 'Fresh Preparation', desc: 'Meals are baking in the host kitchen', step: 1 },
                  { title: 'Out for Delivery', desc: 'Spoon courier dispatched via cycle routes', step: 2 },
                  { title: 'Arrived at Door', desc: 'Collect fresh meals, complete with seller ratings', step: 3 },
                ].map((s) => {
                  const isActive = activeOrder.deliveryStep >= s.step;
                  const isCurrent = activeOrder.deliveryStep === s.step;
                  return (
                    <div key={s.step} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border transition-all ${
                          isActive 
                            ? 'bg-red-600 text-white border-red-650' 
                            : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                        } ${isCurrent ? 'ring-4 ring-rose-100 scale-105' : ''}`}>
                          {isActive ? '✓' : s.step + 1}
                        </div>
                        {s.step < 3 && (
                          <div className={`w-0.5 flex-1 ${isActive ? 'bg-red-600' : 'bg-zinc-100'} min-h-[22px]`} />
                        )}
                      </div>
                      <div className="space-y-0.5 py-0.5">
                        <h4 className={`text-xs font-bold ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                          {s.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-medium leading-normal">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note about 10% platform share */}
            <div className="rounded-xl bg-rose-50/50 border border-rose-150 p-3 text-[10px] text-zinc-600">
              <span className="font-bold text-red-600 block mb-0.5">10% Community Donation Share</span>
              Your completed payment safely channels <strong>${activeOrder.platformFee.toFixed(2)}</strong> back into platform tools. Enjoy fresh local food!
            </div>
          </div>

          {/* Right Columns - Visual Vector Street Map */}
          <div className="md:col-span-3 bg-zinc-50 relative p-4 flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-4 left-4 z-10 rounded-lg bg-white/90 shadow-sm border border-zinc-200 px-2.5 py-1 text-[10px] font-bold text-zinc-700 flex items-center gap-1.5 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-red-600" />
              <span>Live Carrier Path Map</span>
            </div>

            {/* Micro-neighborhood interactive Canvas */}
            <div className="w-full flex-1 flex items-center justify-center pt-6">
              <svg 
                viewBox="0 0 320 220" 
                className="w-full max-w-[340px] h-[220px] rounded-xl border border-zinc-200 bg-white shadow-inner"
              >
                {/* Grid Overlay */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f4f4f5" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Suburbs / River Graphic */}
                <rect x="0" y="100" width="320" height="20" fill="#e0f2fe" opacity="0.6" />
                <text x="10" y="112" fill="#0369a1" className="text-[8px] font-black tracking-wider uppercase opacity-45">Apron Canal</text>

                {/* Roads / Streets Vector */}
                <g stroke="#e4e4e7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8">
                  {/* Apron Road */}
                  <path d="M 50 60 L 260 60" />
                  {/* Sourdough Way (Diagonal Connector) */}
                  <path d="M 50 60 L 260 160" />
                  {/* Tomato alley */}
                  <path d="M 260 60 L 260 160" />
                </g>

                {/* Street Label Text */}
                <text x="130" y="55" fill="#a1a1aa" className="text-[7px] font-mono tracking-widest font-bold">APRON BLVD</text>
                <text x="150" y="125" fill="#a1a1aa" className="text-[7px] font-mono tracking-widest font-bold rotate-[21deg]">SOURDOUGH ST</text>

                {/* Seller Origin Landmark (Kitchen) */}
                <g transform="translate(50, 60)">
                  <circle r="14" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
                  <ChefHat className="h-4 w-4 text-red-600 -translate-x-2 -translate-y-2" />
                  <text x="-16" y="24" fill="#b91c1c" className="text-[8px] font-extrabold tracking-wide uppercase">{activeOrder.sellerName.split(' ')[0]}</text>
                  <text x="-16" y="32" fill="#71717a" className="text-[7px] font-mono font-bold">KITCHEN</text>
                </g>

                {/* Buyer Destination Landmark (Home) */}
                <g transform="translate(260, 160)">
                  <circle r="14" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
                  <span className="text-red-600"><circle r="4" fill="#dc2626" /></span>
                  <text x="-16" y="-22" fill="#18181b" className="text-[8px] font-extrabold tracking-wide uppercase">Your Home</text>
                  <text x="-16" y="-15" fill="#71717a" className="text-[7px] font-mono font-bold">DESTINATION</text>
                  <path d="M-4 -4 L0 -8 L4 -4" stroke="#dc2626" strokeWidth="1.5" fill="none" />
                  <rect x="-4" y="-4" width="8" height="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
                </g>

                {/* Active Courier Tracer Icon */}
                {activeOrder.status !== 'Pending' && (
                  <g transform={`translate(${currentCoords.x}, ${currentCoords.y})`}>
                    <circle r="11" fill="#dc2626" className="animate-ping" opacity="0.15" />
                    <circle r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <Navigation className="h-3.5 w-3.5 text-white -translate-x-1.8 -translate-y-1.8 rotate-45" />
                  </g>
                )}
              </svg>
            </div>

            {/* Map Address description */}
            <div className="mt-4 flex justify-between bg-white border border-zinc-200 rounded-xl p-3 text-[11px] shadow-sm font-medium">
              <div>
                <span className="text-zinc-400 block text-[9px] uppercase font-bold">Pick-up From</span>
                <span className="text-zinc-800 font-bold">{activeOrder.sellerName}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block text-[9px] uppercase font-bold">Estimated ETA</span>
                <span className="text-red-600 font-extrabold">{activeOrder.status === 'Delivered' ? 'Arrived!' : `About ${remainingMinutes} mins`}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
