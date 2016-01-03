
var IO = function(f) {
  this.__value = f;
};

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
};

IO.prototype.map = function(f) {
  return new IO(R.compose(f, this.__value));
};

// IO displays as { __value: [Function] }

// impure helper function to display IO value
function display(io) {
  console.log("IO(" + io.__value() + ")");
};

// io_window :: IO Window
var io_window = new IO(function() {
  return window;
});

display(
  io_window.map(function(win) {
    return win.innerWidth;
  })
); // IO(1535)

display(
  io_window.map(R.prop('location')).map(R.prop('href')).map(R.split('/'))
); // IO(["http:", "", "localhost:8000", ""])

// $ :: String -> IO [DOM]
var $ = function(selector) {
  return new IO(function() {
    return document.querySelectorAll(selector);
  });
};

display(
  $('#myDiv').map(R.head).map(R.prop('innerHTML'))
); // IO("I am some inner html")

// ``__value`` isn't really its contained value, nor is it a private property 
// as the underscore prefix suggests. It is the pin in the grenade and
// it is meant to be pulled by a caller in the most public of ways.
// Let's rename this property to ``unsafePerformIO``
