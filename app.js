function downloadClick()
{
	const inputUrl = new URL(document.getElementById('video-input').value);
	try
	{
		validateUrl(inputUrl);
		let youtubeId = getYoutubeIdFromUrl(inputUrl);
		if(youtubeId == null) throw("No valid Youtube ID found.")
		processApiRequest(youtubeId)
	}
	catch(e)
	{
		alert("Error: " + e)
	}
}

function processApiRequest(youtubeId)
{
	const audioQuality = getQuality(document.getElementById('quality-audio-selection').value.toLowerCase());
	const onlyAudio = wantOnlyAudio(document.getElementById('file-format-selection').value)
	let downloadId = null;
	const apiUrl = createApiUrl("/api.php", {
		q: youtubeId,
		onlyAudio: onlyAudio,
		quality: {
			audio: audioQuality
		}
	})
	document.getElementById('loading-container').style.display = "block"

	fetch(apiUrl, {method: "GET"})
	.then((response)=>{
		if (response.status === 200) return response;
		else throw('Bad response. Status: ' + response.status);
	})
	.then((response) => response.text())
	.then((data) => {
		return JSON.parse(data)
	})
	.then((obj) => {
		if(obj.error) throw(obj.errorMessage)
		else
		{
			downloadId = obj.downloadId;
			console.log(obj)
			return fetch(obj.downloadUrl)
		}
	})
	.then((res) => res.blob())
	.then((data)=>{
		var tmp = document.createElement("a")
		tmp.setAttribute("download", downloadId)
		tmp.setAttribute("href", window.URL.createObjectURL(data))
		tmp.click()
	})
	.catch((e) => {throw e})
	.finally(()=>{
		document.getElementById('loading-container').style.display = "none"
	})
}

function createApiUrl(path, options)
{
	let apiUrl = new URL(path, window.location);
	if(options.q == "") throw "Could not create API because no URL was given"
	apiUrl.searchParams.set("q", options.q)

	if(options.onlyAudio)
	{
		apiUrl.searchParams.set("onlyAudio", true)
		apiUrl.searchParams.set("audioQuality", options.quality.audio)
	}
	else
	{
		apiUrl.searchParams.set("onlyAudio", false)
	}
	return apiUrl
}

function wantOnlyAudio(value)
{
	value = value.toLowerCase()
	switch(value)
	{
		case "video":
			return false
		case "audio":
			return true
		default: 
			return false
	}
}

function getYoutubeIdFromUrl(url)
{
	if(url.hostname == "youtu.be")
	{
		let id = url.pathname.replace("/", "")
		if(id == "") return null;
		else return id;
	}
	else 
	{
		return url.searchParams.get('v')
	}
}

function validateUrl(url)
{
	if(url.hostname != "www.youtube.com" && url.hostname != "youtu.be") throw "Wrong Host. " + url.hostname
	if(url.searchParams.has("list")) throw "Playlists are currently not supported."
}

function getQuality(value)
{
	switch(value)
	{
		case "worst":
			return 10
		case "medium":
			return 5
		case "best":
			return 0
		default:
			return 0;
	}
}

function fileFormatSelectionChange()
{
	let selection = document.getElementById("file-format-selection").value
	selection = selection.toLowerCase()
	if(selection == "audio")
	{
		document.getElementById('quality-audio-selection').style.display = "block"
		document.getElementById("file-format-selection").style.borderRadius = "0px 0px 0px 0px"
	}
	else
	{
		document.getElementById('quality-audio-selection').style.display = "none"
		document.getElementById("file-format-selection").style.borderRadius = "0px 5px 5px 0px"
	}
}