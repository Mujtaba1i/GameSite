// imports ======================================================================================

const mongoose = require("mongoose");

// Schema =======================================================================================

const gamesSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  genra:{
    type: String
  },
  image:{
    type: String
  },
  releaseDate:{
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
  }
},
{
  timestamps: true
})

// model creation =================================================================================

const Game = mongoose.model("Game", gamesSchema);

// exports ========================================================================================

module.exports = Game
