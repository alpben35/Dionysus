export type FoodCategory = 'Hot Meals' | 'Bakery' | 'Desserts' | 'Healthy' | 'Homecooked' | 'Beverages';

export type SourceType = 'Homemade' | 'Restaurant';

export interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: FoodCategory;
  sourceType: SourceType;
  image: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerTotalRatings: number;
  prepTime: number; // in minutes
  distance: number; // in miles
  tags: string[];
  isAvailable: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Completed';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerRating?: number; // For buyer rating by seller
  items: CartItem[];
  subtotal: number;
  platformFee: number; // 10% of subtotal
  tax: number; // Configured tax rate amount
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  sellerId: string;
  sellerName: string;
  deliveryStep: number; // 0 to 4 corresponding to tracking steps
  deliveryProgress: number; // 0 to 100 for animation
  buyerRatedSeller?: boolean;
  sellerRatedBuyer?: boolean;
}

export interface UserRating {
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  avatar: string;
  phone: string;
  address: string;
  joinedDate: string;
}
