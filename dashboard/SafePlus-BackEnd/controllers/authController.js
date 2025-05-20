const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {hashPassword, comparePassword} = require('../helpers/auth')


//signup endpoint
const register = async (req, res) => {
  try{
    const {fname,name, email, password} = req.body;
    //check if name was entered
    if(!fname){
     return res.json({
       error: 'full name is required'
     })
    };
    //username
    if(!name){
     return res.json({
       error: 'name is required'
     })
    };
    //check ifemail exist
    const existuser = await User.findOne({name});
    if(existuser){
     return res.json({
       error: 'username is taken already'
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
      fname,
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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { fname, name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fname, name, email },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      fname: updatedUser.fname,
      name: updatedUser.name,
      email: updatedUser.email,
      id: updatedUser._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

const getProfilebyname = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ name: username }).select('-password'); // exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



// Export all controllers
module.exports = {
  register,
  login,
  test,
  getProfile,
  updateProfile,
  getProfilebyname
};
