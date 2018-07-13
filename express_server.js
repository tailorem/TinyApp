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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: users.userRandomID.id
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: users.userRandomID.id
  },
  "6ls8sJ": {
    longURL: "http://www.inspire.ca",
    userID: users.user4RandomID.id
  }
}


function randomStringGen() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  chars = chars.split("");
  let result = "";
  for (char in chars) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result.slice(0, 6);
}

function urlsForUser(id) {
  let output = {};
  for (url in urlDatabase) {
    let item = urlDatabase[url];
    if (item.userID === id) {
      output[url] = {
        shortURL: item,
        longURL: item.longURL
      }
    }
  }
  return output;
}

// const templateVars = {
//   urls: urlDatabase,
//   users: users,
//   currentUser: null,
//   message: null
// };

// templateVars.currentUser = users[req.cookies.user_id];
// templateVars.message = "";
// templateVars.shortURL = req.params.id;
// templateVars.longURL = urlDatabase[req.params.id].longURL;


// On requests, redirect to "urls"
app.get("/", (req, res) => {
  // if logged in, redirect to "/urls"
  // else, redirect to "/login"
  res.redirect(301, "/urls");
});

// Route handler for "urls"
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    users: users,
    currentUser: users[req.cookies.user_id],
    message: null
  };
  // console.log(templateVars.urls);
  res.render("index", templateVars);
});

// Rreate route handler for "new"
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: null
  };
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    res.render("new", templateVars);
  }
});

// Route handler for "urls/:id"
app.get("/urls/:id", (req, res) => {
  // console.log(templateVars.longURL);
  // console.log(templateVars.shortURL);
  // if short URL does not exist, render 404
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    // templateVars.longURL = null;
    res.status(404).render("index", {
      urls: urlDatabase,
      users: users,
      currentUser: users[req.cookies.user_id],
      message: "Oops, looks like that page doesn't exist."
    });
  } else {
    const templateVars = {
      urls: urlDatabase,
      users: users,
      currentUser: users[req.cookies.user_id],
      message: null,
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]
    };
    // console.log(urlDatabase[req.params.id].longURL)
    res.render("show", templateVars);
  }
});

// Route handler for "/u/:id"
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  console.log(req.params.id);
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: null,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  if (!longURL) {
    templateVars.message = "Oops, looks like that page doesn't exist.";
    res.status(404).render("index", templateVars);
  } else {
  res.redirect(301, `/${longURL}`);
  }
});

// Route handler for "/urls" (POST)
app.post("/urls", (req, res) => {
  const random = randomStringGen().toString();
  const link = (req.body.longURL).toString();
  if (!link.startsWith("http://") /* || !link.startsWith("https://") */) {
    link = "http://" + link;
  }
  urlDatabase[random] = {};
  urlDatabase[random].longURL = link;
  urlDatabase[random].userID = req.cookies.user_id;
  console.log(urlDatabase[random]);
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
    users: users,
    currentUser: users[req.cookies.user_id],
    message: null
  };
  res.render("login", templateVars);
});

// Route handler for "register"
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: null
  };
  res.render("register", templateVars);
});

// Route handler for "/login" (POST)
app.post("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: "Oops, you have entered an incorrect email or password!"
  };
  for (let user in users) {
    if (req.body.email === users[user].email && req.body.password === users[user].password) {
      res.cookie("user_id", users[user].id);
      res.redirect("/");
      return;
    }
  }
  res.status(403).render("login", templateVars);
});

// Route handler for "register"
app.post("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: null
  };

  if (!req.body.email || !req.body.password) {
    templateVars.message = "Please enter a valid email and a password."
    res.status(400).render("register", templateVars);
    return;
  }

  const userID = randomStringGen();

  for (let user in users) {
    if (users[user].email === req.body.email) {
      templateVars.message = "That email is already in use."
      res.status(400).render("register", templateVars);
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
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: "Oops, you can't do that."
  };
  // console.log(urlDatabase[req.params.id].userID);
  // console.log(req.cookies.user_id)
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
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
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: users[req.cookies.user_id],
    message: "Oops, you can't do that."
  };
  res.status(404).render("404", templateVars);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`);
});

