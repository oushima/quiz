// Loads imports.
import { questionnaire } from './questionnaire.js'
import { requestStudent, setPlayerInformation } from '../api/find-student.js'
import { sendScore } from '../api/send-score.js'
import { loadLeaderboard } from '../api/leaderboard.js'

// Shuffle JSON questionnaire (modern Fisher-Yates shuffle algorithm).
const shuffle = array => {
    var temp1, temp2, i
    for (i = array.length - 1; i > 0; i--) {
        temp1 = Math.floor(Math.random() * (i + 1))
        temp2 = array[i]
        array[i] = array[temp1]
        array[temp1] = temp2
	}
	// Return first-class function's value.
	return array
}

// Store elements into variables for easy-access later on.
const shuffledQuestionnaire = shuffle(questionnaire)
const quizContainer = document.getElementById('questionnaire-container')
const answerButtonContainer = document.getElementById('answer-btn-container')
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn')
const nextButton = document.getElementById('next-btn')
const previousButton = document.getElementById('previous-btn')
const quizProgressElement = document.getElementById('quiz-progress')
const titleElement = document.getElementById('title')
const introductionElement = document.getElementById('introduction')
const informationElement = document.getElementById('information')
const nameContainer = document.getElementById('name-container')
const firstNameElement = document.getElementById('first-name')
const lastNameElement = document.getElementById('last-name')
const playerElement = document.getElementById('player')
const studentNumber = document.getElementById('student-number')
const bodyElement = document.body
const mediaElement = document.getElementById('media')
const score = {}
score.correct = new Map()
score.wrong = new Map()
score.answers = []
score.questions = []
var startTime, endTime, totalTime
let correctAnswers = []
let currentQuestionIndex = 0
let unansweredQuestionIndex
informationElement.innerText = `Deze quiz bestaat uit ${questionnaire.length} vragen. Je krijgt één punt voor elke correct beantwoorde vraag. Aan het einde van de quiz wordt je totale score getoond. De quiz duurt ongeveer 5 minuten en mag niet langer dan 1 uur zijn. Je moet minimaal een 6 scoren om een voldoende te halen voor deze JavaScript kennis quiz.`

// Event listeners.
stopButton.addEventListener('click', () => location.reload())
nextButton.addEventListener('click', () => 	{
	loadQuestion(shuffledQuestionnaire[currentQuestionIndex])
	loadColors()
})
startButton.addEventListener("click", () => {
	// Create a Promise, reject promise if student ID is not found and fulfill promise if student ID is found.
	const findStudent = new Promise((studentFound, studentNotFound) => {
		const studentId = document.getElementById('student-number').value.match(/^(?:s|S|[A-z]{2})[0-9]{7}$/)
		if (studentId) studentFound(studentId[0])
		else studentNotFound('Studentnummer is niet geldig.')
	})

	// Fullfill or reject pending promise.
	findStudent
	.then(studentId => requestStudent(studentId))
	.then(studentObject => setPlayerInformation(studentObject))
	.then(() => {
		// Quiz start timestamp.
		startTime = Date.now()

		// Hides the introduction text.
		introductionElement.classList.add('hide')
		informationElement.classList.add('hide')
		nameContainer.classList.add('hide')
		startButton.classList.add('hide');
		stopButton.classList.remove('hide')

		// Show the quiz container.
		quizContainer.classList.remove('hide');
		loadQuestion(shuffledQuestionnaire[currentQuestionIndex])
	})
	.catch(err => alert(err))
});

// This function will select an answer of the quiz when invoked.
const select = buttonElement => {
	unansweredQuestionIndex = currentQuestionIndex
	nextButton.classList.remove('hide')

	// Disables all buttons and gives them their correct/wrong colour.
	Array.from(answerButtonContainer.children).forEach(button => {
		button.disabled = true
		const answer = questionnaire.find(question => question.answer === button.innerText)
		if(answer) button.classList.add('correct')
		else button.classList.add('wrong')
	})

	// Sets the users answer in an array for later usage.
	score.questions.push(buttonElement.dataset.question)
	score.answers.push(buttonElement.innerText)

	// Check if the answer is correct.
	const questionObject = questionnaire.find(question => {
		return question.question === buttonElement.dataset.question 
		&& question.answer === buttonElement.innerText
	})

	// Make the button green if correct answer has been clicked.
	if (questionObject) {
		buttonElement.classList.add('correct')
		Array.from(answerButtonContainer.children).forEach(button => {
			if (!button.classList.contains('correct')) button.classList.add('wrong')
		})

		// Make the <body> background color red (for wrong answer).
		changeBackgroundColor('correct')
		if (!score.correct.has(buttonElement.dataset.question)) {
			// Send positive message and auto remove after 5 seconds if no positive messages are active.
			randomMessage(['Goed bezig, ga zo door! 🤩', 'Top! Goed gedaan! 😎', 'Lekker bezig, ga zo door! 😁'])
			score.correct.set(buttonElement.dataset.question, { question: buttonElement.dataset.question, answer: buttonElement.innerText })
		} 

		// Stop the code.
		return 
	}

	// Make the <body> background color red (for wrong answer).
	changeBackgroundColor('wrong')
	if (!score.wrong.has(buttonElement.dataset.question)) {
		randomMessage(['Fout antwoord, dat is jammer! 😥', 'Fout antwoord, blijf het proberen! 😣', 'Fout antwoord, blijft doorzetten! ☹️'])
		score.wrong.set(buttonElement.dataset.question, { question: buttonElement.dataset.question, answer: buttonElement.innerText })
	} 
}


// // Go back to the previous question.
previousButton.addEventListener('click', () => {
	// Clear questions that were loaded before the previous button press.
	clearQuestion()
	if (currentQuestionIndex !== 0) currentQuestionIndex = currentQuestionIndex - 2
	if (currentQuestionIndex === 0) previousButton.classList.add('hide')

	// Sets the previous questions.
	loadQuestion(shuffledQuestionnaire[currentQuestionIndex])
	nextButton.classList.remove('hide')

	// Adds color to the previously loaded questions.
	loadColors(true)

	Array.from(answerButtonContainer.children).forEach(childElement => {
		childElement.disabled = true
	
		let state = questionnaire.filter(questionObj => {
			if (questionObj.question === childElement.dataset.question) {
				if (questionObj.answer === childElement.innerText) return true
			}
		})

		if (state.length) {
			childElement.classList.add('correct')
			bodyElement.classList.remove('neutral')
		} else {
			childElement.classList.add('wrong')
			bodyElement.classList.remove('neutral')
		}

	})
})

// Clear the old questions.
const clearQuestion = () => {
	titleElement.innerText = ''
	quizProgressElement.innerText = ''
	while(answerButtonContainer.firstChild) {
		answerButtonContainer.removeChild(answerButtonContainer.firstChild)
	}
}

// Sets/loads the questions.
const loadQuestion = (questionObj) => {
	clearQuestion()
	changeBackgroundColor()


	playerElement.innerText = `\n${firstNameElement.value} ${lastNameElement.value} heeft momenteel ${Array.from(score.correct).length} uit de ${questionnaire.length} correct beantwoord.`

	if (currentQuestionIndex >= questionnaire.length) return quizResult()
	if (currentQuestionIndex > 0) previousButton.classList.remove('hide')
	if (currentQuestionIndex === unansweredQuestionIndex) nextButton.classList.add('hide')
	if (currentQuestionIndex > 1) previousButton.classList.remove('hide')

	quizProgressElement.innerText = `[${currentQuestionIndex + 1}/${questionnaire.length}]` 
	titleElement.innerText = `${currentQuestionIndex + 1}. ${questionObj.question}` // Current quiz question.

	questionObj.answers.forEach(answer => {
		const button = document.createElement('button')
		button.innerText = answer
		button.classList.add('btn')
		button.dataset.question = questionObj.question
		button.addEventListener('click', () => select(button))
		answerButtonContainer.appendChild(button)
	})
	if (questionObj.media) mediaElement.innerHTML = questionObj.media
	else mediaElement.innerHTML = ''
	currentQuestionIndex++ // Increment current question index.
}

// Changes the background color.
const changeBackgroundColor = className => {
	// Set no class names if no arguments have been provided.
	if(!className) return bodyElement.className = 'neutral'

	// Change background colour based on argument.
	bodyElement.className = ''
	bodyElement.classList.add(className)
}

const quizResult = () => {
	// Clear website to show empty page.
	clearQuestion()
	quizProgressElement.classList.add('hide')
	previousButton.classList.add('hide')
	stopButton.classList.add('hide')
	nextButton.classList.add('hide')
	playerElement.classList.add('hide')
	mediaElement.classList.add('hide')
	introductionElement.innerHTML = ''



	let emote
	if(correctAnswers.length <= 5) emote = '👎'
	else if(correctAnswers.length > 5 && correctAnswers.length < 7) emote = '🤷'
	else if (correctAnswers.length) emote = '👍'

	// Quiz end timestamp.
	endTime = Date.now()
	// Milliseconds converted to seconds.
	totalTime = (endTime - startTime) / 1000

	// Stop the quiz if longer than 60 minutes.
	if (totalTime > 60) {
		setTimeout(() => window.reload(), 3000)
		return alert('Je hebt te lang over deze quiz gedaan.')
	}

	titleElement.innerText = `${emote}\nJe hebt ${Array.from(score.correct).length} van de ${questionnaire.length} vragen goed beantwoord in een tijdsduur van ${totalTime.toFixed(2)} ${word} ${firstNameElement.value} ${lastNameElement.value}.`
	sendScore(studentNumber.value, Array.from(score.correct).length, totalTime)
	return loadLeaderboard()
}

const loadColors = () => {
	if (currentQuestionIndex > unansweredQuestionIndex) return

	// Adds color to the previously loaded questions.
	Array.from(answerButtonContainer.children).forEach(childElement => {
	
		let state = questionnaire.filter(questionObj => {
			if (questionObj.question === childElement.dataset.question) {
				if (questionObj.answer === childElement.innerText) return true
			}
		})

		// Adds correct/wrong colour to buttons and selected button colour.
		if (state.length) childElement.classList.add('correct')
		else childElement.classList.add('wrong')
		if (score.answers.find(answer => answer === childElement.innerText)) childElement.classList.add('selected')
		
		changeBackgroundColor('wrong')
		if (score.correct.has(childElement.dataset.question)) {
			changeBackgroundColor('correct')
		}
	})
}

// Send positive message and auto remove after 5 seconds if no positive messages are active.
let timer
const randomMessage = (messageArray) => {
	const randomMessage = shuffle(messageArray)
	introductionElement.innerText = randomMessage[0]
	introductionElement.classList.remove('hide')
	if (timer !== null) {
		clearTimeout(timer)
	}

	timer = setTimeout(() => {
		informationElement.innerText = ''
		introductionElement.classList.add('hide')
		timer = null
	  }, 2000)
}