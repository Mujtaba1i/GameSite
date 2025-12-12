// imports ======================================================================================

const mongoose = require("mongoose");

// Schema =======================================================================================

const gamesSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  image:{
    type: String
  },
  playDate:{
    type: Date
  },
  price:{
    type: Number,
    min:0
  },
  completion:{
    type: Number,
    min:0,
    max:100
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  gameState: {
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

const Game = mongoose.model("Game", gamesSchema);

// exports ========================================================================================

module.exports = Game
