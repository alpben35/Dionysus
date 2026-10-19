import React, { useState } from 'react';
import { Order } from '../types';
import { Star, MessageSquareCode, CheckCircle2 } from 'lucide-react';

interface RatingModalProps {
  order: Order;
  role: 'buyer' | 'seller';
  onClose: () => void;
  onSubmitRating: (orderId: string, rating: number, comment: string, role: 'buyer' | 'seller') => void;
}

export function RatingModal({
  order,
  role,
  onClose,
  onSubmitRating,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRating(order.id, rating, comment.trim() || 'Wonderful service and friendly exchange!', role);
  };

  const isBuyer = role === 'buyer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-scale-up border border-black/[0.06]">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#cb1212] text-white shadow-xs">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <h3 className="text-lg font-bold text-[#1d1d1f]">
              {isBuyer ? 'Rate Your Kitchen Meal' : 'Rate Local Customer Delivery'}
            </h3>
            <p className="text-xs text-[#86868b]">
              {isBuyer 
                ? `Leave feedback for ${order.sellerName} on their preparation and taste.` 
                : `How was your pickup/delivery exchange coordinating with user ${order.buyerName}?`}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f5f5f7] p-4 border border-black/[0.05] text-center space-y-1 text-xs">
            <span className="font-semibold text-[#1d1d1f] block">ORDER SUMMARY: #{order.id.slice(0, 8)}</span>
            <span className="text-[#86868b] block truncate">
              {order.items.map((i) => `${i.quantity}x ${i.foodItem.title}`).join(', ')}
            </span>
            <span className="font-mono text-[#cb1212] font-semibold block">Platform Fee Donated: ${(order.subtotal * 0.1).toFixed(2)}</span>
          </div>

          {/* Interactive Star Picker */}
          <div className="flex flex-col items-center gap-1 py-2">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Select Rating Stars</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    id={`star-rating-btn-${star}`}
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 text-[#86868b]"
                  >
                    <Star 
                      className={`h-8 w-8 transition-colors ${
                        isSelected 
                          ? 'fill-amber-400 text-amber-500' 
                          : 'fill-transparent text-[#e5e5ea]'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-amber-600 mt-1 uppercase font-mono tracking-wider">
              {rating === 5 && '🌟 Excellent (Perfect)'}
              {rating === 4 && '👍 Good Service'}
              {rating === 3 && '👌 Decent Experience'}
              {rating === 2 && '⚠️ Needs Improvement'}
              {rating === 1 && '👎 Poor Quality'}
            </span>
          </div>

          {/* Comment description box */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider block">Write a short review</label>
            <textarea
              id="rating-comment"
              rows={3}
              placeholder={isBuyer ? "Tell other foodies how fresh, hot, and delicious your food was..." : "Note details about friendliness, exact timing, or smooth exchange..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-2xl border border-black/[0.08] bg-[#f5f5f7] px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 focus:outline-none transition"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-black/[0.06] bg-[#f5f5f7] py-2.5 text-xs font-semibold text-[#515154] hover:bg-[#e5e5ea] transition active:scale-95"
            >
              Skip / Later
            </button>
            <button
              id="submit-rating-complete"
              type="submit"
              className="flex-1 rounded-full bg-[#cb1212] py-2.5 text-xs font-semibold text-white hover:bg-[#a30e0e] shadow-xs transition flex items-center justify-center gap-1 active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Submit Rating</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
