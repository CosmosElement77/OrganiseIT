const express = require('express');
const path = require("path"); 
const app = express();
const notifier = require('node-notifier');
const fs = require('fs');
// const cloudinary = require('cloudinary').v2;
const session = require('express-session');
require('dotenv').config();

const {Sender}= require('../models/SendMail');
const {ConnectMongo , client}=require('../models/mongodb');
const db=client.db("OrganiseIT");

const Uploader=require("../models/cloud");
const fileUpload = require('express-fileupload');

//      ***             Middlewares             ***     //
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 
    }
}));
app.use(fileUpload({
    useTempFiles:true
})) 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/models', express.static(path.join(__dirname, '../models')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

/////////////////////////////////////Seperator///////////////////////////////////

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
            username: username.trim(),
            email: req.session.email,
            password: password,
            // files: [{
            //     filename: String,
            //     fileURL: String,
            //     uploadDate: Date
            //   }]
        };
        delete req.session.otp;
        db.collection("Users").insertOne(user);
        notifier.notify({title: "Registered Succefully", message: "Now, You can login !"});
        res.redirect("login");
    }
    else{notifier.notify({title: "Invalid OTP", message: "Please enter valid OTP"});}
});

/////////////////////////////////////login page///////////////////////////////////
app.get('/login', (req, res) => { res.render("login");});
app.post("/login", async(req, res) => {
    let { usermail, password } = req.body;    
    const foundUser = await (await db).collection("Users").findOne({usermail});
    // req.session.userId = foundUser._id;
    let username=foundUser.username;
    // Check for existing user
    if (!foundUser) {
            res.status(401).send("Invalid username. Please try again.");
        }
    else if (foundUser.password === password) {
            req.session.username = req.body.username;
            req.session.username = username;
        res.redirect(302,"/home");
    } 
    else {  res.status(401).send("Invalid credentials. Please try again."); 
      res.render("login");}
});

/////////////////////////////////////User Dashboard///////////////////////////////////
app.get('/home',async(req, res) => {
    let username= req.session.username;
    const foundUser = await (await db).collection("Users").findOne({username});
    if(!req.session.username)
    { res.redirect('/login');}
    else{
        res.render('home',{foundUser});}
});
app.use('/upload',Uploader);

/////////////////////////////////////Seperator///////////////////////////////////

// app.post("/upload" ,async (req,res)=>{

// let username= req.session.username;
// const foundUser = await (await db).collection("Users").findOne({username});
// // Read binary data from a file
// let {path_name}=req.body;
// const binaryData = fs.readFileSync("C:/Users/Ryuosuke/Downloads/DObI77g2.torrent.part");
// // Save binary data to MongoDB
// foundUser.files.push({
//     file_data: new Binary(0, binaryData.toString('base64'))
// });
// })


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