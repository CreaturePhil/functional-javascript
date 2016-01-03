requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
  'ramda',
  'jquery'
],
function (_, $) {
  var trace = _.curry(function(tag, x) {
    console.log(tag, x);
    return x;
  });

  // app

  var Impure = {
    getJSON: _.curry(function(callback, url) {
      $.getJSON(url, callback);
    }),

    setHtml: _.curry(function(sel, html) {
      $(sel).html(html);
    })
  };

  // 1. Construct a url for our particular search term
  var url = function (term) {
    return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' +
    term + '&format=json&jsoncallback=?';
  };

  // 2. Make the flickr api call
  //var app = _.compose(Impure.getJSON(trace("response")), url);

  // 3. Transform the resulting json into html images
  var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

  //var srcs = _.compose(_.map(mediaUrl), _.prop('items'));


  var img = function(url) {
    return $("<img />", {src: url});
  };

  var mediaToImg = _.compose(img, mediaUrl);

  // optimize the maps
  var images = _.compose(_.map(mediaToImg), _.prop('items'));

  // 4. Place them on the screen

  var renderImages = _.compose(Impure.setHtml("body"), images);
  var app = _.compose(Impure.getJSON(renderImages), url);

  app("cats");
});
