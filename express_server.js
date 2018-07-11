// Require modules and set port
const express = require("express");
const app = express();
const PORT = 8080;

// Set view engine to EJS
app.set("view engine", "ejs");

// Initialize URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// On requests, say hello
app.get("/", (req, res) => {
  res.end("Home page is currently operational!");
});

// Create route handler for "urls"
app.get("/urls", (req, res) => {
  let path = "localhost:8080/";
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create route handler for "urls_show"
app.get("/urls/:id", (req, res) => {
  let templateVars = { shorURL: req.params.id };
  res.render("urls_show", templateVars);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

