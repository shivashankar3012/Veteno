const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');
const passport = require("passport");
const localPassport = require("passport-local");
const logging = require("./authenticatoin");
const session = require("express-session");
const flash = require("connect-flash");

app.use(bodyParser.json());
app.use(cors());
const port = 5500;
const path = require('path');

const sessionOptions = {
    secret: 'mysecrete',
    resave: false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
    }
}

mongoose.connect('mongodb://localhost:27017/veteno',{useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=> console.log("MongoDB Connected"))
    .catch(err=> console.log(err));

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));


passport.use(new localPassport(logging.authenticate()));
passport.serializeUser(logging.serializeUser());
passport.deserializeUser(logging.deserializeUser());


const formSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,   
    },
    email:{
        type: String,
        required: true,
    },
    phone:{
        type: Number,
        required: true,
    },
    gender:{
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    services:{
        type: String,
        required:true,
    },
    serviceType:{
        type: String,
        required: true
    }
})

app.use(express.static(path.join(__dirname, 'public'))); 
const formData = mongoose.model('formData', formSchema);

app.get('/',(req,res)=>{
    res.render('index.ejs');
})

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html')); // Use absolute path
});


app.post('/submit',async(req,res)=>{
    const {name, email, phone, gender, address, services, serviceType} = req.body;
    const newForm = new formData({
        name,
        email,
        phone,
        gender,
        address,
        services,
        serviceType,
    });
    await newForm.save();
    res.redirect('/');
});

app.get("/login",(req,res)=>{
    if(req.isAuthenticated()){
        req.flash("success","You are already logged In");
        return res.redirect("/");
    }
    res.render("login.ejs");
})

app.post("/signup",async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        let newlogging = new logging({
            email: email,
            username: username
        });
        const registeredUser = await logging.register(newlogging, password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Veteno");
            return res.redirect("/");
        });

    }catch(err){
        console.log(err);
        res.send(err);
    }
})
app.get('/signin',(req,res)=>{
    res.render('signin.ejs');
})
app.post("/signin",
    passport.authenticate("local", {
        failureRedirect: "/signin",
        failureFlash: true,
}), async (req,res)=>{
    req.flash("success", "Welcome Back to Veteno");
    res.redirect("/");
})

app.get("/signout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
    });
    req.flash("success","Successfuly logged out!");
    res.redirect("/");
})

app.listen(port,()=>{
    console.log(`app is listening on port number ${port}`);
})