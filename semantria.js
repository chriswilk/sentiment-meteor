var XMLHttpRequest = Meteor.npmRequire("xmlhttprequest").XMLHttpRequest;

var consumerKey = "<private>"
var consumerSecret = "<private>"

session = new Semantria.Session(consumerKey, consumerSecret, "myApp");
session.override({
  onError: function() {
    console.warn("onError:");
    console.warn(arguments);
  },

  onRequest: function() {
    console.log("onRequest:");
    console.log(arguments);
  },

  onResponse: function() {
    console.log("onResponse:");
    console.log(arguments);
  },

  onAfterResponse: function() {
    console.log("onAfterResponse:");
    console.log(arguments);
  }
});

function sendData(collectionId, data) {

  var result = session.queueCollection({
    id: collectionId,
    documents: data
  });

  if(result == 202) {
    console.log("Success")
    return true
  } else {
    console.log("Failure")
    return false
  }
}

function getThemes(data) {
  var collectionId = (new Date).getTime();
  sendData(collectionId, data);
  Meteor._sleepForMs(2000);
  var results = session.getProcessedCollections();
  for (var i = 0; i < results.length; i++) {
    if (results[i]["id"] == collectionId)
      return results[i]["themes"];
  }
  return null;
}

foo = [
    "A proposal that is about to come before the UN to restrict global access to ketamine, a drug abused in rich countries, would deprive millions of women of lifesaving surgery in poor countries, according to medicines campaigners.",
    "Yeah, because the prohibition of other substances has been such a success!",
    "I think it's just a reflection of China's zero tolerance approach to anything regardless of the impact to poor people."];

//console.log(getThemes(foo))