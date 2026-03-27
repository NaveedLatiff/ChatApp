import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    fullName:{type:String,required:true,},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profilePic:{type:String,default:""},
    bio:{type:String,default: "Hey there! I am using Pingly."},


},{timestamps:true})

const User=mongoose.model("User",userSchema);
export default User;