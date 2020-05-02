const videosFolder = 'videos/'

addListeners()

//Funcion para crear los listeners de cada imagen
function addListeners() {
	if (document.querySelector('img')) {
		document.querySelectorAll('img').forEach((image) => {
			image.addEventListener('click', (e) => {
				let videoName = e.target.getAttribute('alt').replace('.jpg', '.mp4')
				document.querySelector('#video-source').src = videosFolder + videoName
				document.querySelector('#video-player').load()
				document.querySelector('#video-player').play()
				document.querySelector('#video-player').style.display = 'flex'
				window.scrollTo(0, 0)
			})
		})
	}
}
