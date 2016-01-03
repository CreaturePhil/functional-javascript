'use strict';

const _ = require('ramda');
const assert = require('assert');

const compose = (f, g) => x => f(g(x));

const toUpperCase = x => x.toUpperCase();
const exclaim = x => x + '!';
const shout = compose(exclaim, toUpperCase);

console.log( shout("send in the clowns") ); // SEND IN THE CLOWNS!

const head = x => x[0];
const reverse = _.reduce((acc, x) => [x].concat(acc), []);
const last = compose(head, reverse);

console.log( last(['jumpkick', 'roundhouse', 'uppercut']) ); // uppercut

// associativity
compose(toUpperCase, compose(head, reverse)) == compose(compose(toUpperCase, head), reverse);

const lastUpper = compose(toUpperCase, last);

console.log( lastUpper(['jumpkick', 'roundhouse', 'uppercut']) );

const loudLastUpper = compose(exclaim, lastUpper);

console.log( loudLastUpper(['jumpkick', 'roundhouse', 'uppercut']) );

const g = x => x.length;
const f = x => x === 4;
const isFourLetterWord = compose(f, g);

const id = x => x;

console.log( compose(id, f)(5) == compose(f, id)(5) );

// Example Data
const CARS = [
  {name: "Ferrari FF", horsepower: 660, dollar_value: 700000, in_stock: true},
  {name: "Spyker C12 Zagato", horsepower: 650, dollar_value: 648000, in_stock: false},
  {name: "Jaguar XKR-S", horsepower: 550, dollar_value: 132000, in_stock: false},
  {name: "Audi R8", horsepower: 525, dollar_value: 114200, in_stock: false},
  {name: "Aston Martin One-77", horsepower: 750, dollar_value: 1850000, in_stock: true},
  {name: "Pagani Huayra", horsepower: 700, dollar_value: 1300000, in_stock: false}
];

const trace = _.curry((tag, x) => {
  console.log(tag, x);
  return x;
})

// excercise 1
const isLastInStock = _.compose(_.prop('in_stock'), _.last);
assert.equal(isLastInStock(CARS), false);

// excercise 2
const nameOfFirstCar = _.compose(_.prop('name'), _.head);
assert.equal(nameOfFirstCar(CARS), "Ferrari FF");

// excercise 3
const _average = xs => _.reduce(_.add, 0, xs) / xs.length;
const averageDollarValue = _.compose(_average, _.map(_.prop('dollar_value')));
assert.equal(averageDollarValue(CARS), 790700);

// excercise 4
const _underscore = _.replace(/\W+/g, '_');
const toLowerCase = x => x.toLowerCase();
const sanitizeNames = _.map(_.compose(toLowerCase, _underscore, _.prop('name')));
assert.deepEqual(sanitizeNames(CARS), ['ferrari_ff', 'spyker_c12_zagato', 'jaguar_xkr_s', 'audi_r8', 'aston_martin_one_77', 'pagani_huayra']);

// bonus 2
const append = _.flip(_.concat);
const fastestCar = _.compose(append(' is the fastest'),
                            _.prop('name'),
                            _.last,
                            _.sortBy(_.prop('horsepower')));
assert.equal(fastestCar(CARS), 'Aston Martin One-77 is the fastest');
