/********************************************************************************* 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 *  
 * Group member Name: _Jayesh Saini_ Student IDs: _N01468765_ Date: __29/11/2022___ 
 * Group member Name: _Vikram Ashok_ Student IDs: _N01469489_ Date: __30/11/2022___
 * *********************************************************************************/

var express = require('express');
var path = require('path');
var app = express();
var database_atlas = require('./config/database_atlas');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

//Loads the handlebars module
const exphbs = require('express-handlebars');
var paginateHelper = require('express-handlebars-paginate');

const jwt=require('jsonwebtoken');

const HBS = exphbs.create({
    //Create custom HELPER 
    helpers: {}
});

HBS.handlebars.registerHelper('paginateHelper', paginateHelper.createPagination);

// Sets handlebars configurations
app.engine('.hbs', HBS.engine);
app.set('view engine', '.hbs');


var db = require('./moviesModule.js');


db.initialize(database_atlas.url);
var token;


// Setting the path for default app route to use "main.hbs"
app.use(express.static(path.join(__dirname, 'public')));

// Sets our app to use the handlebars engine
app.set('view engine', 'hbs');

// Serves the body of the page from "index.hbs" to the container "main.hbs"
app.get('/', function (req, res) {
    res.render('index', { title: 'Movies Data' });
});

function verifyToken(req,res,next){ 
    req.headers['authorization'] = token;
    const bearerHeadr = req.headers['authorization'] 
    if(typeof bearerHeadr != 'undefined'){ 
        console.log("here")
        const bearer = bearerHeadr.split(' ') 
        const bearerToken = bearer[1] 
        req.token = bearerToken 
        console.log(req.token)
        next() 
    } 
}

app.get('/api', verifyToken, function (req, res) {

    jwt.verify(req.token, process.env.JWT_SECRET, (err, decoded)=> { 
        if (err)  {
            console.log(err)
            res.sendStatus(403)
        }   
        else{ 
            console.log(decoded) 
            res.render('formData', { title: 'Get Movie' });
        } 
    }); 
});

app.get('/api/login', function (req, res) {
    res.render('formLogin', { title: 'Movie API Login' });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    console.log(`${username} is trying to login ..`);
  
    if (username === "admin" && password === "admin") {
        token = 'Bearer ' + jwt.sign({ user: "admin" }, process.env.JWT_SECRET)
      return res.json({
        token: token
      });
    }
  
    return res
      .status(401)
      .json({ message: "The username and password your provided are invalid" });
  });

//get all Movies data from db
app.get('/api/Movies', async function (req, res) {
    

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const title = req.query.title || '';

    var movieData = await db.getAllMovies(page, limit, title);
    console.log(movieData);
    var results = movieData[0];
    var totalDocs = movieData[1];
    
    res.render('MoviesData', { title: 'All Movies', data: results.results, pagination: { page: page, limit: limit, totalRows: totalDocs } });
    

});

// get a Movies with ID of 1
app.get('/api/Movies/:Movies_id', function (req, res) {
    let id = req.params.Movies_id;
    var data = db.getMovieById(id);
    res.json(data);

});


// using route to handling multiple requests
app.post('/api/Movies', async function (req, res) {
    // create mongose method to create a new record into collection
    console.log(req.body);

    var data = {
        plot: req.body.plot,
        genre: req.body.genre,
        runtime: req.body.runtime,
        cast: req.body.cast,
        num_nflix_comments: req.body.num_nflix_comments,
        title: req.body.title,
        fullplot: req.body.fullplot,
        countries: req.body.countries,
        released: req.body.released,
        directors: req.body.directors,
        rated: req.body.rated,
        awards: req.body.awards,
        lastupdated: req.body.lastupdated,
        year: req.body.year,
        imdb: req.body.imdb,
        type: req.body.type,
        tomatoes: req.body.tomatoes
    }

    var movie = db.addNewMovie(data);

    res.send('Successfully! movie has been created.');

});


// create Movies and send back all Movies after creation
app.put('/api/Movies/:movies_id', function (req, res) {
    // create mongose method to update an existing record into collection
    console.log(req.body);

    let id = req.params.movies_id;
    var data = {
        plot: req.body.plot,
        genre: req.body.genre,
        runtime: req.body.runtime,
        cast: req.body.cast,
        num_nflix_comments: req.body.num_nflix_comments,
        title: req.body.title,
        fullplot: req.body.fullplot,
        countries: req.body.countries,
        released: req.body.released,
        directors: req.body.directors,
        rated: req.body.rated,
        awards: req.body.awards,
        lastupdated: req.body.lastupdated,
        year: req.body.year,
        imdb: req.body.imdb,
        type: req.body.type,
        tomatoes: req.body.tomatoes
    }

    // save the user
    var movie = db.updateMovieById(data, id);
    res.send('Successfully! movie updated - ' + data.title);
    
});

// delete a Movies by id
app.delete('/api/Movies/:movies_id', function (req, res) {
    console.log(req.params.movies_id);
    let id = req.params.movies_id;
    var deleted = db.deleteMovieById(id);
    if (deleted) {
        res.send('Successfully! deleted movie with Id - ' + id);
    } else {
        res.send('Id not found');
    }

});

app.listen(port);
console.log("App listening on port : " + port);