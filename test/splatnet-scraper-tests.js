var SplatnetScraper = require('../splatnet-scraper/scraper-main');

describe('SplatnetScraper', function() {
  describe('login()', function() {
    it('should do something', function() {
      var x=0;
      x.should.equal(0);
    })
  });

  describe('validSchedule', function() {
    it('should be false if schedule is empty', function() {
      var scraper = new SplatnetScraper();
      scraper.scheduleValid([]).should.equal(false);
    });
    it('should return false if time is less than begin time', function() {
      var scraper = new SplatnetScraper();
      scraper.schedule = [
        {
          begin: '2016-01-12T15:00:00.000+09:00',
          end: '2016-01-12T19:00:00.000+09:00',
        }
      ];
      //1452578400000 is schedule.begin
      scraper.scheduleValid(1452578400000 - 10).should.equal(false);
    });
    it('should return true if time between begin and end', function() {
      var scraper = new SplatnetScraper();
      scraper.schedule = [
        {
          begin: '2016-01-12T15:00:00.000+09:00',
          end: '2016-01-12T19:00:00.000+09:00',
        }
      ];
      //1452578400000 is schedule.begin
      scraper.scheduleValid(1452578400000 + 10).should.equal(true);
    });
    it('should return false if time greater than end', function() {
      var scraper = new SplatnetScraper();
      scraper.schedule = [
        {
          begin: '2016-01-12T15:00:00.000+09:00',
          end: '2016-01-12T19:00:00.000+09:00',
        }
      ];
      //1452592800000 is schedule.begin
      scraper.scheduleValid(1452592800000 + 10).should.equal(false);
    });
  });
});
