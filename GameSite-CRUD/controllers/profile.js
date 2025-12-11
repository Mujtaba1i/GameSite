// imports =======================================================================================

const express = require('express')
const router = express.Router()
const Games = require('../models/game')
const Users = require('../models/user')

// GET ============================================================================================

router.get('/', async(req,res)=>{
    res.render('profile/index.ejs')
})

router.get('/new', async(req,res)=>{
    res.render('profile/new.ejs')
})


// POST ===========================================================================================

router.post('/', async(req,res)=>{
    try {
        req.body.owner = req.session.user._id
        const newGame = await Games.create(req.body)
        res.redirect('/profile')        
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }

})

// exports ========================================================================================

module.exports = router