import{upsertStreamUser} from "../lib/stream.js";
import { json } from "express";
import User  from "../models/User.js";
import jwt from "jsonwebtoken";

export  async function signup(req, res) {
const { email, password, fullname } = req.body;

 try {
  if (!email || !password || !fullname) {
    return res.status(400).json({message : "All fields are required"});
 }
 if (password.length<6){
  return res.status(400).json({message : "Password must be at least 6 characters long"});
 }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({message : "Invalid email format"});
 }
   const existingUser = await User.findOne({ email });
   if (existingUser) {
       return res.status(400).json({message : "Email  already exists please use a new one"});
   }
   const idx = Math.floor(Math.random()*100) + 1; //genrate a number between 1to 100
   const randomAvatar = `https://avatar.iran.liara.run/public/8/${idx}.png`

   const newUser = await User.create({
       email,
       password,
       fullname,
       profilePic: randomAvatar,
   });
    //Upsert user in Stream

    try {
      await upsertStreamUser({
      id: newUser._id.toString(),
      name:  newUser.fullname,
      image:newUser.profilePic||""
      });
      console.log(`stream user upserted for ${newUser.fullname}`);
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      return res.status(500).json({message: "Failed to create Stream user"});
      
    }

   const token = jwt.sign({userId:newUser._id} , process.env.JWT_SECRET_KEY ,{
       expiresIn :"7d"
   })
   res.cookie('jwt',token,{
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, //prevent xss attcks
        sameSite: "Strict", //prevent csrf attacks
        secure: process.env.NODE_ENV === "production" //only send cookie over https
   });
   res.status(201).json({success: true, user:newUser});

} catch (error) {
   console.log('Error in signup controller:',error)
    res.status(500).json({message: "Internal server error"});
}}

export async function login(req, res) {
try{
  const {email , password} = req.body;
  if (!email || !password){
    return res.status(400).json ({message: "All fields are required"});
  }
  const user =  await User.findOne({email});
  if (!user)return res.status(401).json({message:"Invalid email "});
  
  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect)return res.status(401).json({message:"Invalid password"});

const token = jwt.sign({userId:user._id} , process.env.JWT_SECRET_KEY ,{
    expiresIn :"7d"
});
res.cookie('jwt',token,{
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, //prevent xss attcks
        sameSite: "Strict", //prevent csrf attacks
        secure: process.env.NODE_ENV === "production" //only send cookie over https
   });

res.status(200).json({success: true, user});

} catch(error){
   console.log('Error in login controller:',error);
   res.status(500).json({message: "Internal server error"});
}
}
export  async function logout(req, res) {
  res.clearCookie('jwt');
  res.status(200).json({message: "Logged out successfully"});
}
export async function onboard(req, res) {
try {
  const userId= req.user._id
  const {fullname,bio, nativeLanguage} = req.body
  if (!fullname || !bio || !nativeLanguage) {
    return res.status(400).json({
      message: "All fields are required",
      missingFields: [
        !fullname && "fullname",
        !bio && "bio",
        !nativeLanguage && "nativeLanguage"
      ].filter(Boolean),
    });
  }
     const updatedUser = await  User.findByIdAndUpdate(userId, {
    ...req.body,
    isOnboarded: true,
  }, { new: true });

  if(!updatedUser)return res.status(404).json({message: "User not found"});
  //update the user info stream

  try {
    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullname,
      image: updatedUser.profilePic || "",
    });
     console.log(`Stream user updated for ${updatedUser.fullname}`);
  } catch ( stremError) {
     console.log("Error updating Stream user:", stremError.message);
  }
  res.status(200).json({ success:true , user:updatedUser});
} catch (error) {
  console.error("Onboarding error:", error);
  res.status(500).json({ message: "Internal server error" });
}

}
