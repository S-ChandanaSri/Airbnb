const express = require("express");
const router = express.Router();
const {listingSchema,reviewSchema} = require("../schema.js");
//const ExpressError=require("./utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.get("/",  async(req, res) => {
    try {
      const allListings = await Listing.find({});
      res.render("home.ejs", { allListings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching the listings" });
    }
  });

  router.get("/new",isLoggedIn,(req,res)=>{
    
    res.render("edit.ejs");
  })
  
  
  
  
  
  /*showroute*/
  router.get("/:id",async(req,res)=>{
   let  {id}=req.params;
   const allChatt=await Listing.findById(id)
   .populate({
    path:"reviews",
    populate:{
    path:"author",
   },
  })
  .populate("owner");
  console.log(allChatt)

   res.render("show.ejs",{allChatt});
  
  });

  
  router.post("/",isLoggedIn, upload.single('listing[image]'), async (req,res,next)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    //console.log(url, "..", filename);
    const newListing=new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename};
    
    await newListing.save();
     res.redirect("/listing"); 
    });
  
    /*edit*/
    router.get("/:id/edit",isLoggedIn,isOwner,async(req,res)=>{
      let  {id}=req.params;
      const all=await Listing.findById(id);
      res.render("editt.ejs",{all});
    })
  
  router.put("/:id",isLoggedIn,isOwner,async(req,res)=>{
    let  {id}=req.params;
    
    await Listing.findByIdAnd
    Update(id,{...req.body.listing}).populate("owner");
    res.redirect("/listing");
  
  });
  
  router.delete("/:id",isLoggedIn,isOwner,async(req,res)=>{
    let  {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    res.redirect("/listing");
  });
  
  module.exports = router;