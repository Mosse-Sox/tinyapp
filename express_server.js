/** 
 * This file contains all the current routes and server code.
 * You would run this file to start the server.
 * Variables:
 *        - urlDatabase: object acting as our current database
 * Functions:
 *        - generateRandomString();
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();

/*------- PORT -------*/
const PORT = 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// configs
app.set("view engine", "ejs");

// object acting as the current URL database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com",
};

// object acting as the current user database
const userDatabase = {
  aay: {
    name: "Rowan",
    email: "abc@abc.com",
    password: "jamjam",
  },
  bee: {
    name: "Donavon",
    email: "deh@jam.ca",
    password: "Rowan",
  },
};

// GET / -> redirects to /urls currently
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// GET /register
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };

  res.render("new_user", templateVars);
});

// POST /register
app.post("/register", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const userID = generateRandomString();

  userDatabase[userID] = user;
  res.redirect("/urls");
});

// GET /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST /login
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

// POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// GET /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// POST /urls
app.post("/urls", (req, res) => {
  // console.log(req.body);
  const randomID = generateRandomString();

  urlDatabase[randomID] = req.body.longURL;
  res.redirect(`/urls/:${randomID}`);
});

// GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// GET /u/:id
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.redirect(templateVars.longURL);
});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});

// POST /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
  // console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls/${req.params.id}`);
});

// APP IS LISTENING
app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}`);
});

/**
 * This function is used in generating new shortURLS and userIds
 * @returns a randomly generated 6 character alphanumeric string
 */
const generateRandomString = () => {
  let newString = "";

  const characters = "ABCDEFGHIJKLMNOPQRXYZabcdefghijklmnopqrxyz0123456789";

  for (i = 0; i < 6; i++) {
    newString += characters[Math.floor(Math.random() * characters.length)];
  }

  return newString;
};
