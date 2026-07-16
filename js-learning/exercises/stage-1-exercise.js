import { foodTruck } from "../fakeData/foodTruckDB.js";

// Stage 1: Reading object properties
//
// Run this file with:  node exercises/stage-1-exercise.js
// Each console.log below shows the expected output as a comment.
// Implement the functions until all outputs match.

// ---------------------------------------------------------------------------
// Exercise 1
// Write a function called getTruckName.
// It receives a truck object and returns the value of its name property.
// Expected output: "Chrome and Burger"

function getTruckName(truck) {
  // TODO: your code here
}

console.log(getTruckName(foodTruck));
// "Chrome and Burger"

// ---------------------------------------------------------------------------
// Exercise 2
// Write a function called isTruckOpen.
// It receives a truck object and returns the value of its isOpen property.
// Do not use an if statement — isOpen is already a Boolean.
// Expected output: true

function isTruckOpen(truck) {
  // TODO: your code here
}

console.log(isTruckOpen(foodTruck));
// true

// ---------------------------------------------------------------------------
// Exercise 3
// Write a function called getDailySalesTarget.
// It receives a truck object and returns the value of its dailySalesTarget property.
// Expected output: 10000

function getDailySalesTarget(truck) {
  // TODO: your code here
}

console.log(getDailySalesTarget(foodTruck));
// 10000

// ---------------------------------------------------------------------------
// Exercise 4
// Write a function called describeTruck.
// It receives a truck object and returns a sentence using a template literal:
// "<name> is located in <location>."
// Expected output: "Chrome and Burger is located in Bangkok."

function describeTruck(truck) {
  // TODO: your code here
}

console.log(describeTruck(foodTruck));
// "Chrome and Burger is located in Bangkok."
