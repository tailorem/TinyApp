//jshint esversion: 6

// Require and use modules
const express = require("express");
const app = express();

var methodOverride = require('method-override');
app.use(methodOverride('_method'));

require('dotenv').config();

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: [process.env.COOKIE_SESSION_KEYS],
}));

const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Set view engine and define port
app.set("view engine", "ejs");
const PORT = 8080;


// User "database" with hard-coded users for testing purposes
const users = {
  "test": {
    id: "test",
    email: "test@test.com",
    password: "$2b$12$IW2WA.wRH7mFeadvgJArpuGicsQLlDP0hJg.mYa6m3gJpcbt/.Ppm"
  },
  "test2": {
    id: "test2",
    email: "test2@test.com",
    password: "$2b$12$yBIecehm8TuLExuuqDG1leF7eCiuKZN5U6tFbckVDLDdhhgI0oJT6"
  }
};

// URL "database" with hard-coded URLs for testing purposes
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: users.test.id
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: users.test.id
  },
  "6ls8sJ": {
    longURL: "http://www.inspire.ca",
    userID: users.test2.id
  }
};

// Returns a random string for user IDs and short URLs
function randomStringGen() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  chars = chars.split("");
  let result = "";
  chars.forEach(char => {
    result += chars[Math.floor(Math.random() * chars.length)];
  });
  return result.slice(0, 6);
}

// Returns an object of specific user URLs
function urlsForUser(id) {
  let output = {};
  for (let url in urlDatabase) {
    let item = urlDatabase[url];
    if (item.userID === id) {
      output[url] = {
        shortURL: item,
        longURL: item.longURL
      };
    }
  }
  return output;
}

// Generates EJS template variables
function templateVars(user, text, specificUrls) {
  let tempVars = {
    urls: specificUrls || urlDatabase,
    users: users,
    currentUser: user || null,
    message: text || null
  };
  return tempVars;
}

// Route handler for "/" (GET)
app.get("/", (req, res) => {
  // if logged in, redirect to urls index
  // else, redirect to login page
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect(301, "/login");
  }
});

// Route handler for "/urls" (GET)
app.get("/urls", (req, res) => {
  res.render("index",
    templateVars(users[req.session.user_id], null, urlsForUser(req.session.user_id)));
});

// Route handler for "/urls/new" (GET)
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("new", templateVars(users[req.session.user_id]));
  }
});

// Route handler for "/urls/:id" (GET)
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.render("login", templateVars());
    return;
  }
  // If short URL does not exist, show 404 message
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.status(404).render("index", templateVars(users[req.session.user_id] || null, "Oops, looks like that page doesn't exist.", urlsForUser(req.session.user_id)));
    return;
  }
  // If URL does not belong to user, show 401 message
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(401).render("index", templateVars(users[req.session.user_id], "Oops, that doesn't seem to be one of your URLs!", urlsForUser(req.session.user_id)));
    return;
  }
    res.render("show", {
      currentUser: users[req.session.user_id],
      message: null,
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]
    });
});

// Route handler for "/u/:id" (GET)
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(404).render("index", {
      urls: urlsForUser(req.session.user_id),
      currentUser: users[req.session.user_id],
      message: "Oops, looks like that page doesn't exist.",
      shortURL: req.params.id
    });
  } else {
    res.redirect(301, `/${longURL}`);
  }
});

// Route handler for "/urls" (POST)
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.render("index", templateVars());
    return;
  }
  const random = randomStringGen().toString();
  let link = (req.body.longURL).toString();
  if (!link.startsWith("http://")) {
    link = "http://" + link;
  }
  urlDatabase[random] = {};
  urlDatabase[random].longURL = link;
  urlDatabase[random].userID = req.session.user_id;
  res.redirect(`/urls/${random}`);
});

// Route handler for deleting urls (POST/DELETE)
app.delete("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).render("login", templateVars());
    return;
  }
  for (let url in urlDatabase) {
    if (url === req.params.id) {
      delete urlDatabase[url];
    }
  }
  res.redirect("/urls");
});

// Route handler for deleting urls (GET)
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars(users[req.session.user_id]));
  }
});

// Route handler for "register" (GET)
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars());
});

// Route handler for "/login" (POST)
app.post("/login", (req, res) => {
  // Email and password must be correct for successful log in
  for (let user in users) {
    if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = `${users[user].id}`;
      res.redirect("/");
      return;
    }
  }
  res.status(403).render("login", templateVars(null, "Oops, you have entered an incorrect email or password!"));
});

// Route handler for "register"
app.post("/register", (req, res) => {
  // Registration fields may not be left blank
  if (!req.body.email || !req.body.password) {
    res.status(400).render("register", templateVars(null, "Please enter a valid email and a password."));
    return;
  }
  // Email address may only be registered once
  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.status(400).render("register", templateVars(null, "That email is already in use."));
      return;
    }
  }
  // Randomly generated userID
  const userID = randomStringGen();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 12)
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

// Route handler for "/logout" (POST)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Route handler for editing urls (POST/PUT)
app.put("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).render("index", templateVars(users[req.session.user_id]));
    return;
  }
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    if (!req.body.newURL.toString().startsWith("http://")) {
      urlDatabase[req.params.id].longURL = `http://${req.body.newURL}`;
    } else {
      urlDatabase[req.params.id].longURL = req.body.newURL;
    }
  }
  res.redirect("/urls");
});

// 404 Error handler...
app.use((req, res) => {
  res.status(404).render("index", templateVars(users[req.session.user_id] || null, "Oops, looks like that page doesn't exist."));
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

