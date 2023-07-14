const { assert } = require("chai");
const bcrypt = require("bcryptjs");

const {
  authenticateUser,
  userLookup,
  urlsForUser,
  generateRandomString,
} = require("../helpers");

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
    password: "$2a$10$iSUc29YuSBtQvFpNY5mdGeeXog7OGAaKw6/CPGC3ZtDmbkqb2GdJW",
  },
  Donny: {
    id: "Donny",
    email: "Scootydon@jam.ca",
    password: bcrypt.hashSync("Rowan", 10),
  },
};

/* --------- tests for authenticate user --------- */
describe("authenticateUser", () => {
  it("should return an object containing an error if a users password isnt correct", () => {
    const email = "Rowan@abc.com";
    const password = "jammin";

    const result = authenticateUser(email, password, userDatabase);
    assert.deepEqual(result, { error: "Login unsuccessful", user: null });
  });

  it("should return an object containing an error if no user is found", () => {
    const email = "Rowan@abc.ca";
    const password = "jamjam";

    const result = authenticateUser(email, password, userDatabase);
    assert.deepEqual(result, { error: "Login unsuccessful", user: null });
  });

  it("should return an object containing a user if a user is found and the password is correct", () => {
    const email = "Rowan@abc.com";
    const password = "jamjam";

    const result = authenticateUser(email, password, userDatabase);
    assert.deepEqual(result, {
      error: null,
      user: {
        id: "Rowan",
        email: "Rowan@abc.com",
        password:
          "$2a$10$iSUc29YuSBtQvFpNY5mdGeeXog7OGAaKw6/CPGC3ZtDmbkqb2GdJW",
      },
    });
  });
});

/* --------- tests for userLookup --------- */

describe("userLookup", () => {
  it("should return a user if one exists", () => {
    const email = "Rowan@abc.com";

    const result = userLookup(email, userDatabase);

    assert.deepEqual(result, {
      id: "Rowan",
      email: "Rowan@abc.com",
      password: "$2a$10$iSUc29YuSBtQvFpNY5mdGeeXog7OGAaKw6/CPGC3ZtDmbkqb2GdJW",
    });
  });

  it("should return null if a user does not exist", () => {
    const email = "Roguy@roguy.roguy";

    const result = userLookup(email, userDatabase);

    assert.equal(result, null);
  });
});

/* --------- tests for urlsForUser --------- */

describe("urlsForUsers", () => {
  it("should return an object of urls associated with a users id", () => {
    const id = "Rowan";

    const result = urlsForUser(id, urlDatabase);
    assert.deepEqual(result, {
      b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "Rowan" },
    });
  });

  it("should return an empty object if no urls were found", () => {
    const id = "Dylan";

    const result = urlsForUser(id, urlDatabase);
    assert.deepEqual(result, {});
  });
});

/* --------- tests for generateRandomString --------- */

describe("generateRandomString", () => {
  it("should generate a random string", () => {
    const result1 = generateRandomString();
    const result2 = generateRandomString();

    const result3 = generateRandomString();
    const result4 = generateRandomString();

    assert.notEqual(result1, result3);
    assert.notEqual(result1, result2);
    assert.notEqual(result1, result4);
    assert.notEqual(result2, result3);
  });
});
