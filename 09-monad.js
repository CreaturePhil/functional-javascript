'use strict';

// setup start

const fs = require('fs');
const _ = require('ramda');
const assert = require('assert');
const compose = _.compose;
const curry = _.curry;
const map = _.map;

const IO = function(f) {
  this.unsafePerformIO = f;
};

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
};

IO.prototype.map = function(f) {
  return new IO(compose(f, this.unsafePerformIO));
};

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

// setup end

//
// A pointed functor is a functor with an ``of`` method
//

// readFile :: String -> IO String
const readFile = filename => new IO(() => fs.readFileSync(filename, 'utf-8'));

// print :: String -> IO String
const print = x => (new IO(() => {
  console.log(x);
  return x;
}));

// cat :: String -> IO (IO String)
const cat = compose(map(print), readFile);

cat("01-flock.js").unsafePerformIO().unsafePerformIO();
// IO(IO("FILE CONTENTS HERE"))

// catFirstChar :: String -> IO (IO String)
const catFirstChar = compose(map(map(_.head)), cat);

console.log( catFirstChar("01-flock.js").unsafePerformIO().unsafePerformIO() );
// IO(IO("'"))

// safeProp :: Key -> {Key: a} -> Maybe a
const safeProp = curry((x, obj) => new Maybe(obj[x]));

// safeHead :: [a] -> Maybe a
const safeHead = safeProp(0);

// firstAddressStreet :: User -> Maybe (Maybe (Maybe Street))
const firstAddressStreet = compose(
  map(map(safeProp('street'))), map(safeHead), safeProp('addresses')
);

const result = firstAddressStreet(
  {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}
);

console.log( result );
console.log( result.__value.__value.__value );
// Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))

//
// Monads are pointed functors that can flatten
//

Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this.__value;
};

const mmo = Maybe.of(Maybe.of("nunchucks"));

console.log( mmo );        // Maybe(Maybe("nunchucks"))
console.log( mmo.join() ); // Maybe("nunchucks")

// join :: Monad m => m (m a) -> m a
const join = (mma) => mma.join();

// firstAddressStreet2 :: User -> Maybe Street
const firstAddressStreet2 = compose(
  join, map(safeProp('street')), join, map(safeHead), safeProp('addresses')
);

const result2 = firstAddressStreet2(
  {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}
);

console.log( result );
console.log( result.__value.__value.__value );
// Maybe({name: 'Mulburry', number: 8402})

IO.prototype.join = function() {
  return this.unsafePerformIO();
};

const ioio = IO.of(IO.of("pizza"));

console.log( ioio );        // IO(IO("pizza"))
console.log( ioio.join() ); // IO("pizza")

// chain :: Monad m => (a -> m b) -> m a -> m b
const chain = curry((f, m) => m.map(f).join()); // or compose(join, map(f))(m)
// also called ``bind`` (>>=) or ``flapMap``

const firstAddressStreet3 = compose(
  chain(safeProp('street')), chain(safeHead), safeProp('addresses')
);

const result3 = firstAddressStreet3(
  {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}
);

console.log( result );
console.log( result.__value.__value.__value );
// Maybe({name: 'Mulburry', number: 8402})

// getJSON :: Url -> Params -> Task JSON
// querySelector :: Selector -> IO DOM

/*
  getJSON('/authenticate', {username: 'stale', password: 'crackers'})
    .chain(user => getJSON('/friends', {user_id: user.id}));
  });
  // Task([{name: 'Seimith', id: 14}, {name: 'Ric', id: 39}]);
*/

Maybe.prototype.chain = function(f) {
  return this.map(f).join();
};

console.log(
  Maybe.of(3).chain(three => Maybe.of(2).map(_.add(3)))
); // Maybe(5)

console.log(
  Maybe.of(null).chain(safeProp('address')).chain(safeProp('street'))
); // Maybe(null)

// join can also be define as ``chain(id)``

/*

querySelector("input.username").chain(function(uname) {
  return querySelector("input.email").chain(function(email) {
    return IO.of(
      "Welcome " + uname.value + " " + "prepare for spam at " + email.value
    );
  });
});
// IO("Welcome Olivia prepare for spam at olivia@tremorcontrol.net");

*/

// vs

/*
querySelector("input.username").chain(function(uname) {
  return querySelector("input.email").map(function(email) {
    return "Welcome " + uname.value + " prepare for spam at " + email.value;
  });
});
// IO("Welcome Olivia prepare for spam at olivia@tremorcontrol.net");
*/

// Remember to map when returning a "normal" value and chain when
// we're returning another functor.
// As a reminder, this does not work with two different nested types. Functor
// composition and later, monad transformers, can help us in that situation.

/*

// readFile :: Filename -> Either String (Task Error String)
// httpPost :: String -> Task Error JSON

//  upload :: String -> Either String (Task Error JSON)
var upload = compose(map(chain(httpPost('/uploads'))), readFile);

*/

// vs

/*

//  upload :: String -> (String -> a) -> Void
var upload = function(filename, callback) {
  if (!filename) {
    throw "You need a filename!";
  } else {
    readFile(filename, function(err, contents) {
      if (err) throw err;
      httpPost(contents, function(err, json) {
        if (err) throw err;
        callback(json);
      });
    });
  }
}

*/

const mmf = Maybe.of(Maybe.of(1));

// Monad laws

// associativity
console.log( compose(join, map(join))(mmf) === compose(join, join)(mmf) );

// identity for all (M a)
//compose(join, of) == compose(join, map(of)) == id

const mcompose = (f, g) => compose(chain(f), chain(g));

// left identity
// mcompose(M, f) == f

// right identity
// mcompose(f, M) == f

// associativity
// mcompose(mcompose(f, g), h) == mcompose(f, mcompose(g, h))

// exercise 1
// Use safeProp and map/join or chain to safely get the street name when given
// a user
const user = {
  id: 2,
  name: "albert",
  address: {
    street: {
      number: 22,
      name: 'Walnut St'
    }
  }
};

const ex1 = compose(
  chain(safeProp('name')), chain(safeProp('street')), safeProp('address')
);
assert.deepEqual(ex1(user), Maybe.of('Walnut St'));
