///world/2015/feb/27/david-haines-widow-dragana-mohammed-emwazi-isis-jihadi-john

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

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

//  var result = session.queueDocument({
//    id: collectionId,
//    text: data.join(" ")
//  });

  if(result == 202) {
    console.log("Success")
    return true
  } else {
    console.log("Failure")
    return false
  }
};

function calculateTotals (themes, data, category) {
    var seedTotalCount = {
        positive: 0,
        neutral: 0,
        negative: 0
      };

      var total = 0;

      data.forEach(function (x) {
        seedTotalCount.positive += x.positive_count;
        seedTotalCount.neutral += x.neutral_count;
        seedTotalCount.negative += x.negative_count;

        //total += x.positive_count + x.neutral_count + x.negative_count;
      });

      var theme_negative = 0;
      var theme_positive = 0;

      themes.forEach(function (x) {
        if (x.sentiment_score > 0) {
            theme_positive += x.sentiment_score
        } else {
            theme_negative -= x.sentiment_score
        }
      });

      console.log(theme_positive)
      console.log(theme_negative)

      seedTotalCount.positive += (10 * theme_positive);
      seedTotalCount.negative += (10 * theme_negative);

      total = seedTotalCount.positive + seedTotalCount.neutral + seedTotalCount.negative


    var seedTotal = {
        positive: (seedTotalCount.positive / total) * 100,
        neutral: (seedTotalCount.neutral / total) * 100,
        negative: (seedTotalCount.negative / total) * 100
    };

    console.log(seedTotal)
    Session.set(category + "-totals", seedTotal);
    console.log(category + "-totals");
    console.log(seedTotal);

}

function pollSemantra() {
    var results = session.getProcessedCollections();
//    var results = session.getProcessedDocuments();
    for (var i = 0; i < results.length; i++) {
      var x = results[i]["id"].substring(0, results[i]["id"].indexOf(":"));
      console.log("Received " + results[i]["id"] + " (" + x + ")")
      console.log(results)
      Session.set(x, results[i]["themes"]);
      Session.set(x + "-entities", results[i]["entities"]);
      Session.set(x + "-facets", results[i]["facets"]);
      calculateTotals(results[i]["themes"], results[i]["entities"], x);
    }
    return null;
}
function getThemes(data, category) {
  var collectionId = (new Date).getTime();
  sendData(category + ":" + collectionId, data);

  for (var i = 0; i < 20; i ++) {
    setTimeout(pollSemantra, i * 500);
  }
};

if (Meteor.isClient) {
    Meteor.startup(function () {
       var url = getParameterByName('url');
        url = url.replace('http://www.theguardian.com', '');
        console.log(url)
        makeCall(url);

      });

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
          return Session.get('article-themes-facets');
       },
     commentThemes: function () {
         return Session.get('comment-themes');
      },
      commentThemesEntities: function () {
       return Session.get('comment-themes-entities');
     },
    commentThemesFacets: function () {
        return Session.get('comment-themes-facets');
     },
     article_positive_percent: function () {
        return Session.get('article-themes-totals').positive;
     },

    article_neutral_percent: function () {
        return Session.get('article-themes-totals').neutral;
    },
    article_negative_percent: function () {
        return Session.get('article-themes-totals').negative;
    },

    discussion_positive_percent: function () {
        return Session.get('comment-themes-totals').positive;
     },

    discussion_neutral_percent: function () {
        return Session.get('comment-themes-totals').neutral;
    },
    discussion_negative_percent: function () {
        return Session.get('comment-themes-totals').negative;
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
