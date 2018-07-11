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

// On requests, say hello
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Create route handler for "urls"
app.get("/urls", (req, res) => {
  let path = "localhost:8080/";
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let random = generateRandomString().toString();
  let link = (req.body.longURL).toString();
  // console.log(urlDatabase);
  console.log(req);
  // console.log(res);
  // console.log(random);
  // console.log(link);
  urlDatabase[random] = link;
  res.redirect(301, `/urls/${random}`);
  // console.log(urlDatabase);
});

// Create route handler for "urls_new"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// // When new urls are posted, send message "accepted"
// app.post("/urls", (req, res) => {
//   console.log(req.body);  // view POST parameters
//   res.send("'Accepted'");
// });

// Create route handler for "urls/:id"
app.get("/urls/:id", (req, res) => {
  // console.log([req.params.id]);
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  // console.log(templateVars.link);
  if (urlDatabase.hasOwnProperty(req.params.id) === false) {
    // console.log("this is false");
    res.status(404).render("urls_404");
  } else {
    res.render("urls_show", templateVars);
  }
});

// Create route handler for "u/:id"
app.get("/u/:shortURL", (req, res) => {
  // console.log("I'm here!");
  let shortURL = (req.originalUrl).slice(3);
  let longURL = urlDatabase[shortURL];
  if (!longURL) {
    // console.log("this is false");
    res.status(404).render("urls_404");
  } else {
  res.redirect(301, `${longURL}`);
  }
});

app.use((req, res) => {
  res.status(404).render("urls_404");
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

