import express from "express"
import path from "path"
import cookieParser from "cookie-parser";
const app = express();
import mongoose from "mongoose";
import { nextTick } from "process";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

 // connectting with the database
  mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend"
  }).then(()=>console.log("Database Connected ")).catch((e)=>console.log(e))

  // Making a Schema for the database
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
  })
  const User = mongoose.model("User",userSchema)
// using middleware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true})); //for using post method
app.use(cookieParser())

app.set("view engine", "ejs")
const users = []

const isAuthenticated = async(req,res,next)=>{
        const {token} = req.cookies;
        if(token){
        const decoded =   jwt.verify(token,"asdasdadasddsad");
        console.log(decoded)
        req.user = await User.findById(decoded._id)
         next();
         }else{
          res.redirect("login")
         }
      
}

app.get("/",isAuthenticated,(req,res)=>{
 // res.sendStatus(500); send the status 500: -  That is internal server error
 //res.json({
   // success:false,
   // products:[]
 //})

 //res.status(400).send("Meri Marzi")
   //const file = fs.readFileSync("./index.html");
  // const pathlocation = path.resolve();
   //console.log(path.join(pathlocation, "./index.html"));
  //res.sendFile(path.join(pathlocation, "./index.html"))
  //const {token} = req.cookies
   //if(token){
   // res.render("logout")
   //}else{
   // res.render("login")
   //}
  //res.render("login")
  console.log(req.user)
   res.render("logout",{name: req.user.name});
})
//app.get("/add",async(req,res)=>{
 //await Message.create({name:"Shantanu1",email:"sample2@gmail.com"}).then(()=>{
   // res.send("Nice")
  //})
 
//})
//app.get("/success",(req,res)=>{
   // res.render("success")
//})

//app.post("/",async(req,res)=>{
    //console.log(req.body);  // for accessing the name property (req.body.name)
       //  const messageData={username:req.body.name,email: req.body.email};
        // console.log(messageData)
      //   res.render("success");
     // res.render("/success");
    // const {name,email} = req.body
    // await Message.create({name: name, email: email});
    // res.redirect("/success");
                       
//})
app.post("/register",async(req,res)=>{
  const {name,email, password} = req.body
 // console.log(req.body)
 let user = await User.findOne({email})
 if(user){
  return res.redirect("/login")
 }
 
 const hashedPassword = await bcrypt.hash(password,10)
  user = await User.create({
   name,email, password:hashedPassword
  })
  const token = jwt.sign({_id:user._id},"asdasdadasddsad");
  console.log(token);
 res.cookie("token",token, {
    httpOnly: true,
    expires: new Date(Date.now() +60*1000),
 })
      res.redirect("/")
})
app.get("/logout",(req,res)=>{
  res.cookie("token",null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
      res.redirect("/")
})
app.get("/login",(req,res)=>{
  res.render("login")
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/login",async(req,res)=>{
  const {email,password} = req.body;
  let user = await User.findOne({email});
  if(!user) return res.redirect("/register")

  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch) return res.render("login",{email,message:"Incorrect Password"});
  const token = jwt.sign({_id:user._id},"asdasdadasddsad");
  console.log(token);
 res.cookie("token",token, {
    httpOnly: true,
    expires: new Date(Date.now() +60*1000),
 })
      res.redirect("/")
})
//app.get("/users",(req,res)=>{
  //res.json({
  ///  users,
  //})
//})
app.listen(5005, ()=>{
    console.log("Server is working")
})


