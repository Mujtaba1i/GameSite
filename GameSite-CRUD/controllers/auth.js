// imports =======================================================================================

const express = require('express')
const bcrypt = require("bcrypt")
const validator = require('validator')
const { OAuth2Client } = require('google-auth-library')
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const router = express.Router()
const User = require('../models/user')
router.use(express.json())

// Oauth =============================================================================================

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

router.get('/google', (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'],
  });
  res.redirect(authorizeUrl);
})

router.get('/google/callback', async (req, res) => {
  const code = req.query.code

  if (!code) {
    // if the query failed
    return res.status(400).send('Authorization code missing.');
  }

  try {
    const { tokens } = await client.getToken(code)

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const googleId = payload.sub
    const userName = payload.name
    
    // check if there is a user with the same id
    let user = await User.findOne({ googleId: googleId })

    // if not
    if (!user) {
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // create a new user    
    user = new User({
        username: userName,
        password: hashedPassword,
        googleId: googleId,
        accountState: 'Public'
      })
    // save it   
      await user.save();

      // generate image with dicebear
      user.image = `https://api.dicebear.com/7.x/bottts/svg?seed=${user._id}&size=256&backgroundColor=6b7280`;
      await user.save();
    }

    // Create session
    req.session.user = {
        username: user.username,
        _id: user._id,
        isSignedWithGoogle: true
    }

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/') 
      }
      res.redirect('/')
    })

  } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/') 
  }
})

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

    // use the validator to check if the password if strong or not
    if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })){
        console.log(password)
        return res.send('Password is not strong enough')
    }

    // encrypt the password 
    const hashedPassword = bcrypt.hashSync(password, 10)
    // console.log(req.body)
    req.body.password = hashedPassword
    delete req.body.confirmPassword
    
    
    // if the above matches, create account with the encrypted password
    const user = await User.create(req.body);

    // create a random BOT styled avatar that is unique to each user based on the _id mangoDB randomly assigned  
    // using API-free website dicebear
    // setting the background to gray
    const userId = user._id
    user.image = `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}&size=256&backgroundColor=6b7280`
    await user.save()

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