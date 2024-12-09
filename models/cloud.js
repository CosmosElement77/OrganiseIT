const cloudinary = require('cloudinary').v2;
const express=require("express");
const router=express.Router();

const {ConnectMongo , client}=require('../models/mongodb');
const db=client.db("OrganiseIT");

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_key,
    api_secret: process.env.cloud_secret
})
router.post("/",(req,res,next)=>{
    if(!req.session.username)
    { res.redirect('/login');}
    const file=req.files.document;
    const originalFilename = file.name;
     cloudinary.uploader.upload(file.tempFilePath , { resource_type: "raw" , public_id: originalFilename  },async (error, result) => {
        // console.log(result)
        const username=req.session.username;
        const user= await db.collection("Users").findOne({username});
        if(user)
        {
            db.collection("Users").updateOne(
            { username },
            { $push: { files: { filename: file.name, fileURL: result.url, uploadDate: new Date() }}}
            );
        }
        res.redirect("/home");
    })

})

module.exports=router;
