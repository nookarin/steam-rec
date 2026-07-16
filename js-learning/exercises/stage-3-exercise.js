import { menuItems, orders } from "../fakeData/foodTruckDB.js";

// Stage 3: Finding one object with find()
//
// Run this file with:  node exercises/stage-3-exercise.js
// Each console.log below shows the expected output as a comment.
// Implement the functions until all outputs match.
//
// Reminder:
//   array.find(callback) returns the first element where the callback returns true,
//   or undefined if no element matches.

// ---------------------------------------------------------------------------
// Exercise 1
// Write a function called findMenuItemById.
// It receives an items array and an itemId, and returns the matching item object.
// Use find() with an arrow function callback that checks item.id === itemId.
// Expected output: { id: 2, name: "Double Engine", ... }

function findMenuItemById(items, itemId) {
  // TODO: your code here
}

console.log(findMenuItemById(menuItems, 2));
// { id: 2, name: 'Double Engine', category: 'burger', price: 250, isAvailable: true, stock: 6 }

// ---------------------------------------------------------------------------
// Exercise 2
// Write a function called findMenuItemByName.
// It receives an items array and an itemName, and returns the matching item object.
// Expected output: { id: 5, name: "Spicy Gear Burger", ... }

function findMenuItemByName(items, itemName) {
  // TODO: your code here
}

console.log(findMenuItemByName(menuItems, "Spicy Gear Burger"));
// { id: 5, name: 'Spicy Gear Burger', category: 'burger', price: 220, isAvailable: true, stock: 8 }

// ---------------------------------------------------------------------------
// Exercise 3
// Write a function called findOrderById.
// It receives an orderList array and an orderId string, and returns the matching order.
// Expected output: { id: "ORD-002", customerName: "Somchai", status: "pending" }

function findOrderById(orderList, orderId) {
  // TODO: your code here
}

console.log(findOrderById(orders, "ORD-002"));
// { id: 'ORD-002', customerName: 'Somchai', items: [...], status: 'pending' }

// ---------------------------------------------------------------------------
// Exercise 4
// Write a function called getMenuItemNameById.
// It receives an items array and an itemId.
// If a matching item is found, return its name.
// If no item is found (find() returns undefined), return "Menu item not found".
// Expected outputs:
//   getMenuItemNameById(menuItems, 2)  → "Double Engine"
//   getMenuItemNameById(menuItems, 99) → "Menu item not found"

function getMenuItemNameById(items, itemId) {
  // TODO: your code here
}

console.log(getMenuItemNameById(menuItems, 2));
// "Double Engine"

console.log(getMenuItemNameById(menuItems, 99));
// "Menu item not found"
