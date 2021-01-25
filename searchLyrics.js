const puppeteer = require('puppeteer');
const GOOGLE_URL = "https://www.google.com"
const YT_URL= "https://www.youtube.com/playlist?list="

const setInterceptors = async(page) => {
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet'){
      request.abort();
    } else{
      request.continue();
    }
  });
  return true
} 
//if title is too short look at subtitle????
///genius lyrics, line where title ends with [| Genius Lyrics]
//GET GENIUS LYRICS SITE LINK FROM GOOGLE SEARCH
async function createTitleQueries(browser,playlistLink) {
  //SCREENSHOT A PRIVATE PLAYLIST
  try {
    const ytPage = await browser.newPage()
    await setInterceptors(ytPage)
    await ytPage.goto(YT_URL+playlistLink, {waitUntil:"domcontentloaded"})    ///REPLACE FOR express route
    //DO SOMETHING EXTRA????
    // await ytPage.screenshot({path: "example.png"})
    let queries = await ytPage.$$eval('span#video-title', (titles) => titles.map(t => t.innerText + " genius lyrics" ))
    ytPage.close()
    return queries 
  } catch(e) {
    return {error: e, message: "failed to retrieve song titles"}
  }
}

async function getGeniusLinks(browser, titleQueries) {
  let geniusLinks = await Promise.all(titleQueries.map(async (query,idx) => {
    try {
      const googlePage = await browser.newPage()
      await googlePage.goto(GOOGLE_URL)
      const input = await googlePage.$('input[name="q"]');
      await input.type(query) 
      await Promise.all([googlePage.waitForNavigation(), input.type(String.fromCharCode(13))])
      let link = await googlePage.$eval('div.g>div>div>a', (res) => res.innerText.includes('| Genius Lyrics') ? res.href : null)
      await googlePage.close()
      return link
    } catch(e) {
      return null
    }
  }))
  return geniusLinks.filter(l => l)
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
        return {error: e, message:'error in getAllLyrics -> links.map'}
      }
    }))
    return lyrics.flat()
  } catch(e) {
    return {error: e, message:'error in getAllLyrics'}
  }
}

function searchLyrics(playlistLink) {  
  return new Promise(async (resolve, reject) => {
      try {
          const browser = await puppeteer.launch()
          let songs = await createTitleQueries(browser, playlistLink)
          let links = await getGeniusLinks(browser, songs)
          let lyrics = await getAllLyrics(browser, links)
          browser.close()
          return resolve(lyrics)
      } catch (e) {
          return reject(e)
      }
  })
}

module.exports =  searchLyrics;