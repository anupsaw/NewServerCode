var fs = require('fs');

function getConfig(file) {
  console.log(file); // later we will use to pass the config file as well.
  var config = fs.readFileSync('./app/config/config.json').toString();
  return JSON.parse(config);
}



module.exports = getConfig;