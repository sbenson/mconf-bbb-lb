var Service = require('./service')
  , Logger = require('../lib/logger');

// TODO: Temporary data store
var db = {};

var Server = exports = module.exports = function Server(name, url, salt) {
  this.name = name;
  this.url = url;
  this.salt = salt;
  this.services = {};
};

Server.prototype.save = function(fn){
  db[this.name] = this;
  if (fn) fn();
};

Server.prototype.destroy = function(fn){
  exports.destroy(this.name, fn);
};

Server.prototype.updateService = function(name, data, fn){
  service = this.services[name];
  if (service == undefined) {
    service = new Service(name, data);
  }
  this.services[name] = service;
  if (fn) fn(null, service);
};

// Get the number of meetings in the server from the service
// BigBlueButton Info
Server.prototype.getMeetingCount = function() {
  var service = this.services['BigBlueButton Info']
    , count = -1; // -1 disables this server

  if (service != undefined) {
    try {
      count = service.getInt('meetings');
    } catch (e) {
      Logger.log('ERROR: server ' + this.name + ', getting the number of meetings from: "' + service.data + '"')
    }
  }

  return count;
}

// Inc the number of meetings described in the service
// BigBlueButton Info
Server.prototype.incMeetingCount = function(value) {
  var service = this.services['BigBlueButton Info']
    , count = 0;

  if (service != undefined) {
    try {
      count = service.getInt('meetings');
      service.setInt('meetings', count + 1);
    } catch (e) {
      Logger.log('ERROR: server ' + this.name + ', setting the number of meetings in: "' + service.data + '"')
    }
  }
}

Server.count = function(fn){
  fn(null, Object.keys(db).length);
};

Server.get = function(id, fn){
  fn(null, db[id]);
};

Server.all = function(fn){
  var arr = Object.keys(db).reduce(function(arr, id){
    arr.push(db[id]);
    return arr;
  }, []);
  fn(null, arr);
};

Server.destroy = function(id, fn){
  if (db[id]) {
    delete db[id];
    fn();
  } else {
    fn(new Error('server ' + id + ' does not exist'));
  }
};

Server.clear = function(fn){
  for (var id in db) {
    item = db[id];
    delete item;
  }
  db = {};
  if (fn) fn();
};
