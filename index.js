let checkButton = document.getElementById('check')
//get and sanitize input value
//Disable after click or disappear with animation
//some type of loading animation
//sliding in white card with word cloud rendered?
checkButton.addEventListener('click', () => {
  fetch('http://localhost:8080/search?list=PLfe2uTiC7lz-xG0N50SVCmpJ9-MrW5VpU')
  .then(res => console.log(res))
})