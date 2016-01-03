'use strict';

const add = x => y => x + y;

const increment = add(1);
const addTen = add(10);

console.log(increment(2)); // 3
console.log(addTen(2)); // 12

const curry = require('lodash.curry');

const match = curry((what, str) => str.match(what));
const replace = curry((what, replacement, str) => str.replace(what, replacement));
const filter = curry((f, ary) => ary.filter(f));
const map = curry((f, ary) => ary.map(f));

console.log( match(/\s+/g, "hello world") );
console.log( match(/\s+/g)("hello world") );

const hasSpaces = match(/\s+/g);

console.log( hasSpaces("hello world") );
console.log( hasSpaces("spaceless") );

console.log( filter(hasSpaces, ["tori_spelling", "tori amos"]) );

const findSpaces = filter(hasSpaces);

console.log( findSpaces(["tori_spelling", "tori amos"]) );

const noVowels = replace(/[aeiou]/ig);

const censored = noVowels("*");

console.log( censored("Chocolate Rain") );

const _ = require('ramda');
const assert = require('assert');

// exercise 1
const words = _.split(' ');
assert.deepEqual(words("Jingle bells Batman smells"), ['Jingle', 'bells', 'Batman', 'smells']);

// excercise 1a
const sentences = _.map(words);
assert.deepEqual(sentences(["Jingle bells Batman smells", "Robin laid an egg"]), [['Jingle', 'bells', 'Batman', 'smells'], ['Robin', 'laid', 'an', 'egg']]);

// excercise 2
const filterQs = _.filter(match(/q/i));
assert.deepEqual(filterQs(['quick', 'camels', 'quarry', 'over', 'quails']), ['quick', 'quarry', 'quails']);

// excercise 3
const _keepHighest = (x, y) => x >= y ? x : y;
const max = _.reduce(_keepHighest, -Infinity);
assert.equal(max([323,523,554,123,5234]), 5234);

// bonus 1
const slice = _.curry((start, end, xs) => xs.slice(start, end));
assert.deepEqual(slice(1)(3)(['a', 'b', 'c']), ['b', 'c']);

// bonus 2
const take = slice(0);
assert.deepEqual(take(2)(['a', 'b', 'c']), ['a', 'b']);
