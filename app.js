const express = require('express');
const path = require("path"); 
const fs = require("fs");
const notifier = require('node-notifier');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
require('dotenv').config();
// const { Auth, LoginCredentials } = require("two-step-auth");

const UserModel = require("./models/user");
const mongoose = require('mongoose');
const mon_user=process.env.admin;
const mon_pass=process.env.password;
// mongoose.connect(`mongodb+srv://{mon_user}:{mon_pass}@noteitdown.fo9oa.mongodb.net/`);
// const db = mongoose.connection;
// const UserData = mongoose.model('User', userSchema);

const nd=require("nodemailer");
const transporter = nd.createTransport({
    service: 'Gmail',
    auth: {
      user: 'organise8t@gmail.com', 
      pass: 'nzhv ywpz xjra shhj'
    }
  });


app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files
app.use('/styles', express.static(path.join(__dirname, './styles')));
app.use('/images', express.static(path.join(__dirname, './images')));

if (fs.existsSync('UserDb.json')) {
    const data = fs.readFileSync('UserDb.json');
    db = JSON.parse(data);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
function isAuthenticated(req, res, next) {
    if (req.params.username) {
        return next(); // User is authenticated, proceed to the next middleware/route
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}
/////////////////////////////////////Seperator///////////////////////////////////

// Route for the dummy page for testing
app.get('/hello', (req, res) => {
    // res.send("Konichiwa");
    res.sendFile("Dummy.html", { root: __dirname });
});
// Route for the home page
app.get('/', (req, res) => {
    res.render('index');
});
// Route fro home page after user login
app.get('/home/:username',isAuthenticated, (req, res) => {
    const username = req.params.username;
    res.render('home', { username: username });
});


/////////////////////////////////////Seperator///////////////////////////////////

// Route for the registration page
app.get('/register', (req, res) => {
    // res.sendFile("register.html", { root: __dirname });
    res.render("register");
});
// Registration route
app.post("/register", (req, res, next) => {
    let { username, email, password } = req.body;
    // Validate input
    // if (!username || !email || !password) { return res.status(400).send("All fields are required.");}
    // Check for existing user
    const existingUser = db.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).send("User already exists with this email.");
    }
    // Create new user
    let user = {
        id: new Date().getTime().toString().slice(5),
        username: username,
        email: email,
        password: password // Consider hashing this password
    };
    // Add user to database
    db.push(user);
    // Write updated database to file
    fs.writeFile("UserDb.json", JSON.stringify(db), (err) => {
        if (err) {
            return next(err); // Pass the error to the error handler
        } else {
            notifier.notify({title: "Registration Successful", message: "You have successfully registered."});
            // res.sendFile("login.html",{root:__dirname});
            res.render("login");
        }
    });
});

/////////////////////////////////////Seperator///////////////////////////////////


/////////////////////////////////////Seperator///////////////////////////////////
// Route for the login page
app.get('/login', (req, res) => {
    // res.sendFile("login.html", { root: __dirname });
    res.render("login");
});

// Login route
app.post("/login", (req, res) => {
    let { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).send("All fields are required.");
    }
    // Check for existing user
    const foundUser = db.find(user => user.username === username && user.password === password);
    if (foundUser) {
        req.session.username = req.body.username;
        // res.render("home", {username: req.session.username});
        req.session.username = username;
        res.redirect(`/home/${username}`);
    } else {
        res.status(401).send("Invalid credentials. Please try again.");
    }
});

/////////////////////////////////////Seperator///////////////////////////////////



/////////////////////////////////////Seperator///////////////////////////////////

app.get("/AI_text_summarizer",(req,res,err)=>
{
    const keyy=process.env.API_Key;
    // console.log(keyy);
    // res.sendFile("/views/AI.html",{root:__dirname});
    res.render('AI.ejs',{keyy:keyy});
})

/////////////////////////////////////Seperator///////////////////////////////////

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out. Please try again.");
        }
        res.redirect('/'); // Redirect to the home or login page
    });
});
// app.get("/logout", (req, res) => {
//     // Check if the user confirmed the logout
//     if (req.query.confirm === "true") {
//       req.session.destroy((err) => {
//         if (err) {
//           return res.status(500).send("Could not log out. Please try again.");
//         }
//         res.redirect("/"); // Redirect to the home or login page
//       });
//     } else {
//       // Redirect back to the previous page or the home page
//       res.redirect(req.get("referer") || "/");
//     }
//   });
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

/////////////////////////////////////Seperator///////////////////////////////////


// Start the server
app.listen(1333, (err) => {
    if (err) {
        console.error("Server cannot be started on port 1333!");
    } else {
        console.log("Server is running on http://localhost:1333");
    }
});