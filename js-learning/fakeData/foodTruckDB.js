export const menuItems = [
  {
    id: 1,
    name: "Chrome Classic",
    category: "burger",
    price: 180,
    isAvailable: true,
    stock: 12,
  },
  {
    id: 2,
    name: "Double Engine",
    category: "burger",
    price: 250,
    isAvailable: true,
    stock: 6,
  },
  {
    id: 3,
    name: "Crispy Circuit Fries",
    category: "side",
    price: 90,
    isAvailable: true,
    stock: 20,
  },
  {
    id: 4,
    name: "Neon Cola",
    category: "drink",
    price: 50,
    isAvailable: false,
    stock: 0,
  },
  {
    id: 5,
    name: "Spicy Gear Burger",
    category: "burger",
    price: 220,
    isAvailable: true,
    stock: 8,
  },
];

export const orders = [
  {
    id: "ORD-001",
    customerName: "Mali",
    items: [
      { menuItemId: 1, quantity: 2 },
      { menuItemId: 3, quantity: 1 },
    ],
    status: "completed",
  },
  {
    id: "ORD-002",
    customerName: "Somchai",
    items: [
      { menuItemId: 2, quantity: 1 },
      { menuItemId: 4, quantity: 2 },
    ],
    status: "pending",
  },
  {
    id: "ORD-003",
    customerName: "Nina",
    items: [{ menuItemId: 5, quantity: 3 }],
    status: "completed",
  },
];

export const foodTruck = {
  name: "Chrome and Burger",
  location: "Bangkok",
  isOpen: true,
  dailySalesTarget: 10000,
};
