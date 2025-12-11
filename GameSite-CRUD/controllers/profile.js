// imports =======================================================================================

const express = require('express')
const router = express.Router()
const Games = require('../models/game')
const Users = require('../models/user')

// GET ============================================================================================

router.get('/', async(req,res)=>{
    // find all the games that the logged in user "OWNE"
    const games = await Games.find({owner: req.session.user._id}).populate('owner')
    res.render('profile/index.ejs', { games })
})

router.get('/new', async(req,res)=>{
    res.render('profile/new.ejs')
})

router.get('/:id', async(req,res)=>{
    const game = await Games.findById(req.params.id).populate('owner')
    res.render('profile/show.ejs', { game })
})

router.get('/:id/edit',async(req,res)=>{
    const game = await Games.findById(req.params.id)
    res.render('profile/edit.ejs', { game })

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

// UPDATE (PUT) ===================================================================================

router.put('/:id', async(req,res)=>{
    try {
        req.body.owner = req.session.user._id
        const updatedGame = await Games.findByIdAndUpdate(req.params.id, req.body)
        res.redirect('/profile')        
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    } 
})

// DELETE ========================================================================================

router.delete('/:id', async(req,res)=>{
    try {
        await Games.findByIdAndDelete(req.params.id)
        res.redirect('/profile')        
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
})

// exports ========================================================================================

module.exports = router