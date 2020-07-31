const noteControlContainer = document.getElementById('note-controls')
const noteControls = $('.note-controls').find('*');
const noteMarkerBar = document.querySelector(".note-marker");
const noteMarkerNote = document.querySelector(".template.note-marker-fill.note");
const noteMarkerHighlight = document.querySelector(".template.note-marker-fill.highlight");
const noteMarkerQuestion = document.querySelector(".template.note-marker-fill.question")

var userID = location.hash.split("#")[1].split("&")[0]
var condition = location.hash.split("#")[1].split("&")[1]
const fire_route = userID + '/course' + condition;

var noted = false;

$(document).ready(function () {
	// document.oncontextmenu = function() {return false;};
	firebase.database().ref(fire_route + '/question').once("value").then(function (snapshot) {
		snapshot.forEach(function (childSnapshot) {
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			addTimelineMarker(childData["_Time"], 'question', key)
			noted = true;
		})
	})
	firebase.database().ref(fire_route + '/notes').once("value").then(function (snapshot) {
		snapshot.forEach(function (childSnapshot) {
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			addTimelineMarker(childData["_Time"], 'notes', key)
			noted = true;
		})
	})
	firebase.database().ref(fire_route + '/highlight').once("value").then(function (snapshot) {
		snapshot.forEach(function (childSnapshot) {
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			addTimelineMarker(childData["_Time"], 'highlight', key)
			noted = true;
		})
	})
})
document.onselectstart = function () {
	//   console.log("Selection started!");
}

document.onmouseup = function (e) {
	//   console.log("Selection end!");
	var selection = '';
	if (window.getSelection) {
		selection = window.getSelection();
	} else if (document.getSelection) {
		selection = document.getSelection();
	} else if (window.document.selection) {
		selection = window.document.selection.createRange().text;
	}
	if (selection != '' && (selection.anchorNode.parentElement.classList.contains('text') ||
			selection.anchorNode.parentElement.className == 'highlight-question' ||
			selection.anchorNode.parentElement.className == 'highlight-notes' ||
			selection.anchorNode.parentElement.className == 'highlight-text')) {
		$('.note-controls').css({
			top: e.clientY + 10,
			left: e.clientX - 90,
			display: 'block'
		});
		getRange();
	}
}

function getRange() {
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.rangeCount) {
			range = sel.getRangeAt(0);
		}
	} else if (document.selection && document.selection.createRange) {
		range = document.selection.createRange();
	}
}

function highlightSelectText(type, key) {
	var sel;
	var allRanges = []


	startContainer = range.startContainer;
	endContainer = range.endContainer;

	if (startContainer == endContainer) {
		// console.log(startContainer.parentElement)
		var time = startContainer.parentElement.parentElement.getAttribute('starttime')
		highLightRange(range, type, key)
		return parseFloat(time)
	} else {
		rangeAncestor = range.commonAncestorContainer;
		nodeIterator = document.createNodeIterator(rangeAncestor, NodeFilter.SHOW_TEXT,
			function (node) {
				return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			}
		);
		var pars = [];

		var firstNode = nodeIterator.nextNode(); //I need to get the video starttime of first node
		var time = firstNode.parentElement.parentElement.getAttribute('starttime')
		pars.push(firstNode);
		while (currentNode = nodeIterator.nextNode()) {
			pars.push(currentNode);
		}

		var r = document.createRange();
		r.setStart(pars[0], range.startOffset);
		r.setEnd(pars[0], pars[0].length);
		highLightRange(r, type, key, time);

		if (pars.length > 2) {
			for (var i = 1; i < pars.length - 1; i++) {
				r.setStart(pars[i], 0);
				r.setEnd(pars[i], pars[i].length);
				highLightRange(r, type, key, time);
			}
		}
		r.setStart(pars[pars.length - 1], 0);
		r.setEnd(pars[pars.length - 1], range.endOffset);
		highLightRange(r, type, key, time);

		return parseFloat(time)
	}

}

function highLightRange(range, type, key) {
	selectedText = range.toString();
	var newnode = document.createElement("div");
	newnode.setAttribute("key", key);
	newnode.textContent = selectedText;
	switch (type) {
		case 'highlight':
			newnode.classList.add('highlight-text')
			break;
		case 'notes':
			newnode.classList.add('highlight-notes');
			break;
		case 'question':
			newnode.classList.add('highlight-question');
			break;
	}

	range.deleteContents();
	range.insertNode(newnode);
	window.getSelection().removeAllRanges();
}

function clearFormInput() {
	// $('#form-notes-concept').val("");
	$('#form-notes-content').val("");
	// $('#form-question-concept').val("");
	$('#form-question-content').val("");
}

function addTimelineMarker(startTime, type, key) {
	//Highlight video progress bar
	var newNoteMarker;
	switch (type) {
		case 'highlight':
			newNoteMarker = noteMarkerHighlight.cloneNode(false);
			break;
		case 'notes':
			newNoteMarker = noteMarkerNote.cloneNode(false);
			break;
		case 'question':
			newNoteMarker = noteMarkerQuestion.cloneNode(false);
			break;
	}

	let left = (100 / videoElement.duration) * (startTime);
	let width = (100 / videoElement.duration) * 8;

	// Update the marker value
	newNoteMarker.classList.remove("template")
	newNoteMarker.style.width = width + "%";
	newNoteMarker.style.left = left + "%";
	if (startTime != null)
		newNoteMarker.setAttribute("time", startTime.toString());
	else
		newNoteMarker.setAttribute("time", 0);
	newNoteMarker.setAttribute("key", key)
	noteMarkerBar.appendChild(newNoteMarker);
}

$(".btn-note").click(function () {
	pauseVideo();
	$('#note-modal').modal('show')
	Log("notes:start-notes");
});
$(".btn-note-save").click(function () { //Save Notes
	//get note content and save to database
	// var noteConcept = document.getElementById("form-notes-concept").value;
	var noteContent = document.getElementById("form-notes-content").value;
	if (noteContent != "") {
		var key = firebase.database().ref(fire_route + '/notes').push({
			// "concepts": noteConcept,
			"_Content": noteContent
		}).key

		//Highlight transcript
		var startTime = highlightSelectText('notes', key);
		//save time
		firebase.database().ref(fire_route + '/notes/' + key + '/_Time').set(startTime)
		//save caption
		var caption = $("div[key='" + key + "']").text().replace(/[\t\n]+/g, ' ');
		firebase.database().ref(fire_route + '/notes/' + key + '/_Caption').set(caption)
		//Highlight video progress bar
		addTimelineMarker(startTime, 'notes', key)

		//save new highlighted caption to database
		const captionContainer = document.querySelector('.caption-container')
		firebase.database().ref(fire_route + '/caption').set(captionContainer.innerHTML);
	}
	$(".note-controls").css({
		display: 'none'
	})
	playVideo();

	clearFormInput();
	Log("notes:new-notes#" + key + '#' + startTime);
	noted = true;
});
$(".btn-question").click(function () {
	pauseVideo();
	$('#question-modal').modal('show')
	Log("notes:start-question");
});
$(".btn-question-save").click(function () { //Save Question
	//get question content and save to database
	// var questionConcept = document.getElementById("form-question-concept").value;
	var questionContent = document.getElementById("form-question-content").value;
	if (questionContent != "") {

		var key = firebase.database().ref(fire_route + '/question').push({
			// "concepts":questionConcept,
			"_Content": questionContent
		}).key
		console.log("push new question, key = ", key)
		//Highlight transcript
		var startTime = highlightSelectText('question', key);
		//save time
		firebase.database().ref(fire_route + '/question/' + key + '/_Time').set(startTime)
		//save caption
		var caption = $("div[key='" + key + "']").text().replace(/[\t\n]+/g, ' ');

		firebase.database().ref(fire_route + '/question/' + key + '/_Caption').set(caption)
		//Highlight video progress bar
		addTimelineMarker(startTime, 'question', key)

		//save new highlighted caption to database
		const captionContainer = document.querySelector('.caption-container')
		firebase.database().ref(fire_route + '/caption').set(captionContainer.innerHTML);
	}

	$(".note-controls").css({
		display: 'none'
	})
	playVideo();

	clearFormInput();
	Log("notes:new-question#" + key + '#' + startTime);
	noted = true;
})

$(".btn-highlight").click(function () {
	//Highlight transcript
	var key = firebase.database().ref(fire_route + '/highlight').push().key;
	var startTime = highlightSelectText('highlight', key);
	var caption = $("div[key='" + key + "']").text().replace(/[\t\n]+/g, ' ');
	firebase.database().ref(fire_route + '/highlight/' + key).set({
		_Time: startTime,
		_Caption: caption
	})
	//save new highlighted caption to database
	const captionContainer = document.querySelector('.caption-container')
	firebase.database().ref(fire_route + '/caption').set(captionContainer.innerHTML);

	//Highlight video progress bar
	addTimelineMarker(startTime, 'highlight', key)

	$(".note-controls").css({
		display: 'none'
	})
	Log("notes:new-highlight#" + key + '#' + startTime);
	noted = true;
})
$(document).mousedown(function (e) {
	var flag = false;
	for (var i = noteControls.length - 1; i >= 0; i--) {
		if (e.target === noteControls[i]) {
			flag = true;
			break;
		}
	}
	if (!flag && noteControlContainer.style.display !== 'none') {
		$('.note-controls').css({
			display: 'none'
		})
	}
})

$("div:not(.caption-container, .note-box)").mouseenter(function () {
	$(".note-box").hide()
})
$(".caption-container").on("mouseover", ".highlight-question:parent", function (event) {
	NoteBoxType = "question"
	NoteBoxKey = $(this).attr("key")
	y = $(this).offset().top - 10
	x = $(this).offset().left - 200;
	firebase.database().ref(fire_route + '/question/' + $(this).attr("key")).once("value").then(function (snapshot) {
		// concepts = snapshot.val().concepts
		content = snapshot.val().content
		$(".note-box").css("top", y).css("left", x).css("border-color", 'rgba(255, 27, 61, 0.3)').attr("name", NoteBoxType).attr("key", NoteBoxKey).show()
		$(".note-box .txt").html(content)
		$(".note-box .edit-save").show()
	})
	Log("notes:mouseover-question#" + NoteBoxKey);
})
$(".caption-container").on("mouseover", ".highlight-notes:parent", function (event) {
	NoteBoxType = 'notes';
	NoteBoxKey = $(this).attr("key");
	y = $(this).offset().top - 10
	x = $(this).offset().left - 200;
	firebase.database().ref(fire_route + '/notes/' + $(this).attr("key")).once("value").then(function (snapshot) {
		// concepts = snapshot.val().concepts
		content = snapshot.val().content

		$(".note-box").css("top", y).css("left", x).css("border-color", 'rgba(251 ,148,19,0.3)').attr("name", NoteBoxType).attr("key", NoteBoxKey).show()
		$(".note-box .txt").html(content)
		$(".note-box .edit-save").show()
	})
	Log("notes:mouseover-notes#" + NoteBoxKey);
})
$(".caption-container").on("mouseover", ".highlight-text:parent", function (event) {
	NoteBoxType = 'highlight';
	NoteBoxKey = $(this).attr("key");
	y = $(this).offset().top - 10
	x = $(this).offset().left - 200;
	$(".note-box").css("top", y).css("left", x).css("border-color", 'rgba(226, 209, 9, 0.3)').attr("name", NoteBoxType).attr("key", NoteBoxKey).show()
	$(".note-box .txt").html("")
	$(".note-box .edit-save").hide();

	Log("notes:mouseover-highlight#" + NoteBoxKey);
})
$(".caption-container").on("mouseleave", ".highlight-notes, .highlight-question", function (e) {
	var NoteBox = document.getElementsByClassName('note-box')[0]
	if (e.toElement != NoteBox) {
		$(".note-box").hide()
	}

	Log("notes:mouseleave#" + NoteBoxKey);
})

$(".note-box").mouseleave(function () {
	$(this).hide();
})
$(".note-box .edit-save").click(function () { //Edit Notes, Edit Question
	//click edit
	if ($(this).attr('name') == 'edit') {
		$(".note-box .txt").hide();
		$(".note-box input").val($(".note-box .txt").html()).show()
		$(this).html("Save").attr('name', 'save')

		Log("notes:edit#" + NoteBoxKey);
	} else {
		//click save
		//save edited notes to database
		firebase.database().ref(fire_route + '/' + NoteBoxType + '/' + NoteBoxKey + '/content').set(
			$(".note-box input").val()
		)
		$(".note-box .txt").html($(".note-box input").val()).show();
		$(".note-box input").hide();
		$(this).html("Edit").attr('name', 'edit')

		Log("notes:save#" + NoteBoxKey);
	}
})
$(".note-box input").keypress(function (e) {
	if (e.which == 13) {
		firebase.database().ref(fire_route + '/' + NoteBoxType + '/' + NoteBoxKey).set({
			"content": $(this).val()
		})
		$(".note-box .txt").html($(this).val()).show();
		$(this).hide();
		$(".note-box button").html("Edit").attr('name', 'edit')
	}
});
$(".note-box .delete").click(function () {
	var targetKey = $(this).parent().attr("key")
	var targetName = $(this).parent().attr("name")
	//remove data from firebase
	firebase.database().ref(fire_route + '/' + targetName + '/' + targetKey).remove();
	//remove micronote if the highlight is removed
	if (targetName == 'highlight') {
		firebase.database().ref(fire_route + '/' + 'micronote' + '/' + targetKey).remove();
	}
	//remove highlight
	$('.caption-container div[key=' + targetKey + ']').replaceWith(function () {
		return $(this).html()
	})
	//remote vedio time marker
	$('.note-marker-fill[key=' + targetKey + ']').remove()
	//store new caption
	firebase.database().ref(fire_route + '/caption').set($('.caption-container').html())

	Log("notes:delete#" + targetKey);
})
// $(".caption-container").on("mousedown", ".highlight-notes, .highlight-question, .highlight-text", function(e){
// 	if(e.button==2){

// 		return false;
// 	}
// })
$(".note-marker").on("click", ".note-marker-fill", function () {
	Log("notemarker:" + $(this).attr("time"))
	videoElement.currentTime = $(this).attr("time")
})