var casper = require("casper").create({
  verbose: false,
  logLevel: 'debug',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/7.0.540.0 Safari/525.19'
  }
});
var searchTerm ='mars';
var url='https://www.google.com/';
var links = [];
var titles = [];
var arrJSON=[];
var fs =require('fs');

function getLinks() {
    var link = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(link, function(e) {
        return e.getAttribute('href');
    });
}
function getTitles() {
    var links = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(links, function(e) {
        return e.innerHTML;
    });
}
function createJSON(){
    for (index=0; index<links.length;index++){
          arrJSON.push({
              title:titles[index],
              link:links[index]
          });
    }
    return JSON.stringify(arrJSON);
};

casper.start(url, function() {
    this.echo("Start ...");
});
casper.then(function() {
   this.waitForSelector('form[action="/search"]');
});
casper.then(function() {
   this.fill(
       'form[action="/search"]', 
       { 
           q: searchTerm 
       },        
       true                      
   ); 
});
casper.then(function() {
    links = this.evaluate(getLinks);
});
casper.then(function() {
    titles = this.evaluate(getTitles);
});
casper.then(function(){    
    for (index=0; index<links.length;index++){
        this.echo(' - '+titles[index] + ', '+links[index]);
    }
});
casper.then(function(){
    var data =createJSON();
    fs.write('result.json', data, 'w');
    
});

casper.run(function(){
    this.echo("... Done :) ").exit();
});





