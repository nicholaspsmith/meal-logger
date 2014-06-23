Items = new Meteor.Collection('items');
Days = new Meteor.Collection('days');


var CALORIES_NEEDED = 4101; // 3054 to maintain
var GRAMS_NEEDED = 340; //170 to maintain

var currentId = 0;

if (Meteor.isClient) {
  Meteor.subscribe('days');
  Meteor.subscribe('items');
  Deps.autorun(function() {
    Meteor.subscribe('currentDay', Session.get('currentDate'));
  });

  Session.setDefault('currentDate', moment().toDate());

  Template.date.today = function() {
    return moment(Session.get('currentDate')).format('MMMM Do YYYY');
  }


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
    'click .create': function () {
      var name = $('#name').val();
      var cals = $('#cals').val();
      var grams = $('#grams').val();
      var date = Session.get('currentDate');
      date.setHour($('#timePicker').val());
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

  Deps.autorun(function(){
    if (Template.requirements.total_cals() >= CALORIES_NEEDED) {
      $('#total_cals').addClass('met');
    } else {
      $('#total_cals').removeClass('met');
    }
    if (Template.requirements.total_grams() >= GRAMS_NEEDED) {
      $('#total_grams').addClass('met');
    } else {
      $('#total_grams').removeClass('met');
    }
  });

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

  Template.date_selector.rendered = function () {
    var picker = new Pikaday({ field: document.getElementById('datepicker') });
    $('#clockpicker').clockpicker()
      .find('input').change(function() {
        var newTime = moment($(this).val(), 'hh:mm').format('hh:mm a');
        $('#clockpicker .form-control').val(newTime);
      });
    $('#clockpicker .form-control').val(moment(this.date).format('hh:mm a'));
    $('.cover').on('click',function(){$(this).slideUp()});
  };

  Template.date_selector.currentDate = function () {
    return moment(Session.get('currentDate')).format('YYYY-MM-DD');
  };

  Template.date_selector.events = {
    'change #datepicker' : function (e) {
      Session.set('currentDate', moment($(e.target).val()).toDate());
    },
    'click .cover' : function (e) {
      return false;
    }
  }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish('days', function () {
      return Days.find();
    });

    Meteor.publish('items', function () {
      return Items.find({
        date: {
          $gte: moment().subtract('days', 7).startOf('day')
        }
      });
    });

    Meteor.publish('currentDay', function (date) {
      return Items.find({
        date: {
          $gte: moment(date).startOf('day').toDate(),
          $lte: moment(date).endOf('day').toDate()
        }
      });
    });
  });
}
