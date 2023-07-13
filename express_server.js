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

/* Middleware */
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* configs */
app.set("view engine", "ejs");

/* --------------------------------------  Database Objects   ------------------------------------------ */

/* object acting as the current URL database */
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "Rowan" },
  "9sm5xk": { longURL: "http://www.google.com", userID: "Donny" },
};

/* object acting as the current user database */
const userDatabase = {
  Rowan: {
    id: "Rowan",
    email: "Rowan@abc.com",
    password: "jamjam",
  },
  Donny: {
    id: "Donny",
    email: "Scootydon@jam.ca",
    password: "Rowan",
  },
};

/* --------------------------------------  Login Routes   ------------------------------------------ */

/* ------------------ >> GETS << ------------------ */

/* Get */
app.get("/", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }

  res.redirect("/login");
  return;
});

/* GET /register */
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }

  res.render("new_user");
});

/* GET /login */
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }

  res.render("login_page");
});

/* ------------------ >> POSTS << ------------------ */

/* --- >> POST /register << --- */
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const user = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };

  // check if either field is empty
  if (!user.email || !user.password) {
    res.status(400);
    res.redirect("/register");
    return;
  }

  // check if users exists already
  const alreadyExists = userLookup(user.email);
  if (alreadyExists) {
    res.status(400);
    res.redirect("/register");
    return;
  }

  // create user in database and set a cookie
  userDatabase[userID] = user;
  res.cookie("user_id", userID);
  res.redirect("/urls");
  return;
});

/* --- >> POST /login << --- */
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if either field is empty
  if (!email || !password) {
    res.status(400);
    res.redirect("/login");
    return;
  }

  // checking if user exists
  const userLookedup = userLookup(email);
  if (!userLookedup) {
    res.status(400);
    res.redirect("/login");
    return;
  }

  // checking if password is correct
  if (userLookedup.password !== password) {
    res.status(400);
    res.redirect("/login");
    return;
  }

  // logging user in and giving them their cookies
  res.cookie("user_id", userLookedup.id);
  res.redirect("/urls");
  return;
});

/* POST /logout */
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
  return;
});

/* --------------------------------------  General Routes   ------------------------------------------ */

/* ------------------ >> GETS << ------------------ */

/* GET /urls */
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];

  const urls = urlsForUser(userID);

  const templateVars = { urls: urls, user: userDatabase[userID] };

  // checking if a user is logged in
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }

  res.render("urls_index", templateVars);
});

/* GET /urls/new */
app.get("/urls/new", (req, res) => {
  const templateVars = { user: userDatabase[req.cookies["user_id"]] };

  // checking if a user is logged in
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new", templateVars);
});

/* GET /urls/:id */
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const urlsList = urlsForUser(userDatabase[req.cookies["user_id"]].id);

  // checking if the id exists at all, and is visible to the current user
  if (urlsList[id] === undefined) {
    res.status(404);
    res.send("404: URL you are looking for does not exist");
    return;
  }

  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: userDatabase[req.cookies["user_id"]],
  };

  // checking if a user is logged in
  if (!templateVars.user) {
    alert("Not Logged In");
    res.redirect("/login");
    return;
  }

  res.render("urls_show", templateVars);
});

/* GET /u/:id */
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };

  if (!templateVars.longURL) {
    res.status(404);
    res.send("the url you are trying to access does not exist");
    return;
  }

  res.redirect(templateVars.longURL);
  return;
});

/* ------------------ >> POSTS << ------------------ */

/* POST /urls */
app.post("/urls", (req, res) => {
  const randomID = generateRandomString();
  const user = req.cookies["user_id"];

  // checking if a user is logged in
  if (!user) {
    alert("Not Logged In");
    res.redirect("/login");
    return;
  }

  const newURL = {
    longURL: req.body.longURL,
    userID: user,
  };

  urlDatabase[randomID] = newURL;
  res.redirect(`/urls/:${randomID}`);
  return;
});

/* POST /urls/:id/delete */
app.post("/urls/:id/delete", (req, res) => {
  const user = req.cookies["user_id"];
  const id = req.params.id;

  const urlsList = urlsForUser(user.id);
  // checking if the id exists at all, and is visible to the current user
  if (urlsList[id] === undefined) {
    res.status(404);
    res.send("404: URL you are looking for does not exist");
    return;
  }

  // checking if a user is logged in
  if (!user) {
    res.redirect("/login");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
  return;
});

/* POST /urls/:id/update */
app.post("/urls/:id/update", (req, res) => {
  const user = req.cookies["user_id"];
  const id = req.params.id;

  const urlsList = urlsForUser(user);
  // checking if the id exists at all, and is visible to the current user
  if (urlsList[id] === undefined) {
    res.status(404);
    res.send("404: URL you are looking for does not exist");
    return;
  }

  // checking if a user is logged in
  if (!user) {
    res.redirect("/login");
    return;
  }

  urlDatabase[id].longURL = req.body.newURL;
  res.redirect(`/urls/${id}`);
  return;
});

/* --- >>  APP IS LISTENING < --- */
app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}`);
});

/* -------------------------------------- Functions ------------------------------------------ */

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

/**
 * This function takes an email and checks the database for that email
 * @param {*} email
 * @returns a user if its found, null if no user is found
 */
const userLookup = (email) => {
  let userExistsAlready = false;

  for (const userId in userDatabase) {
    const userThatExistsCurrently = userDatabase[userId];
    if (userThatExistsCurrently.email === email) {
      userExistsAlready = true;
    }

    if (userExistsAlready) {
      return userThatExistsCurrently;
    }
  }

  return null;
};

/**
 * This function takes a userID and creates an object containing all the urls for that userID
 * @param {*} userID
 * @returns an object that contains all of the urls associated with a specific user
 */
const urlsForUser = (userID) => {
  const urls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }

  return urls;
};
