// Require and use modules
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const ejs = require("ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Set port
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

// On requests, redirect to "urls"
app.get("/", (req, res) => {
  res.redirect(301, "/urls");
});

// Route handler for "login"
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// Route handler for "urls"
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let random = generateRandomString().toString();
  let link = (req.body.longURL).toString();
  if (!link.startsWith("http://") && !link.startsWith("https://")) {
    link = "http://" + link;
  }
  urlDatabase[random] = link;
  // console.log(urlDatabase);
  res.redirect(301, `/urls/${random}`);
});

// Rreate route handler for "urls_new"
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

// Route handler for "urls/:id"
app.get("/urls/:id", (req, res) => {
  // console.log([req.params.id]);
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  };
  // if short URL does not exist, render 404
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.status(404).render("urls_404", templateVars);
  } else {
    res.render("urls_show", templateVars);
  }
});

// Route handler for "u/:id"
app.get("/u/:shortURL", (req, res) => {
  // console.log("I'm here!");
  let shortURL = (req.originalUrl).slice(3);
  let longURL = urlDatabase[shortURL];
  if (!longURL) {
    // console.log("this is false");
    res.status(404).render("urls_404", { username: req.cookies.username });
  } else {
  res.redirect(301, `${longURL}`);
  }
});

// Route handler for deleting urls
app.post("/urls/:id/delete", (req, res) => {
  // console.log(urlDatabase);
  for (let key in urlDatabase) {
    if (key === req.params.id) {
      delete urlDatabase[key];
      // console.log("found a match");
    }
    // console.log(urlDatabase);
  }
  res.redirect("/urls");
});

// Route handler for editing urls
app.post("/urls/:id/edit", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    if (!req.body.newURL.toString().startsWith("http://")) {
      urlDatabase[req.params.id] = `http://${req.body.newURL}`;
    } else {
      urlDatabase[req.params.id] = req.body.newURL;
    }
  }
  res.redirect("/urls");
});

app.use((req, res) => {
  res.status(404).render("urls_404", { username: req.cookies.username });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

