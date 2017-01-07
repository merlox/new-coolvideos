function httpGet(url, cb){
	//If no callback is provided in the function calling, ignore the callback
	if(cb == undefined){
		cb = () => {};	
	}
	let request = new XMLHttpRequest();
	request.open('GET', url);
	request.setRequestHeader('Access-Control-Allow-Origin', '*');
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send();
};
function httpPost(url, data, cb){
	if(cb == undefined){
		cb = () => {};	
	}
	let dataJson = {
		'data': data
	};
	let request = new XMLHttpRequest();
	request.open('POST', url);
	request.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
	request.setRequestHeader('Access-Control-Allow-Origin', '*');
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send(JSON.stringify(dataJson));	
};
//Acortador para seleccionar a los elementos de manera sencilla y rápida en el código
function q(selector){
	return document.querySelector(selector);
};
function qAll(selector){
	return document.querySelectorAll(selector);
};