import { menuItems, orders } from "../fakeData/foodTruckDB.js";

// Stage 4: Selecting multiple objects with filter()
//
// Run this file with:  node exercises/stage-4-exercise.js
// Each console.log below shows the expected output as a comment.
// Implement the functions until all outputs match.
//
// Reminder:
//   array.filter(callback) returns a new array containing every element
//   where the callback returns true.

// ---------------------------------------------------------------------------
// Exercise 1
// Write a function called getUnavailableItems.
// It receives an items array and returns a new array of items where isAvailable is false.
// Expected output: one item — Neon Cola

function getUnavailableItems(items) {
  // TODO: your code here
}

console.log(getUnavailableItems(menuItems));
// [ { id: 4, name: 'Neon Cola', category: 'drink', price: 50, isAvailable: false, stock: 0 } ]

// ---------------------------------------------------------------------------
// Exercise 2
// Write a function called getAffordableItems.
// It receives an items array and returns items with a price strictly less than 200.
// Expected output: Chrome Classic (180), Crispy Circuit Fries (90), Neon Cola (50)

function getAffordableItems(items) {
  // TODO: your code here
}

console.log(getAffordableItems(menuItems));
// [ { name: 'Chrome Classic', price: 180, ... }, { name: 'Crispy Circuit Fries', price: 90, ... }, { name: 'Neon Cola', price: 50, ... } ]

// ---------------------------------------------------------------------------
// Exercise 3
// Write a function called getLowStockItems.
// It receives an items array and returns items where stock is less than 10.
// Expected output: Double Engine (6), Neon Cola (0), Spicy Gear Burger (8)

function getLowStockItems(items) {
  // TODO: your code here
}

console.log(getLowStockItems(menuItems));
// [ { name: 'Double Engine', stock: 6, ... }, { name: 'Neon Cola', stock: 0, ... }, { name: 'Spicy Gear Burger', stock: 8, ... } ]

// ---------------------------------------------------------------------------
// Exercise 4
// Write a function called getCompletedOrders.
// It receives an orderList array and returns orders where status is "completed".
// Expected output: ORD-001 (Mali) and ORD-003 (Nina)

function getCompletedOrders(orderList) {
  // TODO: your code here
}

console.log(getCompletedOrders(orders));
// [ { id: 'ORD-001', customerName: 'Mali', status: 'completed', ... }, { id: 'ORD-003', customerName: 'Nina', status: 'completed', ... } ]

// ---------------------------------------------------------------------------
// Exercise 5
// Write a function called getAvailableBurgers.
// It receives an items array and returns items where:
//   - category is "burger"
//   - isAvailable is true
// Both conditions must be true. Use the && operator.
// Expected output: Chrome Classic, Double Engine, Spicy Gear Burger

function getAvailableBurgers(items) {
  // TODO: your code here
}

console.log(getAvailableBurgers(menuItems));
// [ { name: 'Chrome Classic', category: 'burger', isAvailable: true, ... }, { name: 'Double Engine', ... }, { name: 'Spicy Gear Burger', ... } ]

// ---------------------------------------------------------------------------
// Exercise 6
// Write a function called getBurgersWithinBudget.
// It receives an items array and a maximumPrice number.
// It returns burgers where price is less than or equal to maximumPrice.
// Do not hard-code the price — use the maximumPrice parameter.
// Expected output for maximumPrice 220: Chrome Classic (180) and Spicy Gear Burger (220)

function getBurgersWithinBudget(items, maximumPrice) {
  // TODO: your code here
}

console.log(getBurgersWithinBudget(menuItems, 220));
// [ { name: 'Chrome Classic', price: 180, ... }, { name: 'Spicy Gear Burger', price: 220, ... } ]
