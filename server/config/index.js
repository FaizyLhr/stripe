'use strict';

let env = process.env.NODE_ENV || 'development';
// Load server configuration
let config = require(`${__dirname}/env/${env}`);

module.exports = config;