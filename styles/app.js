const express = require('express');
const path = require("path"); 
const app = express();
const notifier = require('node-notifier');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const {Sender}= require('./models/SendMail');
const {ConnectMongo , client}=require('./models/mongodb');
const db=client.db("OrganiseIT");
// const fileRoutes = require('./models/user_file');

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 
    }
}));

// Middleware
// app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files
app.use('/styles', express.static(path.join(__dirname, './styles')));
app.use('/images', express.static(path.join(__dirname, './images')));
app.use('/models', express.static(path.join(__dirname, './models')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/////////////////////////////////////Seperator///////////////////////////////////
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
const upload = multer({ storage });

/////////////////////////////////////Seperator///////////////////////////////////

// Route for the dummy page for testing
app.get('/hello', (req, res) => {res.send("Konichiwa");});
// Route for the home page
app.get('/', (req, res) => {res.render('index');});

/////////////////////////////////////Email verification///////////////////////////////////
app.get('/otp', (req, res) => { res.render("otp");})
app.post('/otp', async(req, res) => {
    let {email}=req.body;
    let check=await db.collection("Users").findOne({email});
    if(!check){
    let OTP=(Math.floor(Math.random() * 100000));
    Sender(email,OTP);
    // Store OTP and email in session for verification
    req.session.otp = OTP; 
    console.log(req.session.otp);
    req.session.email = email;
    res.redirect("register");
    notifier.notify({title: "OTP sent successfuly", message: "Check your entered email-id"});
    }
    else
    res.status(400).send("User already exists");

})

/////////////////////////////////////Registration page///////////////////////////////////
app.get('/register', (req, res) => { res.render("register");});
app.post("/register", (req, res, next) => {
    let { username, OTP, password } = req.body;
    // Create new user
    if(OTP==req.session.otp){
        let user = {
            id: new Date().getTime().toString().slice(5),
            username: username,
            email: req.session.email,
            password: password,
            files: [{
                filename: String,
                originalName: String,
                uploadDate: Date
              }]
        };
        delete req.session.otp;
        db.collection("Users").insertOne(user);
        res.render("login");
    }
    else{notifier.notify({title: "Invalid OTP", message: "Please enter valid OTP"});}
});

/////////////////////////////////////login page///////////////////////////////////
app.get('/login', (req, res) => { res.render("login");});
app.post("/login", async(req, res) => {
    let { username, password } = req.body;    
    const foundUser = await (await db).collection("Users").findOne({username});
    req.session.userId = foundUser._id;
    // Check for existing user
    if (!foundUser) {
            res.status(401).send("Invalid username. Please try again.");
        }
    else if (foundUser.password === password) {
            req.session.username = req.body.username;
            req.session.username = username;
        res.render("home",{foundUser});
    } 
    else {  res.status(401).send("Invalid credentials. Please try again."); res.render("login");}
});

/////////////////////////////////////User Dashboard///////////////////////////////////
app.get('/home',async(req, res) => {
    let username= req.session.username;
    const foundUser = await (await db).collection("Users").findOne({username});
    if(!req.session.username)
    { res.redirect('/login');}
    else{
        res.redirect('home',{foundUser});}
});
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        // req.flash('error', 'Please a file');
        return res.redirect('/home');
      }
      let username= req.session.username;
      const user = await db("Users").findOne({username});
      user.files.push({
        filename: req.file.filename,
        originalName: req.file.originalname,
        uploadDate: new Date()
      });
      await user.save();
    //   req.flash('success', 'File uploaded successfully');
      res.redirect('/home');
    } catch (error) {
    //   req.flash('error', 'Upload failed');
      res.redirect('/home');
    }
  });
/////////////////////////////////////Seperator///////////////////////////////////



/////////////////////////////////////AI_chatbot///////////////////////////////////
app.get("/AI_text_summarizer",(req,res,err)=>{
    if(!req.session.username){ 
    res.redirect('/login'); }
    else{
    const keyy=process.env.API_Key;
    const username = req.session.username;
    res.render('AI.ejs',{keyy:keyy , username:username});
    }
})

/////////////////////////////////////Logout and Error handler///////////////////////////////////
app.get("/logout", (req, res) => {
        delete req.session.username;
        delete req.session.email;
        res.redirect('/'); // Redirect to the home or login page
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

/////////////////////////////////////Start the server///////////////////////////////////
app.listen(1333, (err) => {
    if (err) {
        console.error("Server cannot be started on port 1333!");
    } else {
        console.log("Server is running on http://localhost:1333");
    }
});