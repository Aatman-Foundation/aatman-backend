import mongoose, { Schema, trusted } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

const adminSchema = Schema({
  fullname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
  },

  phoneNumber : {
    type : Number,
    required : true,
    unique : true,

  },
  refreshToken: {
      type: String,
    },
  password : {
    type : String,
    required : true
  },

  role : {
    type : String,
    default : "admin"
  }

}, {timestamps : true});




adminSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

adminSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
      {
    _id: this._id,
     email: this.email,
     fullname: this.fullname,
     role : this.role
    },
    process.env.ADMIN_TOKEN_SECRET,
    {expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY}
  )
}
adminSchema.methods.genrateRefreshToken = function(){
    return jwt.sign({
    _id: this._id,
    },
    process.env.ADMIN_TOKEN_SECRET,
    {expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRY}
  )
}


export const Admin = mongoose.model("Admin", adminSchema);
