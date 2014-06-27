(function () {
    "use strict";

    jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmine.getEnv().defaultTimeoutInterval = 20000;

    Template.stub('date');
    // @todo test all templates
    Template.stub('date_selector');
    Template.stub('');
    Template.stub('');
    Template.stub('');

    describe("Template.date.today", function () {

        it("returns the current day in MMMM Do YYYY format", function () {
          var now = moment().format('MMMM Do YYYY');
          expect(Template.date.today).toBe(now);
        });

    });

})();
