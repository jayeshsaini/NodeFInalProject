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
var paginateHelper = require('express-handlebars-paginate');

const HBS = exphbs.create({
    //Create custom HELPER 
    helpers: {
        
    }
});

HBS.handlebars.registerHelper('paginateHelper', paginateHelper.createPagination);

// Sets handlebars configurations
app.engine('.hbs', HBS.engine);
app.set('view engine', '.hbs');

mongoose.connect(database_atlas.url);
const db = mongoose.connection;


var Movies = require('./models/movies');

// Setting the path for default app route to use "main.hbs"
app.use(express.static(path.join(__dirname, 'public')));

// Sets our app to use the handlebars engine
app.set('view engine', 'hbs');

// Serves the body of the page from "index.hbs" to the container "main.hbs"
app.get('/', function (req, res) {
    res.render('index', { title: 'Movies Data' });
});

 
//get all Movies data from db
app.get('/api/Movies', async function(req, res) {
	// use mongoose to get all todos in the database
	// Movies.find({}).lean()
    // // execute query
    // .exec(function(err, Movies) {
	// 	// if there is an error retrieving, send the error otherwise send data
	// 	if (err)
	// 		res.send(err);
	// 	//res.json(Movies); // return all Moviess in JSON format
    //     res.render('MoviesData', { title: 'All Movies', data: Movies, pagination: { page: 1, limit:10,totalRows: 5 } });
	// });


    // Testing Pagination

    const page = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit)  || 6;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const totalDocs = await Movies.countDocuments().exec();

    if (endIndex < totalDocs) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await Movies.find().limit(limit).skip(startIndex).lean().exec();
    //   res.json(results.results);
      res.render('MoviesData', { title: 'All Movies', data: results.results, pagination: { page: page, limit:limit,totalRows: 5, totalRows: totalDocs} });
    } catch (e) {
      res.status(500).json({ message: e.message })
    }

});

// get a Movies with ID of 1
app.get('/api/Movies/:Movies_id', function(req, res) {
	let id = req.params.Movies_id;
	Movies.findById(id, function(err, Movies) {
		if (err)
			res.send(err)
 
		res.json(Movies);
	});
 
});


// using route to handling multiple requests
app.route('/api/Movies')
    .get((req, res) => {
        res.render('formData', {title: 'Insert New Movie'})
    })
// create Movies and send back all Movies after creation
    .post((req, res) => {

    // create mongose method to create a new record into collection
    console.log(req.body);

	Movies.create({
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
	}, function(err, Movies) {
		if (err)
			res.send(err);
    
    res.send('Successfully! movie has been created.');
		// get and return all the Movies after newly created employe record
		// Movies.find({}).lean()
    //     // execute query
    //     .exec(function(err, Movies) {
		// 	if (err)
		// 		res.send(err);
		// 	res.render('MoviesData', { title: 'All Movies', data: Movies });
		// });
	});
 
});


// create Movies and send back all Movies after creation
app.put('/api/Movies/:movies_id', function(req, res) {
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
	Movies.findByIdAndUpdate(id, data, function(err, Movies) {
	if (err) throw err;

	res.send('Successfully! movie updated - '+ Movies.title);
	});
});

// delete a Movies by id
app.delete('/api/Movies/:movies_id', function(req, res) {
	console.log(req.params.movies_id);
	let id = req.params.movies_id;
	Movies.deleteOne({
		_id : id
	}, function(err) {
		if (err)
			res.send(err);
		else
			res.send('Successfully! movie has been Deleted.');	
	});
});

app.listen(port);
console.log("App listening on port : " + port);