// imports ======================================================================================

const mongoose = require("mongoose");

// Schema =======================================================================================

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String
  },
  accountState: {
    type: String,
    required: true,
    enum: ["Public", "Private"],
    default: "Public"
  }
},
{
  timestamps: true
})

// model creation =================================================================================

const User = mongoose.model("User", userSchema);

// exports ========================================================================================

module.exports = User
