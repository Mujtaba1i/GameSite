const isSignedIn = (req,res,next) =>{
    if (req.session.user){
      return next()   
    }
    else {
        res.redirect('/')
    }
}

module.exports = isSignedIn;