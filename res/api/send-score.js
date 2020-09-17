export function sendScore (studentId, correctAnswers) {
	const titleElement = document.getElementById('title')

	const errorMsg = '\nScore niet succesvol opgeslagen in de database.'
	console.log('student ID:', studentId)
	console.log('Correct answers: ', correctAnswers)
	var xHttp = new XMLHttpRequest();
	xHttp.onreadystatechange = function () { 
		if (xHttp.readyState == XMLHttpRequest.DONE) { 
			if (xHttp.status == 200) return titleElement.innerText += "\nScore succesvol opgeslagen in de database."

			// If request failed...
			titleElement.innerText += errorMsg
			throw new Error()
		} 
	}

	xHttp.onerror = function () { 
		titleElement.innerText += errorMsg
		throw new Error()
	}

	const quizMasterStudentId = 's1162762'
	xHttp.open("POST", "https://quiz.clow.nl/v1/score", true)
	xHttp.setRequestHeader('Content-Type', 'application/json')
	xHttp.send(JSON.stringify({
		quizMaster: quizMasterStudentId, 
		student: studentId, 
		points: correctAnswers 
	}))
}