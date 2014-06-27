Items = new Meteor.Collection('items');
Days = new Meteor.Collection('days');

var CALORIES_NEEDED = 4101; // 3054 to maintain
var CALORIC_MINIMUM = 3054;
var GRAMS_NEEDED = 340; //170 to maintain
var PROTEIN_MINIMUM = 170;

var timeLocked = false;

if (Meteor.isClient) {
  // Default Date is right now
  Session.setDefault('currentDate', new Date());

  setInterval(function() {
    if (!timeLocked) {
      Session.set('currentDate', new Date());
    }
  }, 20000);

  // Client subscribed channels
  Meteor.subscribe('days');
  Meteor.subscribe('allItems');
  // not working correctly
  // Deps.autorun(function() {
  //   Meteor.subscribe('thisWeeksMeals', Session.get('currentDate'));
  // });

// DATE TEMPLATE //
  Template.date.today = function() {
    return moment(Session.get('currentDate')).format('MMMM Do YYYY');
  }

// DATE SELECTOR TEMPLATE //
  Template.date_selector.rendered = function () {
    var picker = new Pikaday({ field: document.getElementById('datepicker') });
    $('#clockpicker').clockpicker()
      .find('input').change(function() {
        var newTime = moment($(this).val(), 'hh:mm');
        var hour = +newTime.format('HH');
        var minute = +newTime.format('mm');
        Session.set('currentDate', moment(Session.get('currentDate')).hour(hour).minute(minute).toDate());
      });
  };

  Template.date_selector.currentDate = function () {
    return moment(Session.get('currentDate')).format('YYYY-MM-DD');
  };

  Template.date_selector.currentTime = function () {
    return moment(Session.get('currentDate')).format('hh:mm a');
  };

  Template.date_selector.events = {
    'change #datepicker' : function (e) {
      var now = moment();
      minute = now.format('mm');
      hour = now.format('HH');
      Session.set('currentDate', moment($(e.target).val()).hour(hour).minute(minute).toDate());
      timeLocked = true;
      setTimeout(function(){timeLocked = false;}, 20000);
    },
    'click #resetTime' : function (e) {
      Session.set('currentDate', moment().toDate());
    }
  }

// ITEM LIST TEMPLATE //
  Template.item_list.items = function () {
    return Items.find({
      date: {
        $gte: moment(Session.get('currentDate')).startOf('day').toDate(),
        $lte: moment(Session.get('currentDate')).endOf('day').toDate()
      }
    }, {sort: {date: -1}});
  };

  Template.item_list.events = {
    'click .clear': function () {
      var sure = confirm('Are you sure?');
      if (sure === true) {
        Items.remove(this._id);
      }
    },
    'click .create': function (event, template) {
      var name = template.find('#name').value;
      var cals = template.find('#cals').value;
      var grams = template.find('#grams').value;
      var date = Session.get('currentDate');
      $("#name").val('');
      $("#cals").val('');
      $("#grams").val('');
      Items.insert({
        name: name,
        cals: cals,
        grams: grams,
        date: Session.get('currentDate')
      });
    }
  };

// REQUIREMENTS TEMPLATE //
  Template.requirements.total_cals = function () {
    var total = 0;
    Template.item_list.items().forEach(function(item) {
      total += +item.cals;
    });
    return total;
  }
  Template.requirements.total_grams = function () {
    var total = 0;
    Template.item_list.items().forEach(function(item) {
      total += +item.grams;
    });
    return total;
  }
  Template.requirements.needed_cals = function () {
    return CALORIES_NEEDED;
  }
  Template.requirements.needed_grams = function () {
    return GRAMS_NEEDED;
  }

// ITEM TEMPLATE //
  Template.item.maybe_selected = function () {
    return Session.equals('selected_id', this._id) ? "selected" : "";
  };

  Template.item.time = function() {
    return moment(this.date).format('hh:mm a');
  };

  Template.item.events = {
    'click': function () {
      Session.set('selected_id', this._id);
    }
  };

// AUTORUN //
  Deps.autorun(function(){
    if (Template.requirements.total_cals() >= CALORIC_MINIMUM) {
      $('#total_cals').addClass('met');
    } else {
      $('#total_cals').removeClass('met');
    }
    if (Template.requirements.total_grams() >= PROTEIN_MINIMUM) {
      $('#total_grams').addClass('met');
    } else {
      $('#total_grams').removeClass('met');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // Publish all days to 'days' channel
    Meteor.publish('days', function () {
      return Days.find();
    });

    // Publish all items to 'allItems' channel
    Meteor.publish('allItems', function () {
      return Items.find();
    });

    // @TODO: Publish this week's items to 'thisWeeksMeals' channel
    // Meteor.publish('thisWeeksMeals', function (date) {
    //   // Fetch meals for the past seven days (including today)
    //   return Items.find({
    //     date : {
    //       $gte: moment(date).subtract(7,'days').startOf('day').toDate(),
    //       $lte: moment(date).endOf('day').toDate()
    //     }
    //   }, {sort: {date: -1}});
    // });
  });
}
