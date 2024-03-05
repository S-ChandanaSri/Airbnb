const express = require("express");
const router = express.Router();
const ExpressError=require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js")


router.post("/",isLoggedIn,async (req,res)=>{
   
    let listing= await Listing.findById(req.params.id);
    let newReview = new Review(req.body.Review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
     res.redirect(`/listing/${listing._id}`); 
});

module.exports = router;