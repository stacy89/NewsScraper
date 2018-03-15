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
		var $ = cheerio.load(response.data);
		console.log("I'm here");
		console.log($(".grid__wrapper__card").length);
		$(".grid__wrapper__card").each(function(i, element) {
			var result = {};

			result.title = $(this).find(".grid-card-linkout--site-name").text();
			result.link = $(this).attr("href");
			console.log("result.topic", result.title);
			console.log("result.topic", result.link);
			// result.title = $(this).children("")
			db.Article.create(result).then(function(dbArticle) {
				console.log(dbArticle);
			}).catch(function(err) {
				console.log(err);
				// return res.json(err);
			});
		});
		res.send("Scraped");
	});
});

app.get("/articles", function(req, res) {
	db.Article.find({}).then(function(dbArticle) {
		res.json(dbArticle);
	}).catch(function(err) {
		res.json(err);
	});
});

app.get("/articles/:id", function(req, res) {
	db.Article.findOne({_id: req.params.id})
	.populate("comment").then(function(dbArticle) {
		res.json(dbArticle);
	}).catch(function(err) {
		res.json(err);
	});
});

app.post("/articles/:id", function(req, res) {
	db.Comment.create(req.body).then(function(dbComment) {
		return db.Article.findOneAndUpdate({_id: req.params.id}, {comment: dbComment._id}, {new: true});
	}).then(function(dbArticle) {
		res.json(dbArticle);
	}).catch(function(err) {
		res.json(err);
	});
});


app.listen(PORT, function() {
	console.log("App running on port " + PORT + ".");
});