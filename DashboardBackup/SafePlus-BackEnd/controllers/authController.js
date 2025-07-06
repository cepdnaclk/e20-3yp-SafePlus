const User = require("../models/User");
const LoginActivity = require('../models/LoginActivity');
const speakeasy = require("speakeasy");
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
const login = async (req, res) => {
  try {
    const ip = req.clientIp;
    const { name, password } = req.body;

    console.log("Login API hit");
    console.log("Login request for username:", name);

    if (!name || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ name });
    if (!user) {
      console.log("No user found with name:", name);
      return res.status(404).json({ error: 'No User Found' });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      console.log("Password does not match for user:", name);
      return res.status(401).json({ error: 'Password does not match' });
    }

    if (user.is2FAEnabled) {
      console.log("User has 2FA enabled, sending 2FA required response for user:", name);
      return res.json({
        requires2FA: true,
        userId: user._id,
        name: user.name,
      });
    }

    console.log("Password matched, signing JWT for user:", name);

    jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {},
      async (err, token) => {
        if (err) {
          console.error("JWT sign error:", err);
          return res.status(500).json({ error: "Token generation failed" });
        }

        console.log("JWT token generated successfully for user:", name);

        try {
          await LoginActivity.create({
            userId: user._id,
            timestamp: new Date(),
            ip: ip,
            userAgent: req.headers['user-agent'],
          });
          console.log("Login activity recorded for user:", name);
        } catch (activityErr) {
          console.error("Error recording login activity for user:", name, activityErr);
        }

        res.cookie('token', token).json({
          token,
          username: user.name,
        });
      }
    );
  } catch (error) {
    console.error("Unexpected error in login route:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verify2FA = async (req, res) => {
  try {
    const ip = req.clientIp;
    const { userId, totpCode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.is2FAEnabled || !user.twoFASecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }

    const expectedCode = speakeasy.totp({
      secret: user.twoFASecret,
      encoding: "base32",
    });
    

    // ✅ Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: totpCode.trim(),
      token: totpCode,
      window: 4, // allows ±30s clock drift
    });

    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired 2FA code" });
    }

    jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {},
      async (err, token) => {
        if (err) {
          console.error("JWT Sign error:", err);
          return res.status(500).json({ error: "Token generation failed" });
        }

        await LoginActivity.create({
          userId: user._id,
          timestamp: new Date(),
          ip: ip,
          userAgent: req.headers['user-agent'],
        });

        res.cookie("token", token).json({
          success: true,
          token,
          username: user.name,
        });
      }
    );
  } catch (err) {
    console.error("Error in /verify-2fa:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const getLoginActivities = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const activities = await LoginActivity.find({ userId })
      .sort({ timestamp: -1 }) // Sort by most recent first
      .limit(20); // Optional: limit to last 20 logins

    res.status(200).json(activities);
  } catch (err) {
    console.error('Error fetching login activities:', err);
    res.status(500).json({ message: 'Server error' });
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

const changePassword = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { currentPassword, newPassword } = req.body;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteAccount = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const deleted = await User.findByIdAndDelete(decoded.id);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    res.clearCookie('token'); // remove cookie
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export all controllers
module.exports = {
  register,
  login,
  test,
  getProfile,
  updateProfile,
  getProfilebyname,
  changePassword,
  deleteAccount,
  getLoginActivities,
  verify2FA
};
