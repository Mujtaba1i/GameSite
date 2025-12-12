// API =====================================================================================================================

const apiKey = process.env.RAWG_API

// Main Function ===========================================================================================================

async function getGameCover(gameName) {
  try {
    const searchGame = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(gameName)}`)
    const convertToJson = await searchGame.json()
    
    if (convertToJson.results.length > 0) {
        // if found game
      for (let i = 0; i < Math.min(3, convertToJson.results.length); i++) {
        // searched cover image in top 3 results
        const selectedResult = convertToJson.results[i]
        const coverImage = selectedResult.background_image
        
        if (coverImage) {
          return coverImage
        }
      }
    //   if not cover image was found
      throw new Error("GAME NOT FOUND")
    } 
    // if no game was found
    else throw new Error("GAME NOT FOUND")
  } 
  catch (err) {
    // if couldnt fetch
    console.error("Error fetching game cover:"+ err)
    return null
  }
}

// Exports =================================================================================================================

module.exports = getGameCover;