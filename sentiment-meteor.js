///world/2015/feb/27/david-haines-widow-dragana-mohammed-emwazi-isis-jihadi-john

var getDiscussions = function (discussionId) {
    var url = "http://discussion.guardianapis.com/discussion-api/discussion/" + discussionId;

    $.get(url, function (response) {

        var commentBodyList = []

        response['discussion']['comments'].forEach(function (c) {
            commentBodyList.push(c.body);
        });

        getThemes(commentBodyList, 'comment-themes');
    });
};

var makeCall = function (contentPath) {
  var capi_base = "http://content.guardianapis.com";
  var capi_key = "api-key=gnm-hackday";
  var capi_fields= "show-fields=headline,body,shortUrl";

  var requestUrl = capi_base + contentPath + "?" + capi_key + "&" + capi_fields;

  $.get(requestUrl, function (response) {
   Session.set('article', response.response.content.fields);


   var trimmedBody = $(response.response.content.fields.body).text().substring(0, 8192);

   getThemes([trimmedBody], 'article-themes');
  }).then(function () {
  var discussionId = Session.get('article').shortUrl.replace('http://gu.com/', '');
    getDiscussions(discussionId);
  });
};

var consumerKey = "d86e29a7-cb4d-748b-4da8-6e40f4ddc34a";
var consumerSecret = "69299b58-ecbe-d860-7a61-573518717e8c";

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
};

function getThemes(data, category) {
  var collectionId = (new Date).getTime();
  sendData(category + ":" + collectionId, data);

  setTimeout(function () {

    var results = session.getProcessedCollections();
    for (var i = 0; i < results.length; i++) {
      var x = results[i]["id"].substring(0, results[i]["id"].indexOf(":"));
      console.log("Received " + results[i]["id"] + " (" + x + ")")
      console.log(results[i]["themes"])
      Session.set(x, results[i]["themes"]);
      Session.set(x + "-entities", results[i]["entities"]);
      Session.set(x + "-facets", results[i]["facets"]);
    }
    return null;
  }, 10000);



};

if (Meteor.isClient) {
  Template.contentURL.helpers({
    articleBody: function () {
      return Session.get('article').body;
    },
    articleHeadline: function () {
      return Session.get('article').headline;
    },
    article: function () {
      return Session.get('article');
    },
     discussionId: function () {
       return Session.get('article').shortUrl.replace('http://gu.com/', '');
     },
     articleThemes: function () {
        return Session.get('article-themes');
     },
     articleThemesEntities: function () {
         return Session.get('article-themes-entities');
      },
     articleThemesFacets: function () {
          return Session.get('comment-themes-facets');
       },
     commentThemes: function () {
         return Session.get('comment-themes');
      },
      commentThemesEntities: function () {
       return Session.get('comment-themes-entities');
     },
    commentThemesFacets: function () {
        return Session.get('comment-themes-facets');
     }

  });

  Template.contentURL.events({
    'click button': function (e, tmpl) {
        Session.set('article', null);
        Session.set('article-themes', null);
        Session.set('comment-themes', null);
        Session.set('comment-themes-entities', null);
        Session.set('comment-themes-facets', null);

        //makeCall("/world/2015/feb/27/david-haines-widow-dragana-mohammed-emwazi-isis-jihadi-john");
        makeCall("/education/2015/feb/27/labour-would-cut-top-level-university-tuition-fees-6000");
    },
    'change input': function (e, tmpl) {
        Session.set('article', null);
        Session.set('article-themes', null);
        Session.set('comment-themes', null);
        Session.set('comment-themes-entities', null);
        Session.set('comment-themes-facets', null);
        makeCall(e.target.value);



    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  console.log('hello');
    // code to run on server at startup
  });
}
