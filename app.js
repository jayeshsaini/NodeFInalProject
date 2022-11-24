var express  = require('express');
var mongoose = require('mongoose');
var path = require('path');
var app      = express();
var database_atlas = require('./config/database_atlas');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
 
var port     = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

//Loads the handlebars module
const exphbs = require('express-handlebars');

const HBS = exphbs.create({
    //Create custom HELPER 
    helpers: {
    }
});

// Sets handlebars configurations
app.engine('.hbs', HBS.engine);
app.set('view engine', '.hbs');

mongoose.connect(database_atlas.url);