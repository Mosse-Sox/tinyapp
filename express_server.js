const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b>WORLD</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const randomID = generateRandomString();

  urlDatabase[randomID] = req.body.longURL;
  res.redirect(`/urls/:${randomID}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.redirect(templateVars.longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  // console.log(req.params.id);
  delete urlDatabase[req.params.id];


  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}`);
});

const generateRandomString = () => {
  let newString = "";

  const characters = "ABCDEFGHIJKLMNOPQRXYZabcdefghijklmnopqrxyz0123456789";

  for (i = 0; i < 6; i++) {
    newString += characters[Math.floor(Math.random() * characters.length)];
  }

  return newString;
};
