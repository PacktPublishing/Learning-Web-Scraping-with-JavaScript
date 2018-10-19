var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

var options = {
  url: 'https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=bulb',
  Headers: {
    userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/7.0.540.0 Safari/525.19",
    acceptEncoding: "gzip, deflate, br",
    acceptLanguage: "en-US,en;q=0.9,ar;q=0.8,fr;q=0.7",
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    cacheControl: 'no-cache',
    pragma: 'no-cache'
  }
};

request(options, function(err, res, html) {
  if (!err) {
    var $ = cheerio.load(html);
    var data = [];

    $('.s-result-item').each(function(i, elm) {

      var toAvoid1 = elm.attribs.class; //Avoid the element with this class acs-private-brands-container-background
      var toAvoid2 = $(elm).find('#osp-search');

      if ((toAvoid1.search("acs-private-brands-container-background")) == -1 &&
        (toAvoid2.length == 0)) {

        console.log(' __________________________ ');

        var title = $(elm).find('h2'),
          price = $(elm).find('.a-column.a-span7'),
          stars = $(elm).find('.a-icon-alt');

        console.log('title: ' + title.attr('data-attribute'));
        console.log('price: ' + price.find('.a-offscreen').text());
        console.log('stars: ' + stars.text());

        data.push({
          title: title.attr('data-attribute'),
          price: price.find('.a-offscreen').text(),
          stars: stars.text()
        });
      } else {
        //Do nothing ...          
      }
    })
    fs.writeFile('result.json', JSON.stringify(data), function(err) {
      if (err) throw err;
      console.log('... JSON file created :)');
    });

  } else {
    console.error("err: ", err);
  }
})
