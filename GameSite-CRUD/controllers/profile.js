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
    return gameImageUrl
}

// GET ============================================================================================

router.get('/', async(req,res)=>{
    try {
        req.session.errorMessage = null
        const games = await Games.find({owner: req.session.user._id}).populate('owner')
        const user = await Users.findById(req.session.user._id)
        res.render('profile/index.ejs', { games, user })
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
})

router.get('/new', async(req,res)=>{
    res.render('profile/new.ejs')
})

router.get('/settings', async(req,res)=>{
    try {
        const user = await Users.findById(req.session.user._id)
        res.render('profile/settings.ejs', { user, isSignedWithGoogle: req.session.user.isSignedWithGoogle, errorMessage: req.session.errorMessage})
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
})

router.get('/:id', async(req,res)=>{
    try{
    const game = await Games.findById(req.params.id).populate('owner')
    res.render('profile/show.ejs', { game })

    }
    catch(err){
        console.error('Ran into and err: '+err)
        res.redirect('/profile')
    }
})

router.get('/:id/edit',async(req,res)=>{
    try {
        const game = await Games.findById(req.params.id)
        res.render('profile/edit.ejs', { game })
    }
    catch(err){
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
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
            else {
                req.session.errorMessage = 'Password is incorrect'
                res.redirect('/profile/settings')
            }
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
        res.redirect('/profile/'+updatedGame._id)        
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    } 
})

// DELETE ========================================================================================

router.delete('/settings', async(req,res)=>{
    try {
        if (req.session.user.isSignedWithGoogle){
            await Games.deleteMany({ owner: req.session.user._id })
            await Users.findByIdAndDelete(req.session.user._id)
            req.session.destroy()
            res.redirect('/')
        }
        else{
            const user = await Users.findById(req.session.user._id)
            
            if (!req.body.password || !user.password) {
                req.session.errorMessage = 'Password is required'
                res.redirect('/profile/settings')
                return
            }
            
            if (bcrypt.compareSync(req.body.password, user.password)){
                await Games.deleteMany({ owner: req.session.user._id })
                await Users.findByIdAndDelete(req.session.user._id)
                req.session.destroy()
                res.redirect('/')
            }
            else {
                req.session.errorMessage = 'Password is incorrect'
                res.redirect('/profile/settings')
            }
        }
    } catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/profile')
    }
})

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