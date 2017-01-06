window.addEventListener('load', getServerImages);

//Para conseguir las snapshots de cada video
function getServerImages(){
	httpGet('/api/get-all-videos', (snapshots) => {
		let images = JSON.parse(snapshots);
		images.forEach((image, index) => {
			q('#snapshots').insertAdjacentHTML('afterbegin', 
				'<img src="public-uploads/'+image+'" width="300px" height="200px">');
			if(index + 1 == images.length){
				addListeners();
			}
		});
	});
};
//Funcion para crear los listeners de cada imagen
function addListeners(){
	if(q('img')){
		qAll('img').forEach((image) => {
			image.addEventListener('click', (e) => {
				let videoName = e.target.src.split('public-uploads/')[1].replace(/(\.jpg)+/, '.mp4');
				loadVideo(videoName);
			});
		});
	}
};
//Funcion para copiar el video a public uploads
function loadVideo(videoName){
	q('#contenedor-video-ads').style.display = 'flex';
	httpGet(`/api/video/${videoName}`, err => {
		if(err) q('#contenedor-video-ads').innerHTML = `<b>${err}</b>`;
	});
	if(q('#video-player source')) q('#video-player source').remove();
	q('#video-player').insertAdjacentHTML('beforeend', 
		`<source src="http://thetoptenweb.com/public-uploads/${videoName}" type="video/mp4">`);
	q('#video-player').load();
	window.scrollTo(0, 0);
};