const bcrypt = require("bcryptjs");

/**
 * This function is used in generating new shortURLS and userIds
 * @returns a randomly generated 6 character alphanumeric string
 */
const generateRandomString = () => {
  let newString = "";

  const characters = "ABCDEFGHIJKLMNOPQRXYZabcdefghijklmnopqrxyz0123456789";

  for (let i = 0; i < 6; i++) {
    newString += characters[Math.floor(Math.random() * characters.length)];
  }

  return newString;
};

/**
 * This function takes an email and checks the database for that email
 * @param {string} email
 * @param {object} userDatabase
 * @returns a user if its found, null if no user is found
 */
const userLookup = (email, userDatabase) => {
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
const urlsForUser = (userID, urlDatabase) => {
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
const authenticateUser = (email, password, userDatabase) => {
  const userLookedup = userLookup(email, userDatabase);

  if (!userLookedup) {
    return { error: "Login unsuccessful", user: null };
  }

  if (!bcrypt.compareSync(password, userLookedup.password)) {
    return { error: "Login unsuccessful", user: null };
  }

  return { error: null, user: userLookedup };
};

module.exports = {
  authenticateUser,
  userLookup,
  urlsForUser,
  generateRandomString,
};
