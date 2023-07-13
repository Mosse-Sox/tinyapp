/**
 * This file contains all the current routes and server code.
 * You would run this file to start the server.
 * Variables:
 *        - urlDatabase: object acting as our current database
 * Functions:
 *        - generateRandomString();
 */

const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const app = express();

/*------- PORT -------*/
const PORT = 8080;

/* Middleware */
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],

    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(morgan("dev"));

app.use((req, res, next) => {
  const protectedRoutes = [
    "/urls",
    "/urls/new",
    "/urls/:id",
    "/urls/:id/update",
    "/urls/:id/delete",
  ];

  console.log(req.session.id);
  const idFromCookie = req.session.id;
  const userLookedup = userLookup(userDatabase[idFromCookie].email);
  console.log(userLookedup);
  if (!userLookedup && protectedRoutes.includes(req.url)) {
    res.redirect("/");
  }

  next();
});

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
    password: bcrypt.hashSync("jamjam", 10),
  },
  Donny: {
    id: "Donny",
    email: "Scootydon@jam.ca",
    password: bcrypt.hashSync("Rowan", 10),
  },
};

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
 * @param {string} email
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
 * @param {string} userID
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

/**
 * This function takes in an email and password that a user attempted to log in with and returns
 * an object with an error if the login was not successful or an object that contains the user object.
 * @param {string} email email the user is attempting to log in with
 * @param {string} password password the user is attempting to log in with
 * @returns An object that contains either a user or an error depending on if the params passed
 * the checks.
 */
const authenticateUser = (email, password) => {
  const userLookedup = userLookup(email);

  if (!userLookedup) {
    return { error: "Login unsuccessful", user: null };
  }

  if (!bcrypt.compareSync(password, userLookedup.password)) {
    return { error: "Login unsuccessful", user: null };
  }

  return { error: null, user: userLookedup };
};

/* --------------------------------------  Login Routes   ------------------------------------------ */

/* ------------------ >> GETS << ------------------ */

/* Get */
app.get("/", (req, res) => {
  if (req.session.id) {
    return res.redirect("/urls");
  }

  return res.redirect("/login");
});

/* GET /register */
app.get("/register", (req, res) => {
  if (req.session.id) {
    return res.redirect("/urls");
  }

  return res.render("new_user");
});

/* GET /login */
app.get("/login", (req, res) => {
  if (req.session.id) {
    return res.redirect("/urls");
  }

  return res.render("login_page");
});

/* ------------------ >> POSTS << ------------------ */

/* --- >> POST /register << --- */
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const user = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };

  // check if either field is empty
  if (!user.email || !user.password) {
    res.status(400);
    return res.redirect("/register");
  }

  // check if users exists already
  const alreadyExists = userLookup(user.email);
  if (alreadyExists) {
    res.status(400);
    return res.redirect("/register");
  }

  // create user in database and set a cookie
  userDatabase[userID] = user;
  req.session.id = userID;
  return res.redirect("/urls");
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

  const { error, user } = authenticateUser(email, password);

  if (error) {
    return res.send(error);
  }

  // logging user in and giving them their cookies
  req.session.id = user.id;
  res.redirect("/urls");
  return;
});

/* POST /logout */
app.post("/logout", (req, res) => {
  res.session = null;
  return res.redirect("/login");
});

/* --------------------------------------  General Routes   ------------------------------------------ */

/* ------------------ >> GETS << ------------------ */

/* GET /urls */
app.get("/urls", (req, res) => {
  const userId = req.session.id;

  const urls = urlsForUser(userId);

  const templateVars = { urls: urls, user: userDatabase[userId] };

  return res.render("urls_index", templateVars);
});

/* GET /urls/new */
app.get("/urls/new", (req, res) => {
  const templateVars = { user: userDatabase[req.session.id] };

  res.render("urls_new", templateVars);
});

/* GET /urls/:id */
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = req.session.id;

  const urlsList = urlsForUser(userDatabase[user].id);

  // checking if the id exists at all, and is visible to the current user
  if (urlsList[id] === undefined) {
    res.status(404);
    res.send("404: URL you are looking for does not exist");
    return;
  }

  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: userDatabase[user],
  };

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
    res.send("404: the url you are trying to access does not exist");
    return;
  }

  res.redirect(templateVars.longURL);
  return;
});

/* ------------------ >> POSTS << ------------------ */

/* POST /urls */
app.post("/urls", (req, res) => {
  const randomID = generateRandomString();
  const user = req.session.id;

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
  const user = req.session.id;
  const id = req.params.id;

  const urlsList = urlsForUser(user);
  // checking if the id exists at all, and is visible to the current user
  if (urlsList[id] === undefined) {
    res.status(404);
    res.send("404: URL you are looking for does not exist");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
  return;
});

/* POST /urls/:id/update */
app.post("/urls/:id/update", (req, res) => {
  const user = req.session.id;
  const id = req.params.id;

  const urlsList = urlsForUser(user);
  // checking if the id exists at all, and is visible to the current user
  if (urlsList[id] === undefined) {
    res.status(404);
    res.send("404: URL you are looking for does not exist");
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
