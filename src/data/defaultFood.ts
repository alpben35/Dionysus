import { FoodItem } from '../types';

export const DEFAULT_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'f1',
    title: 'Rustic Margherita Woodfired Pizza',
    description: 'Fresh heritage tomato sauce, creamy fior di latte mozzarella, aromatic hand-torn basil oil on a 36-hour fermented crust. Authentic local comfort food.',
    price: 14.50,
    category: 'Hot Meals',
    sourceType: 'Homemade',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600',
    sellerId: 's1',
    sellerName: 'Clara’s Italian Hearth',
    sellerRating: 4.9,
    sellerTotalRatings: 112,
    prepTime: 20,
    distance: 1.2,
    tags: ['Vegetarian', 'Woodfired', 'Homemade'],
    isAvailable: true
  },
  {
    id: 'f2',
    title: 'Signature Red Velvet Cupcake Set',
    description: 'Moist crimson cocoa cupcakes topped with luxury Madagascar vanilla cream cheese icing, sprinkled with delicate red velvet cake dust.',
    price: 12.00,
    category: 'Desserts',
    sourceType: 'Restaurant',
    image: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?auto=format&fit=crop&q=80&w=600',
    sellerId: 's2',
    sellerName: 'The Dionysian Whisk Bakery',
    sellerRating: 4.8,
    sellerTotalRatings: 84,
    prepTime: 15,
    distance: 1.5,
    tags: ['Sweet', 'Award-Winning', 'Kid-Friendly'],
    isAvailable: true
  },
  {
    id: 'f3',
    title: 'Smoked Jalapeño Tomato Chili',
    description: 'Slow-simmered dark beef chili infused with fire-roasted red tomatoes, chipotle pods, sweet baby corn, topped with a dollop of white sour cream.',
    price: 11.25,
    category: 'Homecooked',
    sourceType: 'Homemade',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=600',
    sellerId: 's3',
    sellerName: 'Marcus Smoke & Slow Cook',
    sellerRating: 4.7,
    sellerTotalRatings: 49,
    prepTime: 30,
    distance: 3.1,
    tags: ['Spicy', 'Gluten-Free', 'High-Protein'],
    isAvailable: true
  },
  {
    id: 'f4',
    title: 'Golden Crust Artisan Sourdough',
    description: 'Crispy blistered white crust, soft wild-yeast crumb, perfect for morning toasts or gourmet sandwich spreads. Baked fresh at sunrise.',
    price: 7.50,
    category: 'Bakery',
    sourceType: 'Restaurant',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
    sellerId: 's2',
    sellerName: 'The Dionysian Whisk Bakery',
    sellerRating: 4.8,
    sellerTotalRatings: 84,
    prepTime: 10,
    distance: 1.5,
    tags: ['Bakery', 'Freshly Baked', 'Vegan'],
    isAvailable: true
  },
  {
    id: 'f5',
    title: 'Ruby Beetroot Hummus Salad Basin',
    description: 'Earthy organic roasted beets whipped with creamy tahini hummus source, served with crispy organic red radishes, white feta, and warm cumin flatbread flatters.',
    price: 10.00,
    category: 'Healthy',
    sourceType: 'Restaurant',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    sellerId: 's4',
    sellerName: 'The Green Seed Bowl',
    sellerRating: 4.9,
    sellerTotalRatings: 38,
    prepTime: 12,
    distance: 0.8,
    tags: ['Healthy', 'Vegan Option', 'Organic'],
    isAvailable: true
  },
  {
    id: 'f6',
    title: 'Fresh Strawberries Crepe Basket',
    description: 'Two thin buttery french crepes filled with white chocolate mascarpone cheese and smothered with sliced sweet heritage red strawberries and mint syrup.',
    price: 9.50,
    category: 'Desserts',
    sourceType: 'Homemade',
    image: 'https://images.unsplash.com/photo-1519676867240-f03562fa1493?auto=format&fit=crop&q=80&w=600',
    sellerId: 's1',
    sellerName: 'Clara’s Italian Hearth',
    sellerRating: 4.9,
    sellerTotalRatings: 112,
    prepTime: 18,
    distance: 1.2,
    tags: ['Sweet', 'Fine Dining', 'Fruity'],
    isAvailable: true
  }
];

export const DEFAULT_MOCK_ORDERS = [
  {
    id: 'ord_9841029',
    buyerId: 'b_guest',
    buyerName: 'Dionysian Guest',
    items: [
      { foodItem: DEFAULT_FOOD_ITEMS[0], quantity: 2 },
      { foodItem: DEFAULT_FOOD_ITEMS[1], quantity: 1 }
    ],
    subtotal: 41.00,
    platformFee: 4.10,
    tax: 4.10,
    deliveryFee: 3.99,
    total: 49.09,
    status: 'Delivered' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    sellerId: 's1',
    sellerName: 'Clara’s Italian Hearth',
    deliveryStep: 3,
    deliveryProgress: 100
  },
  {
    id: 'ord_7481902',
    buyerId: 'b_guest',
    buyerName: 'Dionysian Guest',
    items: [
      { foodItem: DEFAULT_FOOD_ITEMS[2], quantity: 1 },
      { foodItem: DEFAULT_FOOD_ITEMS[3], quantity: 1 }
    ],
    subtotal: 18.75,
    platformFee: 1.88,
    tax: 1.88,
    deliveryFee: 3.99,
    total: 24.62,
    status: 'Completed' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    sellerId: 's3',
    sellerName: 'Marcus Smoke & Slow Cook',
    deliveryStep: 3,
    deliveryProgress: 100
  }
];
