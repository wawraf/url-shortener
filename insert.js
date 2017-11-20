var mongo = require("mongodb").MongoClient, db_url = process.env.MONGOLAB_URI, random = require("randomatic");

mongo.connect(db_url, function(err, db) {
  if (err) throw err;
  var collection = db.collection("url");
  var short = random("A0", 4);
  var entry = {original_url: "https://www.google.pl", short: short, short_url: "https://sulky-attraction.glitch.me/" + short};
  collection.insertOne(entry, function(err, result) {
    if (err) throw err;
    db.close();
  })
})