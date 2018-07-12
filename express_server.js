// Require and use modules
const express = require("express");
const app = express();
// const users = require("./users");
// const urlDatabase = require("./urlDatabase");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Set view engine and define port
app.set("view engine", "ejs");
const PORT = 8080;

function randomStringGen() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  chars = chars.split("");
  let result = "";
  for (char in chars) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result.slice(0, 6);
}


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "test@test.com",
    password: "test"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "purple"
  },
 "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: "green"
  }
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "6ls8sJ": "http://www.inspire.ca"
}


// On requests, redirect to "urls"
app.get("/", (req, res) => {
  // if logged in, redirect to "/urls"
  // else, redirect to "/login"
  res.redirect(301, "/urls");
});

// Route handler for "urls"
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[req.cookies.user_id]
  };
  res.render("index", templateVars);
});

// Rreate route handler for "new"
app.get("/urls/new", (req, res) => {
  const templateVars = { currentUser: users[req.cookies.user_id] };
  res.render("new", templateVars);
});

// Route handler for "urls/:id"
app.get("/urls/:id", (req, res) => {
  // console.log([req.params.id]);
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    currentUser: users[req.cookies.user_id]
  };
  // if short URL does not exist, render 404
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.status(404).render("404", templateVars);
  } else {
    res.render("show", templateVars);
  }
});

// Route handler for "/u/:id"
app.get("/u/:id", (req, res) => {
  const shortURL = (req.originalUrl).slice(3);
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.status(404).render("404", { currentUser: users[req.cookies.user_id] });
  } else {
  res.redirect(301, `${longURL}`);
  }
});

// Route handler for "/urls" (POST)
app.post("/urls", (req, res) => {
  const random = randomStringGen().toString();
  const link = (req.body.longURL).toString();
  if (!link.startsWith("http://") /* || !link.startsWith("https://") */) {
    link = "http://" + link;
  }
  urlDatabase[random] = link;
  // console.log(urlDatabase);
  res.redirect(301, `/urls/${random}`);
});

// app.post("/urls/:id", (req, res) => {
//   // input code here
// });

// Route handler for deconsting urls (POST)
app.post("/urls/:id/delete", (req, res) => {
  for (let key in urlDatabase) {
    if (key === req.params.id) {
      delete urlDatabase[key];
    }
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[req.cookies.user_id],
    message: null
  };
  res.render("login", templateVars);
});

// Route handler for "register"
app.get("/register", (req, res) => {
  res.render("register", {
    currentUser: users[req.cookies.user_id],
    message: null
  });
});

// Route handler for "/login" (POST)
app.post("/login", (req, res) => {
  // console.log(req.body.email);
  for (let user in users) {
    // console.log(users[user].email);
    if (req.body.email === users[user].email && req.body.password === users[user].password) {
      res.cookie("user_id", users[user].id);
      res.redirect("/");
      return;
    }
  }
  res.status(403).render("login", { message: "Oops, you have entered an incorrect email or password!" });
});

// Route handler for "register"
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).render("register", { message: "You must enter a valid email and password." });
    return;
  }

  const userID = randomStringGen();

  for (let user in users) {
    if (users[user].email === req.body.email) {
    res.status(400).render("register", { message: "That email is already in use." });
      return;
    }
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// Route handler for "/logout" (POST)
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Route handler for editing urls (POST)
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
  res.status(404).render("404", { currentUser: users[req.cookies.user_id] });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

