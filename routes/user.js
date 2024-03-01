const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const flash = require("express-flash");
const passport = require("passport");

router.use(flash());
router.use(express.urlencoded({ extended: true }));

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
});

router.post("/signup", async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err) =>{
            if(err) {
                return next(err);

            }

            req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listing");
        })
        
    } catch (error) {
        console.error(error);
        req.flash("error", error.message );
        res.redirect("/signup"); 
    }
});
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login", async (req, res) => {
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true })(req, res, async () => {
        try {
            if (req.user) {
                req.flash("success", "Welcome to Wanderlust! You are logged in!");
                res.redirect("/listing");
            } else {
                req.flash("error", "Invalid username or password.");
                res.redirect("/login");
            }
        } catch (error) {
            console.error(error);
            req.flash("error", "An unexpected error occurred during login.");
            res.redirect("/login");
        }
    });
});

router.get("/logout", (req,res,next) => {
    req.logout((err) =>{
        if(err) {
            return next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listing")
    })
})

module.exports = router;