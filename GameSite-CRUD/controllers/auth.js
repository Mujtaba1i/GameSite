// imports =======================================================================================

const express = require('express')
const bcrypt = require("bcrypt")
const router = express.Router()
const User = require('../models/user')

// GET ============================================================================================

router.get('/sign-up', async (req, res) =>{
    res.render('auth/sign-up.ejs')
})

router.get('/sign-in', async (req, res) =>{
    res.render('auth/sign-in.ejs')
})

router.get('/sign-out', async (req,res)=>{
    req.session.destroy(()=> {
        res.redirect('/')
    })
})

// POST ===========================================================================================

router.post('/sign-up', async(req,res)=>{
    // console.log(req.body)

    const {username, password, confirmPassword} = req.body 
    
    // username is not taken
    const userInDatabase = await User.findOne({ username })
    if (userInDatabase){
        return res.send('Username or password is invalid')
    }

    // validate the posswords match
    if (password !== confirmPassword){
        return res.send('Username or password is invalid')
    }

    // encrypt the password 
    const hashedPassword = bcrypt.hashSync(password, 10)
    // console.log(req.body)
    req.body.password = hashedPassword
    delete req.body.confirmPassword

    // if the above matches, create account with the encrypted password
    const user = await User.create(req.body);
    
    // sign the user in
    req.session.user = {
        username: user.username,
        _id: user._id
    }

    // if succeeds "Sign the user" and redirct it to page
    req.session.save(()=>{
        res.redirect('/')
    })
})

// ============================================

router.post('/sign-in', async(req,res)=>{
    const {username, password} = req.body

    // try to find the username in DB is not exist redirect to the signup
    const userInDatabase = await User.findOne({ username })

    // if exist compare the password 
    if (!userInDatabase){
        return res.send('Username or password is invalid')
    }
    
    const validPassword  = bcrypt.compareSync(password, userInDatabase.password)
    
    if (!validPassword){
        // if doesnt match throw an error
        return res.send('Username or password is invalid')
    }
    else{
        // else continue with the login 
        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id
        }

        req.session.save(()=>{
            res.redirect('/')
        })
    }

})

// exports ========================================================================================

module.exports = router