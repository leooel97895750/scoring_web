function formatSecond(secs) {
	let hr = Math.floor(secs / 3600);
	let min = Math.floor((secs - (hr * 3600)) / 60);
	let sec = parseInt( secs - (hr * 3600) - (min * 60));
	while (min.length < 2) { min = '0' + min; }
	while (sec.length < 2) { sec = '0' + min; }
	if (hr) hr += ':';
	return hr + min + ':' + sec;
}

export default formatSecond