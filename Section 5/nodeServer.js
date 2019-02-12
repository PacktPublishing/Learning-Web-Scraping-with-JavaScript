/* Scraping     */
// **************
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
var dataResult = []; // Scraping result

/* Server       */
// **************
var express = require('express');//Express to set the server
var app = express();
var cors = require('cors');//Cors to send/receive data in JSON format
var path = require('path');//To set the public path where the index.html is saved
var bodyParser = require('body-parser')
app.use(bodyParser.json()); //To support JSON-encoded bodies
app.use(express.json()); //To support JSON-encoded bodies
var port = process.env.PORT || 3000;//Set the server port (to listen) 
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));
var clear = require('clear');

/* Amazon Web Services (AWS)*/
// **************************
var config = require('config-json');//config-json to store the AWSAccessKeyId and the AWSSecretKey
config.load('./config.json');
var aws = require('aws-sdk');
var AWSAccessKeyId = config.get('AWSAccessKeyId'),
  AWSSecretKey = config.get('AWSSecretKey');
aws.config.update({
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey
});
var s3 = new aws.S3();
var bucketName ='scrapingfolders3',
    fileS3Name = 'scrapingresults3.json';
              
var dataRead = []; // Data read from the S3 file
var msg;


/*** Write into the S3 file ***/
var writeS3File = function(dataRead) {
  return new Promise(function(resolve, reject) {
    var getParams = {
      Bucket: bucketName,
      Key: fileS3Name
    };

    return s3.getObject(getParams, function(err, data) {
      if (err) {
        console.log(err);
        msg = "Nok";
      } else {
        params = {
          Bucket: bucketName,
          Key: fileS3Name,
          Body: JSON.stringify(dataRead)
        };
        s3.putObject(params, function(err, data) {
          if (err) {
            console.log(err);
            msg = "Nok";
          } else {
            msg = "Ok";
            resolve();
          }
        })
      }
    })
  });
}

/*** Read from the S3 file ***/
var readS3File = function() {
  return new Promise(function(resolve, reject) {

    var getParams = {
      Bucket: bucketName,
      Key: fileS3Name
    };

    s3.getObject(getParams, function(err, data) {
      if (err) {
        msg = "Nok";
        console.log(err);
      } else {
        dataRead = []; //reset
        dataRead = JSON.parse(data.Body.toString());
        for (var i = 0; i < dataRead.length; i++) {
          console.log("Title:[" + i + "]  " + dataRead[i].title);
        };
        msg = "Ok";
        resolve();
      }
    })
  });
}

/*** Scraping ***/ 
app.get('/startScraping', function(req, res) {
  request(options, function(err, res, html) {
    if (!err) {
      var $ = cheerio.load(html);

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

          dataResult.push({
            title: title.attr('data-attribute'),
            price: price.find('.a-offscreen').text(),
            stars: stars.text()
          });
        } else {
          //Do nothing ...          
        }
      })
      fs.writeFile('result.json', JSON.stringify(dataResult), function(err) {
        if (err) throw err;
        console.log('... JSON file created :)');
      });

    } else {
      console.error("err: ", err);
    }
  })
  res.json({
    "status": "Ok",
  });
});
/*** Write ***/ 
app.get('/writeS3File', function(req, res) {
  writeS3File(dataResult).then(function() {
    res.json({
      "status": msg
    });
  }).catch(function(err){
      console.log(err);
  });
});
/*** Read ***/ 
app.get('/readS3File', function(req, res) {
  readS3File().then(function() {
    res.json({
      "status": msg
    });
  }).catch(function(err){
      console.log(err);
  });
});

/*** Start the server ***/
// **********************
clear(); //clear screen
console.log(' ***** Start session *** ');
console.log(' *****               *** ');
app.listen(port);
