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
  }catch(e){
    throw e
  }
}

async function getGeniusLinks(browser, songs) {
  try {
    let geniusLinks = await Promise.all(songs.map(async (song) => {
      try{
        const googlePage = await browser.newPage()
        await googlePage.goto(googleUrl)
        await googlePage.type('input[name="q"]', song)
        await Promise.all([ googlePage.waitForNavigation(), googlePage.type('input[name="q"]', String.fromCharCode(13))])
        let link = await googlePage.$eval('div.g>div>div>a', (res) => res.innerText.includes('| Genius Lyrics') ? res.href : null)
        await googlePage.close()
        return link
      }catch(e){
        throw {error: e, message:'error in map'}
      }
    }))
    return geniusLinks
  }catch(e) {
    throw e
  }
}

async function getAllLyrics(browser,links){
  let lyrics = ''
}

function run() {
  return new Promise(async (resolve, reject) => {
      try {
          const browser = await puppeteer.launch()
          // const geniusPage = await browser.newPage()
          let songs = await getSongTitles(browser)
          let links = await getGeniusLinks(browser, songs)
          let lyrics = await getAllLyrics(browser, links)
          browser.close()
          return resolve(links)
      } catch (e) {
          return reject(e)
      }
  })
}
run().then(console.log).catch(console.error)