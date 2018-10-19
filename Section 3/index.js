const casper = require("casper").create({
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

var _this = this;

const url = 'https://www.airbnb.com/s/homes?refinement_paths%5B%5D=%2Fhomes&adults=1&children=0&infants=0&toddlers=0&query=Stockholm%2C%20Sweden&place_id=ChIJywtkGTF2X0YRZnedZ9MnDag&allow_override%5B%5D=&s_tag=j0rT-tZK';
let title = [],
  price = [],
  reviews = [],
  description = [],
  picture = [],
  arrJSON = [];
import fs from 'fs';

function getTitle() {
  let title = document.querySelectorAll('._jnrahhr');
  return Array.prototype.map.call(title, e => e.innerText);
}

function getDescription() {
  let description = document.querySelectorAll('._1etkxf1 ._13dbiegr');
  return Array.prototype.map.call(description, e => e.innerText);
}

function getImg() {
  let picture = document.querySelectorAll('._1df8dftk');
  return Array.prototype.map.call(picture, e => {
    let position1 = e.getAttribute('style').search(/https/),
      position2 = e.getAttribute('style').search(/jpg/);
    return e.getAttribute('style').slice(position1, position2 + 3);
  });
}

function getPrice() {
  let price = document.querySelectorAll('._ncmdki');
  return Array.prototype.map.call(price, e => e.innerText);
}

function getViews() {
  let reviews = document.querySelectorAll('._1gvnvab ._p1g77r');
  return Array.prototype.map.call(reviews, e => e.innerText);
}

function createJSON() {
  let index;
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

casper.start(url, function() {
  _this = this;
  this.echo("Start ...");
});

casper.waitForSelector('[data-hypernova-key=spaspabundlejs]', function() {
  console.log('... The page is loaded ...');
});

casper.then(() => {
  console.log(_this);
  title = _this.evaluate(getTitle);
});

casper.then(() => {
  description = _this.evaluate(getDescription);
});

casper.then(() => {
  picture = _this.evaluate(getImg);
});

casper.then(() => {
  price = _this.evaluate(getPrice);
});

casper.then(() => {
  reviews = _this.evaluate(getViews);
});

casper.then(() => {
  for (var index = 0; index < title.length; index++) {
    _this.echo(` - ${title[index]}, ${description[index]}, ${price[index]}, ${reviews[index]}, ${picture[index]}`);
  }
});

casper.then(() => {
  var data = createJSON();
  fs.write('result.json', data, 'w');
});

casper.then(() => {
  let body = document.getElementsByTagName('body')[0],
    table = document.createElement('table'),
    br = document.createElement("br"),
    tbdy = document.createElement('tbody');
  table.style.width = "50%";
  table.setAttribute('border', '1');
  for (var index = 0; index < title.length; index++) {
    let tr = document.createElement('tr'),
      td1 = document.createElement('td'),
      td2 = document.createElement('td'),
      img = document.createElement('img');
    td1.appendChild(document.createTextNode(`Title: ${title[index]}`));
    td1.appendChild(document.createElement("br"));
    td1.appendChild(document.createTextNode(`Description: ${description[index]}`));
    td1.appendChild(document.createElement("br"));
    td1.appendChild(document.createTextNode(price[index]));
    td1.appendChild(document.createElement("br"));
    td1.appendChild(document.createTextNode(`Reviews: ${reviews[index]}`));
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


casper.run(function() {
  _this.echo("... Done :) ").exit();
});
