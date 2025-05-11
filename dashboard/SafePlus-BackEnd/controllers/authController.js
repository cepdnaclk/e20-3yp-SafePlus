const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {hashPassword, comparePassword} = require('../helpers/auth')


//signup endpoint
const register = async (req, res) => {
  try{
    const {name, email, password} = req.body;
    //check if name was entered
    if(!name){
     return res.json({
       error: 'name is required'
     })
    };
     //check if password is good
    if(!password || password.length< 6){
     return res.json({
       error: 'password is required & must be greater than 6'
     })
    };

    //check ifemail exist
    const exist = await User.findOne({email});
    if(exist){
     return res.json({
       error: 'email is taken already'
     })
    }

    const hashedPassword = await hashPassword(password)

     //create user in db
     const user = await User.create({
      name,
      email,
      password: hashedPassword,
     });


    return res.json(user)
 } catch (error) {
     console.log(error)
 }
};

//login end point
const login = async (req,res) => {
  try {
    const {name, password} =req.body;

    //check if user exist
    const user = await User.findOne({name});
    if (!user){
      return res.json({
        error: 'No User Found'
      })
    }
    //check password match
    const match = await comparePassword(password, user.password);
    if(match ){
      jwt.sign({email: user.email, id:user._id, name: user.name}, process.env.JWT_SECRET,{}, (err,token) =>{
        if(err) throw err;
        res.cookie('token', token).json(user)
      })
    }
    if(!match){
      res.json({
        error: "Password do not match"
      })
    }
  } catch (error) {
    console.log(error)
  }
};

const test = (req, res) => {
  res.json('test is working');
};

const getProfile =(req,res) => {
const {token} =req.cookies
if (token){
  jwt.verify(token,  process.env.JWT_SECRET, {},(err,user)=>{
    if(err) throw err;
    res.json(user)
  })
} else {
  res.json(null)
}
}

// Export all controllers
module.exports = {
  register,
  login,
  test,
  getProfile
};
