var express = require("express");
var exphbs = require("express-handlebars");
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

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScraperdb", {useMongoClient: true});


app.get("/scrape", function(req, res) {
	axios.get("https://www.vice.com/en_us").then(function(response) {
		var $ = cheerio.load(response.data);

		$(".grid__wrapper__card").each(function(i, element) {

			var result = {};

				result.title = $(this).find(".grid-card-linkout--site-name").text();
				result.link = $(this).attr("href");
			
				db.Article.create(result).then(function(dbArticle) {
				// console.log(dbArticle);
				}).catch(function(err) {
				console.log(err);
				});
		});
		res.redirect("/articles")
	});
});

app.get("/articles", function(req, res) {
	db.Article.find({}).then(function(dbArticle) {
		console.log(dbArticle);
		res.render("index", {result: dbArticle});
	}).catch(function(err) {
		console.log(err);
	});
});

app.get("/articles/:id", function(req, res) {
	db.Article.findOne({_id: req.params.id})
	.populate("comment").then(function(dbArticle) {
		res.render("comments", {result: dbArticle});
	}).catch(function(err) {
		console.log(err);
	});
});

app.post("/articles/:id", function(req, res) {
	db.Comment.create(req.body).then(function(dbComment) {
		return db.Article.findOneAndUpdate({_id: req.params.id}, {comment: dbComment._id}, {new: true});
	}).then(function(dbArticle) {
		console.log(dbArticle);
	}).catch(function(err) {
		console.log(err);
	});
});


app.listen(PORT, function() {
	console.log("App running on port " + PORT + ".");
});