'use strict';

// setup start

const _ = require('ramda');

const Container = function(x) {
  this.__value = x;
};

Container.of = function(x) {
  return new Container(x);
};

Container.prototype.map = function(f) {
  return Container.of(f(this.__value));
};

const add = _.add;
const curry = _.curry;

// setup end

Container.prototype.ap = function(other_container) {
  return other_container.map(this.__value);
};

console.log( Container.of(add(2)).ap(Container.of(3)) ); // Container(5)
console.log( Container.of(2).map(add).ap(Container.of(3)) ); // Container(5)

// An applicative functor is a pointed functor with an ap method

const liftA2 = curry((f, functor1, functor2) => functor1.map(f).ap(functor2));
const liftA3 = curry((f, functor1, functor2, functor3) => functor1.map(f).ap(functor2).ap(functor3));
