var casper = require("casper").create({
  verbose: false,
  logLevel: 'debug',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    javascriptEnabled: true,
    customHeaders: {
      acceptEncoding: "gzip, deflate, br",
      acceptLanguage: "en-US,en;q=0.9,ar;q=0.8,fr;q=0.7",
      userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/7.0.540.0 Safari/525.19"
    }
  }
});

var url = 'https://www.airbnb.com/s/homes?refinement_paths%5B%5D=%2Fhomes&adults=1&children=0&infants=0&toddlers=0&query=Stockholm%2C%20Sweden&place_id=ChIJywtkGTF2X0YRZnedZ9MnDag&allow_override%5B%5D=&s_tag=j0rT-tZK',
  title = [],
  price = [],
  description = [],
  reviews = [],
  picture = [],
  arrJSON = [],
  fs = require('fs');

function getTitle() {
  var title = document.querySelectorAll('._jnrahhr');
  return Array.prototype.map.call(title, function(e) {
    return e.innerText;
  });
}

function getDescription() {
  var description = document.querySelectorAll('._1etkxf1 ._13dbiegr');
  return Array.prototype.map.call(description, function(e) {
    return e.innerText;
  });
}

function getImg() {
  var picture = document.querySelectorAll('._1df8dftk');
  return Array.prototype.map.call(picture, function(e) {
    var position1 = e.getAttribute('style').search(/https/),
      position2 = e.getAttribute('style').search(/jpg/);
    return e.getAttribute('style').slice(position1, position2 + 3);
  });
}

function getPrice() {
  var price = document.querySelectorAll('._ncmdki');
  return Array.prototype.map.call(price, function(e) {
    return e.innerText;
  });
}

function getReviews() {
  var reviews = document.querySelectorAll('._1gvnvab ._p1g77r');
  return Array.prototype.map.call(reviews, function(e) {
    return e.innerText;
  });
}

function createJSON() {
  for (index = 0; index < price.length; index++) {
    arrJSON.push({
      title: title[index],
      description: description[index],
      price: price[index],
      review: reviews[index],
      link: picture[index]
    });
  }
  return JSON.stringify(arrJSON);
};

function createElement(parent, title, content) {
  var titleDiv = document.createElement("div");
  titleDiv.innerHTML = title + content;
  parent.appendChild(titleDiv);
}


casper.start(url, function() {
  this.echo("Start ...");
});

casper.waitForSelector('[data-hypernova-key=spaspabundlejs]', function() {
  console.log('... The page is loaded ...');
});

casper.then(function() {
  title = this.evaluate(getTitle);
});

casper.then(function() {
  description = this.evaluate(getDescription);
});

casper.then(function() {
  picture = this.evaluate(getImg);
});

casper.then(function() {
  price = this.evaluate(getPrice);
});

casper.then(function() {
  reviews = this.evaluate(getReviews);
});

casper.then(function() {
  for (index = 0; index < title.length; index++) {
    this.echo(' - ' + title[index] + ', ' + description[index] + ', ' + price[index] + ', ' + reviews[index] + ', ' + picture[index]);
  }
});

casper.then(function() {
  var data = createJSON();
  fs.write('result.json', data, 'w');
});

casper.then(function() {
  var body = document.getElementsByTagName('body')[0],
    table = document.createElement('table'),
    br = document.createElement("br"),
    tbdy = document.createElement('tbody'),
    script = document.createElement("link");
  script.setAttribute("rel", "stylesheet");
  script.setAttribute("href", "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css");

  body.appendChild(script);
  table.style.width = "50%";
  table.setAttribute('border', '1');
  table.setAttribute("class", "table");
  for (index = 0; index < title.length; index++) {
    var tr = document.createElement('tr'),
      td1 = document.createElement('td'),
      td2 = document.createElement('td'),
      img = document.createElement('img');

    createElement(td1, 'Title: ', title[index]);
    createElement(td1, 'Description: ', description[index]);
    createElement(td1, '', price[index]);
    createElement(td1, 'Reviews: ', reviews[index]);

    img.setAttribute('src', picture[index]);
    img.setAttribute('width', '200px');
    td2.appendChild(img);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbdy.appendChild(tr);
  }
  table.appendChild(tbdy);
  body.appendChild(table);
  fs.write('result.html', body.outerHTML, 'w');
});

casper.then(function() {
  this.echo("... Done :) ").exit();
});

casper.run();
