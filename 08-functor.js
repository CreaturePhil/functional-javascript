'use strict';

const _ = require('ramda');

const Container = function(x) {
  this.__value = x;
};

Container.of = function(x) {
  return new Container(x);
};

console.log( Container.of(3) ); // { __value: 3 }
console.log( Container.of("hotdogs") ); // { __value: 'hotdogs' }
console.log( Container.of({name: "yoda"}) ); // { __value: { name: 'yoda' } }

// (a -> b) -> Container a -> Container b
Container.prototype.map = function(f) {
  return Container.of(f(this.__value));
};

console.log( Container.of(2).map(two => two + 2) ); // Container(4)
console.log( Container.of("flamethrowers").map(s => s.toUpperCase()) ); // Container("FLAMETHROWERS")
console.log( Container.of("bombs").map(_.concat(" away")).map(_.prop("length")) ); // Container(10)

// What do we gain from asking our container to apply functions for us?
// Well, __abstraction of function application__.

const Maybe = function(x) {
  this.__value = x;
};

Maybe.of = function(x) {
  return new Maybe(x);
};

Maybe.prototype.isNothing = function() {
  return (this.__value === null || this.__value === undefined);
};

Maybe.prototype.map = function(f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
};

console.log( Maybe.of("Malkovich Malkovish").map(_.match(/a/ig)) ); // Maybe(['a', 'a'])
console.log( Maybe.of(null).map(_.match(/a/ig)) ); // Maybe(null)
console.log( Maybe.of({name: "Boris"}).map(_.prop("age")).map(_.add(10)) ); // Maybe(null)
console.log( Maybe.of({name: "Dinah", age: 14}).map(_.prop("age")).map(_.add(10)) ); // Maybe(24)

// map :: Functor f => (a -> b) -> f a -> f b
const map = _.curry((f, functor) => functor.map(f));

// safeHead :: [a] -> Maybe(a)
const safeHead = xs => Maybe.of(xs[0]);

const streetName = _.compose(map(_.prop('street')), safeHead, _.prop('addresses'));

console.log( streetName({addresses: []}) ); // Maybe(null)
console.log( streetName({addresses: [{street: "Shady Ln.", number: 4201}]}) ); // Maybe("Shady Ln.")

// maybe :: b -> (a -> b) -> Maybe a -> b
const maybe = _.curry((x, f, m) => m.isNothing() ? x : f(m.__value));

const Left = function(x) {
  this.__value = x;
};

Left.of = function(x) {
  return new Left(x);
};

Left.prototype.map = function(f) {
  return this;
};

const Right = function(x) {
  this.__value = x;
};

Right.of = function(x) {
  return new Right(x);
};

Right.prototype.map = function(f) {
  return Right.of(f(this.__value));
};

console.log( Right.of("rain").map(str => "b" + str) ); // Right("brain")
console.log( Left.of("rain").map(str => "b" + str) ); // Left("rain")
console.log( Right.of({host: "localhost", port: 80}).map(_.prop("host")) ); // Left("localhost")
console.log( Left.of("rolls eyes...").map(_.prop("host")) ); // Left("rolls eyes...")

// http://stackoverflow.com/questions/2395697/haskell-newbie-question-what-is-lifting

const id = x => x;

const idLaw1 = _.map(id);
const idLaw2 = id;

console.log( idLaw1(Container.of(2)) ); // Container(2)
console.log( idLaw2(Container.of(2)) ); // Container(2)

const compLaw1 = _.compose(_.map(_.concat(" world")), _.map(_.concat(" cruel")));
const compLaw2 = _.map(_.compose(_.concat(" world"), _.concat(" cruel")));


console.log( compLaw1(Container.of("GoodBye")) ); // Container(' word cruelGoodbye')
console.log( compLaw2(Container.of("GoodBye")) ); // Container(' word cruelGoodbye')

// topRoute :: String -> Maybe String
const topRoute = _.compose(Maybe.of, _.reverse);

// bottomRoute :: String -> Maybe String
const bottomRoute = _.compose(_.map(_.reverse), Maybe.of);

console.log( topRoute("hi") ); // Maybe("ih")
console.log( bottomRoute("hi") ); // Maybe("ih")

const assert = require('assert');

// Identity
const Identity = function(x) {
  this.__value = x;
};

Identity.of = function(x) { return new Identity(x); };

Identity.prototype.map = function(f) {
  return Identity.of(f(this.__value));
};

Identity.prototype.inspect = function() {
  return 'Identity('+inspect(this.__value)+')';
};

// excercise 1
// Use _.add(x,y) and _.map(f,x) to make a function that increments a value
// inside a functor
const ex1 = _.map(_.add(1));
assert.deepEqual(ex1(Identity.of(2)), Identity.of(3));

// excercise 2
// Use _.head to get the first element of the list
const xs = Identity.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);
const ex2 = _.map(_.head);
assert.deepEqual(ex2(xs), Identity.of('do'));

// exercise 3
// Use safeProp and _.head to find the first initial of the user
const safeProp = _.curry((x, o) => Maybe.of(o[x]));
const user = { id: 2, name: "Albert" };
var ex3 = _.compose(_.map(_.head), safeProp('name'));
assert.deepEqual(ex3(user), Maybe.of('A'));

// excercise 4
// Use Maybe to rewrite ex4 without an if statement
const _ex4 = function (n) {
  if (n) { return parseInt(n); }
};

const ex4 = _.compose(_.map(parseInt), Maybe.of);
assert.deepEqual(ex4("4"), Maybe.of(4));

// exercise 5
// Write a function that will getPost then toUpperCase the post's title

const Task = require('data.task');

// getPost :: Int -> Future({id: Int, title: String})
var getPost = function (i) {
  return new Task(function(rej, res) {
    setTimeout(function(){
      res({id: i, title: 'Love them futures'})
    }, 300)
  });
}

const toUpperCase = x => x.toUpperCase();

const ex5 = _.compose(_.map(_.compose(toUpperCase, _.prop('title'))), getPost);

ex5(13).fork(console.log, function(res) {
  assert.deepEqual(res, 'LOVE THEM FUTURES');
});

// exercise 6
// Write a function that uses checkActive() and showWelcome() to grant access
// or return the error

const showWelcome = _.compose(_.add( "Welcome "), _.prop('name'))

const checkActive = function(user) {
 return user.active ? Right.of(user) : Left.of('Your account is not active')
};

const ex6 = _.compose(_.map(showWelcome), checkActive);
assert.deepEqual(ex6({active: false, name: 'Gary'}), Left.of('Your account is not active'));
assert.deepEqual(ex6({active: true, name: 'Theresa'}), Right.of('Welcome Theresa'));

// exercise 7
// Write a validation function that checks for a length > 3. It should return
// Right(x) if it is greater than 3 and Left("You need > 3") otherwise

const ex7 = function(x) {
  return x.length > 3 ? Right.of(x) : Left.of("You need > 3");
};

assert.deepEqual(ex7("fpguy99"), Right.of("fpguy99"));
assert.deepEqual(ex7("..."), Left.of("You need > 3"));

// exercise 8
// Use ex7 above and Either as a functor to save the user if they are valid or
// return the error message string. Remember either's two arguments must return
// the same type.

const IO = function(f) {
  this.unsafePerformIO = f;
};

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
};

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
};

const either = _.curry(function(f, g, e) {
  switch(e.constructor) {
    case Left: return f(e.__value);
    case Right: return g(e.__value);
  }
});

const save = function(x){
  return new IO(function() {
    console.log("SAVED USER!");
    return x + '-saved';
  });
};

const ex8 = _.compose(either(IO.of, save), ex7);

assert.deepEqual(ex8("fpguy99").unsafePerformIO(), "fpguy99-saved");
assert.deepEqual(ex8("...").unsafePerformIO(), "You need > 3");
