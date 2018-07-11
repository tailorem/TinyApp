// Require modules and set port
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

// Set view engine to EJS
app.set("view engine", "ejs");

// Initialize URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

function generateRandomString() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  chars = chars.split("");
  let result = "";
  for (char in chars) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result.slice(0, 6);
}
generateRandomString();


// On requests, say hello
app.get("/", (req, res) => {
console.log(generateRandomString());
  res.end("Home page is currently operational!");
});

// Create route handler for "urls"
app.get("/urls", (req, res) => {
  let path = "localhost:8080/";
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create route handler for "urls_new"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // view POST parameters
  res.send("'Accepted'");
});

// Create route handler for "urls_show"
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

