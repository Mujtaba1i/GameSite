// imports =======================================================================================

const express = require('express')
const bcrypt = require("bcrypt")
const router = express.Router()
const Games = require('../models/game')
const Users = require('../models/user')
const getGameCover = require("../services/game-images-service.js")

// function(s) ====================================================================================

async function getCover(gameName) {
    const gameImageUrl = await getGameCover(gameName)
    console.log('Cover Image URL: '+ gameImageUrl)
    return gameImageUrl
}

// GET ============================================================================================

router.get('/', async(req,res)=>{
    // find all the games that the logged in user "OWNE"
    const games = await Games.find({owner: req.session.user._id}).populate('owner')
    const user = await Users.findById(req.session.user._id)
    res.render('profile/index.ejs', { games, user })
})

router.get('/new', async(req,res)=>{
    res.render('profile/new.ejs')
})

router.get('/settings', async(req,res)=>{
    try {
        const user = await Users.findById(req.session.user._id)
        res.render('profile/settings.ejs', { user, isSignedWithGoogle: req.session.user.isSignedWithGoogle})
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
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

router.put('/settings', async(req,res)=>{
    try{
        const user = await Users.findById(req.session.user._id)
        const isSignedWithGoogle = req.session.user.isSignedWithGoogle
        if (!isSignedWithGoogle){
            if (bcrypt.compareSync(req.body.password, user.password)){
                delete req.body.password
                const updatedUser = await Users.findByIdAndUpdate(req.session.user._id, req.body, {new: true})
                req.session.user = {
                    username: updatedUser.username,
                    _id: updatedUser._id,
                    isSignedWithGoogle: updatedUser.isSignedWithGoogle
                }
                res.redirect('/profile')
            }
            else res.send('Password is incorrect')
    }
    else{
        const updatedUser = await Users.findByIdAndUpdate(req.session.user._id, req.body, {new: true})
        req.session.user = {
        username: updatedUser.username,
        _id: updatedUser._id,
        isSignedWithGoogle: updatedUser.isSignedWithGoogle
        } 
        res.redirect('/profile')
    }

    }
    catch(err){
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
})

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