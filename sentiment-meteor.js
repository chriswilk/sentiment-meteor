

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.contentURL.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.contentURL.events({
    'change input': function () {
      // increment the counter when button is clicked
      console.log('hi')
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  console.log('hello');
    // code to run on server at startup
  });
}
