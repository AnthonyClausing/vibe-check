const puppeteer = require('puppeteer')

const ytUrl= "https://www.youtube.com/playlist?list=PLfe2uTiC7lz8Ila4p2hVF-XQ364KmUy5A"
const googleUrl = "https://www.google.com"

//if title is too short look at subtitle????
///genius lyrics, line where title ends with [| Genius Lyrics]
//GET GENIUS LYRICS SITE LINK FROM GOOGLE SEARCH
async function getSongTitles(browser) {
  try {
    const ytPage = await browser.newPage()
    await ytPage.goto(ytUrl, {waitUntil:"domcontentloaded"})    
    //DO SOMETHING EXTRA????
    let titles = await ytPage.$$eval('span#video-title', (titles) => titles.map(t => t.innerText + " genius lyrics" ))
    ytPage.close()
    return titles 
  } catch(e) {
    throw e
  }
}

async function getGeniusLinks(browser, songs) {
  try {
    let geniusLinks = await Promise.all(songs.map(async (song) => {
      try {
        const googlePage = await browser.newPage()
        await googlePage.goto(googleUrl)
        await googlePage.type('input[name="q"]', song)
        await Promise.all([ googlePage.waitForNavigation(), googlePage.type('input[name="q"]', String.fromCharCode(13))])
        //if the first link isn't to any lyrics, drop it
        let link = await googlePage.$eval('div.g>div>div>a', (res) => res.innerText.includes('| Genius Lyrics') ? res.href : null)
        await googlePage.close()
        return link
      } catch(e) {
        throw {error: e, message:'error in map'}
      }
    }))
    //return array of non-null elements
    return geniusLinks.filter(l => l)
  }catch(e) {
    throw e
  }
}

async function getAllLyrics(browser,links){
  try {
    let lyrics = await Promise.all(links.map(async (link) => {
      try {
        const geniusPage = await browser.newPage()
        await geniusPage.goto(link)
        await geniusPage.waitForSelector('.song_body-lyrics')
        let words = await geniusPage.$eval('lyrics',(section) => {
          //matches section info [Verse 3: Singer] i.e anything between '[' and ']' and newlines -X- not working on innerText atm
          // const lyricRegex = new RegExp('(^\[[;\s\w\"\=\,\:\./\~\{\}\?\!\-\%\&\#\$\^\(\)]*?\])|\n','g') 
          // (n') at end of word replace with 'ng' or any word cleanup api?
          let lines = section.innerText.split('\n').filter(str => str && str[0] !== '[').join(' ').split(' ') 
          return lines
        })
        await geniusPage.close()
        return words
      } catch(e) {
        throw e
      }
    }))
    return lyrics.flat()
  } catch(e) {
    throw e
  }

}

function run() {
  return new Promise(async (resolve, reject) => {
      try {
          const browser = await puppeteer.launch()
          console.log('Browser Launched')
          console.log('...getting song titles')
          let songs = await getSongTitles(browser)
          console.log('...getting genius links')
          let links = await getGeniusLinks(browser, songs)
          console.log('...getting lyrics')
          let lyrics = await getAllLyrics(browser, links)
          browser.close()
          console.log('Browser Closed')
          return resolve(lyrics)
      } catch (e) {
          return reject(e)
      }
  })
}
run().then(console.log).catch(console.error)