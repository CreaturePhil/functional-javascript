'use strict';

const _ = require('ramda');

// strLength :: String -> Number
const strLength = s => s.length;

// join :: String -> [String] -> String
const join = _.curry((what, xs) => xs.join(what));

// match :: Regex -> (String -> [String])
const match = _.curry((req, s) => s.match(reg));

// replace :: Regex -> (String -> (String -> String))
const replace = _.curry((reg, sub, s) => s.replace(reg, sub));

// onHoliday :: String -> [String]
const onHoliday = match(/holiday/ig);

// id :: a -> a
const id = x => x;

// map :: (a -> b) -> [a] -> [b]
const map = _.curry((f, xs) => xs.map(f));

// addOne :: [a] -> [b]
const addOne = map(x => x + 1);

// head :: [a] -> a
const head = xs => xs[0];

// filter :: (a -> Bool) -> [a] -> [a]
const filter = _.curry((f, xs) => xs.filer(f));

// reduce :: (b -> a -> b) -> b -> [a] -> b
const reduce = _.curry((f, x, xs) => xs.reduce(f, x));
