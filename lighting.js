/*
  Lighting module - controls lighting via ArtNet, by fetching commands from the server
*/

module.exports = function () {
  // TODO: how best to get the ip address of the interface you want to send artnet.
  var options = {
    host: '10.0.30.120'
  };

  const artnet = require('artnet')(options);
  console.log('Lighting module initialized');
}
