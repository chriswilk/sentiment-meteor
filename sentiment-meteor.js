

if (Meteor.isClient) {
  Template.contentURL.helpers({
//    counter: function () {
//      return Session.get('counter');
//    }
  });

  Template.contentURL.events({
    'change input': function (e, tmpl) {

      var contentPath = e.target.value;
      var content = {};


      var capi_base = "http://content.guardianapis.com";
      var capi_key = "api-key=gnm-hackday";
      var capi_fields= "show-fields=body,shortUrl";

      var requestUrl = capi_base + contentPath + "?" + capi_key + "&" + capi_fields;

      $.get(requestUrl, function (response) {
       content = response.response.content.fields;
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  console.log('hello');
    // code to run on server at startup
  });
}
