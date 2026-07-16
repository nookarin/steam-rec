import { menuItems } from "../fakeData/foodTruckDB.js";

// Stage 2: Reading arrays with indexes and length
//
// Run this file with:  node exercises/stage-2-exercise.js
// Each console.log below shows the expected output as a comment.
// Implement the functions until all outputs match.

// ---------------------------------------------------------------------------
// Exercise 1
// Write a function called countMenuItems.
// It receives an array of menu items and returns how many items are in the array.
// Expected output: 5

function countMenuItems(items) {
  // TODO: your code here
}

console.log(countMenuItems(menuItems));
// 5

// ---------------------------------------------------------------------------
// Exercise 2
// Write a function called getFirstMenuItem.
// It receives an array of menu items and returns the first item object.
// Expected output: { id: 1, name: "Chrome Classic", category: "burger", price: 180, isAvailable: true, stock: 12 }

function getFirstMenuItem(items) {
  // TODO: your code here
}

console.log(getFirstMenuItem(menuItems));
// { id: 1, name: 'Chrome Classic', category: 'burger', price: 180, isAvailable: true, stock: 12 }

// ---------------------------------------------------------------------------
// Exercise 3
// Write a function called getFirstItemName.
// It receives an array of menu items and returns the name of the first item.
// Expected output: "Chrome Classic"

function getFirstItemName(items) {
  // TODO: your code here
}

console.log(getFirstItemName(menuItems));
// "Chrome Classic"

// ---------------------------------------------------------------------------
// Exercise 4
// Write a function called getLastMenuItem.
// It receives an array of menu items and returns the last item object.
// Do not hard-code the index — use items.length to calculate it.
// Expected output: { id: 5, name: "Spicy Gear Burger", ... }

function getLastMenuItem(items) {
  // TODO: your code here
}

console.log(getLastMenuItem(menuItems));
// { id: 5, name: 'Spicy Gear Burger', category: 'burger', price: 220, isAvailable: true, stock: 8 }

// ---------------------------------------------------------------------------
// Exercise 5
// Write a function called getLastItemPrice.
// It receives an array of menu items and returns the price of the last item.
// Expected output: 220

function getLastItemPrice(items) {
  // TODO: your code here
}

console.log(getLastItemPrice(menuItems));
// 220
