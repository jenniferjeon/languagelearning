videoElement.onloadedmetadata = function () {
	videoElement.textTracks[0].mode = "hidden";
	const captionContainer = document.querySelector('.caption-container')
	const captionLineTemplate = document.querySelector('.caption.template')
	console.log(captionLineTemplate)
	// const userID = location.hash.split("#")[1]
	// const fire_route = course + '/' + userID;
	var userID = location.hash.split("#")[1].split("&")[0]
	var condition = location.hash.split("#")[1].split("&")[1]
	const fire_route = userID + '/course' + condition;
	firebase.database().ref(fire_route + '/caption').once('value').then(function (snapshot) {

		if (snapshot.val() != null) {
			console.log("database has caption")
			captionContainer.innerHTML = snapshot.val();
		} else {
			console.log('here')
			captions = videoElement.textTracks[0].cues;
			// console.log(captions)
			for (var i = 0; i < captions.length; i++) {
				let line = captions[i]

				newCaptionLine = captionLineTemplate.cloneNode(true);
				newCaptionLine.style.display = 'flex';
				newCaptionLine.classList.remove('template');
				newCaptionLine.children[1].children[0].innerHTML = line.text;
				newCaptionLine.id = line.id;
				newCaptionLine.children[0].setAttribute("startTime", line.startTime);
				newCaptionLine.children[0].setAttribute("endTime", line.endTime)
				newCaptionLine.children[1].setAttribute("startTime", line.startTime)

				captionContainer.appendChild(newCaptionLine);
			}
		}
		$('.navigator').click(function () {
			Log("caption:" + $(this).attr('startTime'))
			videoElement.currentTime = $(this).attr('startTime')
		})
	})

}
var preActiveCaptionId = -1;
const container = $('.caption-container')

videoElement.ontimeupdate = function () {
	let activeCue = videoElement.textTracks[0].activeCues;
	console.log(videoElement)
	if (activeCue.length) {
		let activeCaptionId = activeCue[0].id;
		if (preActiveCaptionId != activeCaptionId) {
			$('.caption').css('font-weight', 'normal')
			$('.caption#' + activeCaptionId).css('font-weight', 'bold');
			container.animate({
				scrollTop: $('.caption#' + activeCaptionId).offset().top - container.offset().top + container.scrollTop() - 200
			})
			preActiveCaptionId = activeCaptionId;
		}
	}
}