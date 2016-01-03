'use strict';

const conjoin = (flock_x, flock_y) => flock_x + flock_y; // add
const breed = (flock_x, flock_y) => flock_x * flock_y;   // multiply

const flock_a = 4;
const flock_b = 2;
const flock_c = 0;

const result = conjoin(
  breed(flock_b, conjoin(flock_a, flock_c)), breed(flock_a, flock_b)
);

console.log(result); // 16

const add = (x, y) => x + y;
const multiply = (x, y) => x * y;

// add(multiply(b, add(a, c)), multiply(a, b))
// (b * (a + c)) + (a * b)
// (b * (a + 0)) + (a * b)  identity
// (b * a)  + (a * b)       distributive
// b * (a + a)

const result2 = multiply(flock_b, add(flock_a, flock_a));

console.log(result2); // 16
