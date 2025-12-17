// imports =======================================================================================

const express = require('express')
const router = express.Router()
const Users = require('../models/user')
const Games = require('../models/game')

// GET ============================================================================================

router.get('/', async(req,res)=>{
    try{
        req.session.errorMessage = null
        let userAccountsToDisplay = []
        let anonymousCounter = 1
        // finds all users
        const users = await Users.find()
        
        // loop through all
        for (let user of users) {
            if (user.accountState === 'Public') { // if account is public add it
                const userCopy = {
                    _id: user._id,
                    username: user.username,
                    accountState: user.accountState,
                    image: user.image
                }
                userAccountsToDisplay.push(userCopy)
            } 
            else {
                // checks if there is any private accounts that has public games
                const publicGames = await Games.find({owner: user._id, gameState: 'Public'})
                if (publicGames.length > 0) {
                    // if yes add and change display name to Anonymous
                    const userCopy = {
                        _id: user._id,
                        username: `Anonymous ${anonymousCounter}`,
                        accountState: user.accountState,
                        image: user.image
                    }
                    userAccountsToDisplay.push(userCopy)
                    anonymousCounter++
                }
            }
        }
        res.render('gamers/index.ejs', { users: userAccountsToDisplay})
    }
    catch(err){
        console.error('Ran into and error: '+err)
        res.redirect('/')
    }
})

router.get('/:id',async(req,res)=>{
    try {
        const user = await Users.findById(req.params.id)
        if (user.accountState === 'Private'){
            user.username = 'Anonymous'
        }
        const games = await Games.find({owner: user._id, gameState: 'Public'})
        // get the total money spent on all games that are set to public
        let totalMoneySpent = 0 
        games.forEach(game =>{
            totalMoneySpent += game.price
        }) 
        res.render('gamers/show.ejs', { user, games, totalMoneySpent })
    } 
    catch (err) {
        console.error('Ran into and error: '+err)
        res.redirect('/')  
    }
})

// exports ========================================================================================

module.exports = router