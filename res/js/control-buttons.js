// Loads imports.
import { questionnaire } from './questionnaire.js'
import { requestStudent, setPlayerInformation } from '../api/find-student.js'
import { sendScore } from '../api/send-score.js'
import { loadLeaderboard } from '../api/leaderboard.js'
import { twitterShareButton } from '../api/share-twitter.js'

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
const startButton = document.getElementById('start-btn')
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
const correctAnswers = []
let currentQuestionIndex = 0
let unansweredQuestionIndex
informationElement.innerHTML = `Deze quiz bestaat uit ${questionnaire.length} vragen. Je krijgt één punt voor elke correct beantwoorde vraag. Aan het einde van de quiz wordt je totale score getoond. De quiz duurt ongeveer 5 minuten en mag niet langer dan 1 uur zijn. Je moet minimaal een 6 scoren om een voldoende te halen voor deze JavaScript kennis quiz. Klik <a href="#" id="wireframes">hier</a> om de wireframes van deze quiz te bekijken. Klik <a href="#" id="testscript">hier</a> om de testscript van deze quiz te bekijken.`

// Event listeners.
stopButton.addEventListener('click', () => location.reload())
nextButton.addEventListener('click', () => {
  loadQuestion(shuffledQuestionnaire[currentQuestionIndex])
  loadColors()
})
startButton.addEventListener('click', () => {
  // Create a Promise, reject promise if student ID is not found and fulfill promise if student ID is found.
  const findStudent = new Promise((resolve, reject) => {
    const studentId = document.getElementById('student-number').value.match(/^(?:s|S|[A-z]{2})[0-9]{7}$/)
    if (studentId) resolve(studentId[0])
    else reject(new Error('Studentnummer is niet geldig.'))
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
      startButton.classList.add('hide')
      stopButton.classList.remove('hide')

      // Show the quiz container.
      quizContainer.classList.remove('hide')
      loadQuestion(shuffledQuestionnaire[currentQuestionIndex])
    })
    .catch(err => alert(err))
})

// This function will select an answer of the quiz when invoked.
const select = buttonElement => {
  unansweredQuestionIndex = currentQuestionIndex
  nextButton.classList.remove('hide')

  // Disables all buttons and gives them their correct/wrong colour.
  Array.from(answerButtonContainer.children).forEach(button => {
    button.disabled = true
    const answer = questionnaire.find(question => question.answer === button.innerText)
    if (answer) button.classList.add('correct')
    else button.classList.add('wrong')
  })

  // Sets the users answer in an array for later usage.
  score.questions.push(buttonElement.dataset.question)
  score.answers.push(buttonElement.innerText)

  // Check if the answer is correct.
  const questionObject = questionnaire.find(question => {
    return question.question === buttonElement.dataset.question && question.answer === buttonElement.innerText
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

    const state = questionnaire.filter(questionObj => {
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
  while (answerButtonContainer.firstChild) {
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
  if (!className) {
    bodyElement.className = 'neutral'
    return
  }

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
  if (correctAnswers.length <= 5) emote = '👎'
  else if (correctAnswers.length > 5 && correctAnswers.length < 7) emote = '🤷'
  else if (correctAnswers.length) emote = '👍'

  // Quiz end timestamp.
  endTime = Date.now()
  // Milliseconds converted to seconds.
  totalTime = (endTime - startTime) / 1000

  // Stop the quiz if longer than 60 minutes.
  if (totalTime > 3600) {
    setTimeout(() => window.reload(), 3000)
    return alert('Je hebt te lang over deze quiz gedaan.')
  }

  // Rounds number up to the highest integer.
  totalTime = Math.ceil(totalTime)

  titleElement.innerText = `${emote}\nJe hebt ${Array.from(score.correct).length} van de ${questionnaire.length} vragen goed beantwoord in een tijdsduur van ${totalTime} secondes ${firstNameElement.value} ${lastNameElement.value}.`
  sendScore(studentNumber.value, Array.from(score.correct).length, totalTime)

  // Load leaderboard and share button.
  loadLeaderboard()
  twitterShareButton(Array.from(score.correct).length, questionnaire.length, totalTime)
}

const loadColors = () => {
  if (currentQuestionIndex > unansweredQuestionIndex) return

  // Adds color to the previously loaded questions.
  Array.from(answerButtonContainer.children).forEach(childElement => {
    const state = questionnaire.filter(questionObj => {
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

document.getElementById('wireframes').addEventListener('click', () => loadWireframes())
const loadWireframes = () => {
  // Path naar wireframes.
  const path = './documentation/wireframes/'
  const folderNames = {
    desktop: {
      name: 'desktop/tablet',
      folderName: 'desktop',
      items: 6,
      extension: '.png'
    },
    mobile: {
      name: 'mobile',
      folderName: 'mobile',
      items: 6,
      extension: '.png'
    }
  }

  document.body.innerHTML = loadPath(path, folderNames.desktop)
  document.body.innerHTML += loadPath(path, folderNames.mobile)
}

const loadPath = (path, objProperty) => {
// Loop door te folder items HTMLMenuElement.
  document.body.style.display = 'inline'
  let html = `<div class="wireframe-images"><h1>${objProperty.name}</h1>`
  for (let i = 1; i <= objProperty.items; i++) {
    // console.log(`${path}${objProperty.folderName}/(${i})${objProperty.extension}`)
    html += `<a href="${path}${objProperty.folderName}/(${i})${objProperty.extension}"><img class="frames" src="${path}${objProperty.folderName}/(${i})${objProperty.extension}" alt="${objProperty.folderName}_wireframe_${i}"></a>`
  }
  html += '</div>'
  return html
}

// Show documentation.
const testscript = [
  { component: 'Start-pagina', purpose: 'Op de startpagina krijg je een korte introductie en documentatie te zien over de applicatie. Na het lezen van de introductie en documentatie moet het logisch en helder zijn wat de applicatie moet voorstellen voor de gebruiker wat hij/zij kan verwachten en hoe de quiz werkt en ontworpen is.' },
  { component: 'Wireframes', purpose: 'De wireframes tonen het ontwerp van de applicatie voor dat deze ontworpen was. De wireframes geven de ontwikkelaar en de opdrachtgever een duidelijk beeld van wat er verwacht kan worden en hoe de applicatie er ongeveer uit zal komen te zien. Met de wireframes wordt ook duidelijk gemaakt of de ontwikkelaar en de opdrachtgever het zelfde beeld hebben zodat dit achteraf niet veranderd hoeft te worden.' },
  { component: 'Foutmeldingen', purpose: 'Foutmeldingen krijg je niet standaard ergens op de website te zien. Deze kan je zelf dus niet opzoeken. Je krijgt een foutmelding te zien als er een fout optreed, door bijvoorbeeld een fout in de applicatie of als de gebruiker niet de juiste invoer doorgeeft bij bijvoorbeeld een tekstvak. Foutmeldingen worden standaard altijd in de browser getoond als een melding in het scherm in de form van een schermpje wat je daarna met een kruisje kan wegklikken, een \'browser alert box\'. Als er een foutmelding getoond wordt in het beeldscherm, weet de eindgebruiker na het lezen altijd waar het mis ging.' },
  { component: 'Start-knop', purpose: 'Als de gebruiker een studentnummer heeft opgegeven, zal de quiz beginnen. De gebruiker kan dan de eerste vraag van de quiz verwachten in het beeldscherm.' },
  { component: 'Quiz', purpose: 'Zodra de quiz begint wordt deze eerst geshuffeld zodat de vragen in een andere volgorde komen te staan. Een quiz vraag bestaat uit een vraag-titel en minimaal en maximaal 4 mogelijke antwoorden. De gebruiker kan maar één juist antwoord opgeven en kan een rood scherm verwachten als er een fout antwoord is opgegeven en een groen scherm verwachten als er een goed antwoord is opgegeven. De kleuren van de knoppen veranderen naar de kleur rood als dat het foute antwoord was, groen als dat he juiste antwoord was en het geselecteerde antwoord krijgt een blauw randje er omheen. Aan de onderkant van de pagina staat de naam van de gebruiker die de quiz maakt en welke vraag momenteel behandeld wordt. De gebruiker kan ook zien hoeveel vragen hij gedurend de quiz fout of juist heeft beantwoord.' },
  { component: 'Stop-knop', purpose: 'De stop knop kan op elk moment gedurend de quiz gebruikt worden. De stop knop beëindigd de gehele quiz zonder het opslaan van het huidige resultaat. De stop knop kan gezien worden als een reset knop.' },
  { component: 'Multimedia', purpose: 'De gebruiker kan gedurend de quiz multimedia verwachten. Multimedia in de vorm van: afbeeldingen, GIFs, video\'s en andere visuele beelden. De multimedia hoeft niet per se bij de quiz te horen. Kijk dus altijd naar de vraag en de mogelijke antwoorden en niet naar de visuele beelden bij het beslissen van een antwoord.' },
  { component: 'Volgende-knop', purpose: 'De gebruiker kan na het klikken op een antwoord op volgende drukken, de gebruiker wordt dan naar de volgende vraag gebracht van de quiz.' },
  { component: 'Vorige-knop', purpose: 'De gebruiker kan na het klikken op een antwoord op vorige drukken, de gebruiker wordt dan naar de vorige vraag gebracht van de quiz. Zodra de knop is gedrukt krijgt de gebruiker ook te zien welk antwoord hij had geselecteerd doormiddel van een blauw-randje en blauwe-tekst die iets groter is dan de andere vragen. De gebruiker krijgt ook te zien of het antwoord goed of fout was.' },
  { component: 'Feedback', purpose: 'Zodra de gebruiker een vraag beantwoord, krijgt de gebruiker feedback. De feedback laat de gebruiker realiseren of een antwoord goed is ingevuld of niet. Als er een goed antwoord is opgegeven krijgt de gebruiker positieve feedback te zien en als de gebruiker een fout antwoord opgeeft krijgt de gebruiker motiverende tekst te zien zodat hij blijft doorzetten. Deze melding verwijnd automatisch. Hoe snel deze melding verdwijnt is afhankelijk van hoe snel de gebruiker de vragen beantwoord en toekomstige aanpassingen aan de applicatie.' },
  { component: 'Eind-pagina', purpose: 'De gebruiker krijgt direct de uitslag van de quiz te zien en hoe lang er besteed is aan het geven van de antwoorden. Als de quiz te veel fout beantwoorde vragen heeft krijgt de gebruiker dat te zien. Als de gebruiker genoeg vragen goed heeft beantwoord krijgt heeft beantwoord wordt dat ook getoond op het scherm.' },
  { component: 'Social-media', purpose: 'De gebruiker kan na het invullen de score delen via social-media. Zodra de gebruiker de score deelt wordt er automatisch tekst ingevuld waar in de score en tijdsduur wordt vermeld. Er wordt geen persoonlijke info ingevuld.' },
  { component: 'Leaderboard', purpose: 'De gebruiker krijgt een leaderboard te zien waar de top-10 beste scores staan vermeld en de daarbij vermelde info zoals de datum, tijd, naam, studentnummer etc. Na het invullen van de quiz krijgt de gebruiker direct te zien of hij tussen die top-10 staat of dat hij er niet op staat. Dit kan gecontroleerd worden door naar het leaderboard te kijken. Alle scores op de leaderboard zijn real-time (live) data.' }
]

document.getElementById('testscript').addEventListener('click', () => {
  let html = '<div class="table-container"><table id="testscript" class="testscript"> <tr> <th>Onderdeel</th> <th>Omschrijving</th> </tr><caption id="caption" class="caption">Testscript</caption>'
  /* eslint-disable no-tabs */
  testscript.forEach(component => {
    html += `<tr>
  			<td>${component.component}</td>
  			<td>${component.purpose}</td> 
		</tr>`
  })
  html += '</table></div>'
  document.body.innerHTML = html
})
