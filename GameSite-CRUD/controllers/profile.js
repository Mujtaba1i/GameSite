// imports =======================================================================================

const express = require('express')
const router = express.Router()
const Games = require('../models/game')
const Users = require('../models/user')
const getGameCover = require("../services/game-images-service.js")

// GET ============================================================================================

async function getCover(gameName) {
    const gameImageUrl = await getGameCover(gameName)
    console.log('Cover Image URL: '+ gameImageUrl)
    return gameImageUrl
}

router.get('/', async(req,res)=>{
    // find all the games that the logged in user "OWNE"
    const games = await Games.find({owner: req.session.user._id}).populate('owner')
    res.render('profile/index.ejs', { games })
})

router.get('/new', async(req,res)=>{
    res.render('profile/new.ejs')
})

router.get('/:id', async(req,res)=>{
    try{
    const game = await Games.findById(req.params.id).populate('owner')
    // console.log(game)
    res.render('profile/show.ejs', { game })

    }
    catch(err){
        console.error('Ran into and err: '+err)
        res.redirect('/profile')
    }
})

router.get('/:id/edit',async(req,res)=>{
    const game = await Games.findById(req.params.id)
    res.render('profile/edit.ejs', { game })

})

// POST ===========================================================================================

router.post('/', async(req,res)=>{
    try {
        req.body.owner = req.session.user._id
        req.body.image = await getCover(req.body.name)
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
        // checks if game name changed or not
        if (req.body.name !== await Games.findById(req.params.id).name){
            req.body.image = await getCover(req.body.name)
        }
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