//import external modules
const express = require("express");
const ejs = require('ejs')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');

//initialize middlewares

/* app.use(cookieSession({
  name: 'session',
  keys:["lighthouse"],
})); */

app.use(bodyParser.urlencoded({ extended: true })); // Enables body-parse
app.set('view engine', 'ejs'); // Enables EJS for rendering the pages

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.example.com", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL, user: req.cookies["user"] /* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID,
  }
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// when the delete button on the show /urls page is pressed
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.user_id;
  if (userID) {
    delete urlDatabase[shortURL];
  } else {
    res.send("Unauthorized request");
  }
  res.redirect("/urls");
});

// when the edit buton on the show URL page is pressed
app.put("/urls/:shortURL/edit", (req, res) => {
  const userID = req.cookies["user"];
  const shortURL = req.params.shortURL;
  let usersObj = isUsersLink(urlDatabase, userID);
  //check if shortURL exists for current user:
  if (usersObj[shortURL]) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.render("error", {ErrorStatus: 403, ErrorMessage: "You do not have access to edit this link."});
  }
});

//login functionality
app.get("/login", (req, res) => {
  const id = "user";
  const user = id ? users[id] : null;
  let templateVars = { user };
  res.render("login", templateVars);
})

app.post("/login", function (req, res) {
  const loginemail = req.body.loginemail; // get the entered email
  const loginpassword = req.body.loginpassword; //get the entered password
  const userID = getUserByEmail(loginemail, users); //returns user id
  const passwordCheck = checkPassword(loginemail, loginpassword, users);
  if (userID && passwordCheck) {
    req.cookies["user"] = userID;
    res.redirect("/urls");
  } else {
    res.send("Invalid email or password combination.");
  }
});

app.post("/logout", (req, res) => {
  req.session=null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const id = req.params.user_id;
  const user = id ? users[id] : null; // check if the cookie already exists with a legit id 
  let templateVars = { user };
  res.render("registration", templateVars);
})

app.post("/register", function (req, res) {
  const { email, password } = req.body;
  //if email or password input is blank throw an error
  if (email === "" || password === "") {
    res.status(400).send("An email or password needs to be entered.")
    return
    //if email is already in use throw an error 
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email is already in use.")
    return
  } else {
    //if the email is not in use, create a new user for TinyApp
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 8)
    }
    req.session.user_id = userID;
    // res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

// DATABASE FOR THE USERS
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//
const generateRandomString = function () {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
//Match the given e-mail with the records
const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
}
  const isUsersLink = function (object, id) {
    let usersObject = {};
    for (let key in object) {
      if (object[key].userID === id) {
        usersObject[key] = object[key];
      }
    }
    return usersObject;
  }
  
  //Validate login by checking email and password combination of a user
  const checkPassword = function (loginemail, loginpassword, objectDb) {
    for (let user in objectDb) {
      if (objectDb[user].email === loginemail && bcrypt.compareSync(loginpassword, objectDb[user].password)) {
        return true;
      }
    }
    return false;
  }