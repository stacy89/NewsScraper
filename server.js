var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScraperdb", {useMongoClient: true});

app.get("/", function(req, res) {
	res.send(index.html);
});

app.get("/scrape", function(req, res) {
	axios.get("https://www.vice.com/en_us").then(function(response) {
		var = $ = cheerio.load(response.data);

		$(".grid_wrapper_card").each(function(i, element) {
			var result = {};

			result.topic = $(this).children("div").text();
			// result.title = $(this).children("")
			db.Article.create(result).then(function(dbArticle) {
				console.log(dbArticle);
			}).catch(function(err) {
				return res.json(err);
			});
		});
		res.send("Scraped");
	});
});

app.get("/articles", function(req, res) {
	db.Article.find({}).then(function(dbArticle) {
		
	});
});



