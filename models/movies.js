// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
MoviesSchema = new Schema({
    plot : String,
    genre : Array,
	runtime : Number,
    cast: Array,
    num_nflix_comments: Number,
    title: String,
    fullplot : String,
    countries : Array,
	released : String,
    directors: Array,
    rated: String,
    awards: Object,
    lastupdated : String,
    year : Number,
	imdb : Object,
    type: String,
    tomatoes: Array
});
module.exports = mongoose.model('movies', MoviesSchema);