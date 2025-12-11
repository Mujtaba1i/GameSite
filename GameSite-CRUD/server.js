// imports ===========================================================================================

require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const methodOverride = require("method-override")
const session = require('express-session')
const {MongoStore} = require("connect-mongo")
const isSignedIn = require("./middleware/isSignedIn")
const passUserToView = require("./middleware/passUserToView.js")
const path = require('path')
const app = express()
const port = process.env.PORT ? process.env.PORT : "4000" 

// Connecting to DB ==================================================================================

require('./config/database.js');

// controller(s) =====================================================================================

const authCtrl = require("./controllers/auth")
const gamesCtrl = require('./controllers/games')
const gamersCtrl = require('./controllers/gamers')

// cookies ===========================================================================================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI
            })
        })
)

// Style Sheet =======================================================================================

app.use(express.static(path.join(__dirname, 'public')));

// middleware ========================================================================================

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride("_method"))
app.use(morgan("dev"))

// Routes ============================================================================================

// Public Routes =====================================================================================

// passing the user
app.use(passUserToView)

// homepage
app.get("/", async (req, res) => {
    if (req.session.user){
        return res.redirect('/games')
    }
    res.render('index.ejs')
})

// auth Routes
app.use('/auth' , authCtrl)


// Protected Routes ==================================================================================
app.use(isSignedIn)

app.use('/games', gamesCtrl)
app.use('/gamers', gamersCtrl)

















// listening =========================================================================================
app.listen(port, () => console.log(`listening on port ${port}`))