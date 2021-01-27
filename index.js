let checkButton = document.getElementById('check')
let input = document.getElementById('playlist-input')
//get and sanitize input value
//Disable after click or disappear with animation
//some type of loading animation
//sliding in white card with word cloud rendered?
function isValid(url){
if(!url.length) return false
let listRegex = new RegExp('list=(.*?)(?![^&])')
return url.match(listRegex) && url.match(listRegex)[1]
}
checkButton.addEventListener('click', () => {
  let playlistUrl = input.value
  console.log('url is valid?', isValid(playlistUrl))
  if(!isValid(playlistUrl)){
    input.style.border = '4px red solid'
  } else {
    input.style.border = '4px green solid'
  }
  // fetch('http://localhost:8080/search?list=PLfe2uTiC7lz-xG0N50SVCmpJ9-MrW5VpU')
  // .then(res => console.log(res))
})