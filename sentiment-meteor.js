///world/2015/feb/27/david-haines-widow-dragana-mohammed-emwazi-isis-jihadi-john

var makeCall = function (contentPath) {
  var capi_base = "http://content.guardianapis.com";
  var capi_key = "api-key=gnm-hackday";
  var capi_fields= "show-fields=headline,body,shortUrl";

  var requestUrl = capi_base + contentPath + "?" + capi_key + "&" + capi_fields;

  $.get(requestUrl, function (response) {
  console.log(response)
   Session.set('article', response.response.content.fields);
  }).then(function () {
    console.log('done');
  });
};

if (Meteor.isClient) {
  Template.contentURL.helpers({
    articleBody: function () {
      return Session.get('article').body;
    },
    article: function () {
      return Session.get('article');
    },
     commentId: function () {
       return Session.get('article').shortUrl.replace('http://gu.com/', '');
     }

  });

  Template.contentURL.events({
    'click button': function (e, tmpl) {

        makeCall("/world/2015/feb/27/david-haines-widow-dragana-mohammed-emwazi-isis-jihadi-john");
    },
    'change input': function (e, tmpl) {

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
