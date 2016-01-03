/*

// impure
const minimum = 21;

const checkAge = age = age >= minimum;


// pure
const checkAge = age => {
  const minimum = 21;
  return age >= minimum;
};


// impure
const signUp = attrs = {
  let user = saveUser(attrs);
  welcomeUser(user);
};


// pure
const signUp = (Db, Email, attrs) => (() => {
  let user = saveUser(Db, attrs);
  welcomeUser(Email, user);
});

*/

const Immutable = require('immutable');

const decrementHP = player => player.set('hp', player.get('hp') - 1);
const isSameTeam = (player1, player2) => player1.get('team') == player2.get('team');
const punch = (player, target) => {
  if (isSameTeam(player, target)) {
    return target;
  } else {
    return decrementHP(target);
  }
};

const jobe = Immutable.Map({name: 'Jobe', hp: 20, team: 'red'});
const micheal = Immutable.Map({name: 'Micheal', hp: 20, team: 'green'});

console.log(punch(jobe, micheal));
// Map { "name": "Micheal", "hp": 19, "team": "green" }

// A spot of code is referentially transparent when it can be substituted for
// its evaluated value without changing the behavior of the program.

// ``decrementHP``, ``isSameTeam`` and ``punch`` are all pure and therefore
// referentially transparent.

// a technique called equational reasoning wherein one substitutes
// "equals for equals" to reason about code.
