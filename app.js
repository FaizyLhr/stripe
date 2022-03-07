let express = require('express');
 
require('dotenv').config();

// Create global app object
let app = express();
require('./server/app-config')(app);

// finally, let's start our server...
let server = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port);
});
// check