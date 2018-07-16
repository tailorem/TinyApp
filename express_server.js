//jshint esversion: 6

// Require and use modules
const express = require("express");
const app = express();

var methodOverride = require('method-override');
app.use(methodOverride('_method'));

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["secret-test-key", "other-test-key"],
}));

const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Set view engine and define port
app.set("view engine", "ejs");
const PORT = 8080;


// Hardcoded user database for testing purposes
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

// Hardcoded URL database for testing purposes
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

// Function returns a random string for user IDs and short URLs
function randomStringGen() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  chars = chars.split("");
  let result = "";
  chars.forEach(char => {
    result += chars[Math.floor(Math.random() * chars.length)];
  });
  return result.slice(0, 6);
}

// returns an object of specific user URLs
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

// Default EJS template variables
const templateVars = {
  urls: urlDatabase,
  users: users,
  currentUser: null,
  message: null
};

// Route handler for "/" GET requests
app.get("/", (req, res) => {
  if (req.session.user_id) {
    // console.log("where are they");
    res.redirect("/urls");
  } else {
    res.redirect(301, "/login");
  }
  // if logged in, redirect to "/urls"
  // else, redirect to "/login"
});

// Route handler for "/urls" GET requests
app.get("/urls", (req, res) => {
  // console.log(req.session);
  templateVars.urls = urlsForUser(req.session.user_id);
  templateVars.currentUser = users[req.session.user_id];
  // console.log(users);
  res.render("index", templateVars);
});

// Route handler for "/urls/new" GET requests
app.get("/urls/new", (req, res) => {
  templateVars.currentUser = users[req.session.user_id];
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("new", templateVars);
  }
});

// Route handler for "/urls/:id" GET requests
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.render("login", templateVars);
    return;
  }

  templateVars.currentUser = users[req.session.user_id];
  templateVars.shortURL = req.params.id;
  templateVars.longURL = urlDatabase[req.params.id];

  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    // console.log(req.params);
    templateVars.message = "Oops, looks like that page doesn't exist.";
    res.status(404).render("index", templateVars);
    return;
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    templateVars.message = "Oops, that doesn't seem to be one of your URLs!";
    res.status(401).render("index", templateVars);
    return;
  }

    res.render("show", templateVars);
});

// Route handler for "/u/:id"
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  templateVars.currentUser = users[req.session.user_id];
  templateVars.shortURL = req.params.id;
  longURL = urlDatabase[req.params.id];

  if (!longURL) {
    templateVars.message = "Oops, looks like that page doesn't exist.";
    res.status(404).render("index", templateVars);
  } else {
    res.redirect(301, `/${longURL}`);
  }
});

// Route handler for "/urls" (POST)
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.render("index", templateVars);
    return;
  }
  const random = randomStringGen().toString();
  let link = (req.body.longURL).toString();
  if (!link.startsWith("http://") /* || !link.startsWith("https://") */) {
    link = "http://" + link;
  }
  urlDatabase[random] = {};
  urlDatabase[random].longURL = link;
  urlDatabase[random].userID = req.session.user_id;

  // templateVars.message = "Success! Here's your new short ULR:";
  // console.log(urlDatabase[random]);
  res.redirect(`/urls/${random}`);
});

// app.post("/urls/:id", (req, res) => {
//   // input code here
// });

// Route handler for deconsting urls (POST)
app.delete("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).render("login", templateVars);
    return;
  }
  for (let url in urlDatabase) {
    if (url === req.params.id) {
      delete urlDatabase[url];
    }
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    templateVars.currentUser = users[req.session.user_id];
    res.render("login", templateVars);
  }
});

// Route handler for "register"
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
});

// Route handler for "/login" (POST)
app.post("/login", (req, res) => {

  templateVars.currentUser = users[req.session.user_id];
  for (let user in users) {
    if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
      templateVars.message = null;
      // console.log(users[user].id);
      // console.log(req.session);
      req.session.user_id = `${users[user].id}`;
      res.redirect("/");
      return;
    }
  }
  templateVars.message = "Oops, you have entered an incorrect email or password!";
  res.status(403).render("login", templateVars);
});

// Route handler for "register"
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    templateVars.message = "Please enter a valid email and a password.";
    res.status(400).render("register", templateVars);
    return;
  }

  for (let user in users) {
    if (users[user].email === req.body.email) {
      templateVars.message = "That email is already in use.";
      res.status(400).render("register", templateVars);
      return;
    }
  }

  const userID = randomStringGen();

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 12)
  };
  req.session.user_id = userID;
  templateVars.currentUser = users[req.session.user_id];
  templateVars.message = null;
  // console.log(bcrypt.hashSync(req.body.password, 12));
  res.redirect("/urls");
});

// Route handler for "/logout" (POST)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Route handler for editing urls (POST)
app.put("/urls/:id", (req, res) => {
  templateVars.currentUser = users[req.session.user_id];
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).render("index", templateVars);
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

app.use((req, res) => {
  // templateVars.currentUser = users[req.session.user_id];
  templateVars.message = "Oops, you can't do that.";
  res.status(404).render("index", templateVars);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

