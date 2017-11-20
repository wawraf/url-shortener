// search.js

// this file search the mongo database at mLab server - if passed parameter is a correct link it redirects user, if not - throwing an error or create and entry in db (only if url is valid)

// for url validation npm module "is-http-url" is used

// for short_url generation npm module "randomatic" is used

var mongo = require("mongodb").MongoClient, db_url = process.env.MONGOLAB_URI, random = require("randomatic"), valid_url = require("is-http-url");

module.exports = {
  
  // This method check if the short url exist in DB, if not if goes to "make" method
  check: function(url, callback) {
    console.log("Checking");
    var make = this.make;
    mongo.connect(db_url, function(err, db) {
      if (err) throw err;
      var collection = db.collection("url");
      collection.find({short: url}).toArray(function(err, result) { 
        if (err) throw err;
        (result.length === 1) ? callback(result) : check(url, callback); // if short already in the database send result (array with one object in it), if not call check()
        db.close();
      });
    });
    
    function check(url, callback) { // check if parameter is proper short code or url
      if (url.length === 4 && /[0-9A-Z]{4}/.test(url)) {callback({"error":"This short is not on the database."})}  // if has length 4 and not A0 throw error
      else if (!valid_url(url)) {callback({"error":"Passed URL address is incorrect."})} // if not valid url throw error
      else {make(url, callback)}; // if valid url call make method
    }
  },
  
  // This method creates new entry, but first checks whether provided URL already exists in DB
  make: function(url, callback) {
    var checkAgain = this.check;
    console.log("Making");
    mongo.connect(db_url, function(err, db) {
      if (err) throw err;
      var collection = db.collection("url");
      
      // find provided url in the database - if exist send result (array) if not create unique code (function code())
      collection.findOne({original_url: url}, {_id: false, short: false}, function(err, result) {
        if (err) throw err;
        if (result !== null) {
          callback(result);
        } else {
          code();
          var short = "";
          function code() {
            short = random("A0", 4);
            if (checkIfShortTaken(short)) { code() } else { add(short, url, callback) } // if code already taken make code again, if not add entry to DB
          }
        }
      });
      
      function checkIfShortTaken(short) {
        return collection.findOne({short: short}, function(err, result) {
          if (err) throw err;
          if (result === null) {return false} else {return true};
          db.close();
        });
      }
      
      // add entry to the database and throw the result (array)
      function add(short, original, callback) {
        var entry = {original_url: original, short: short, short_url: "https://sulky-attraction.glitch.me/" + short};
        collection.insertOne(entry, function(err, result) {
          if (err) throw err;
          collection.findOne({short: short}, {_id: false, short: false}, function(err, result) { 
            if (err) throw err;
            callback(result);
            db.close();
          });
          db.close();
        })
      }
      
    })
  },
}