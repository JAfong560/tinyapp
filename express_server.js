const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //Declare EJS as templating engine
app.set("views", "./views")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL /* What goes here? */ };
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

//login functionality
app.get("/login", (req, res) => {
  const id = req.session.user_id;
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
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.send("Invalid email or password combination.");
  }
});

app.post("/logout", (req, res) => {
  req.session=null;
  res.redirect("/login");
})

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