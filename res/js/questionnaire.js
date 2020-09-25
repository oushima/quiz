export const questionnaire = [
  {
    media: '<img src="https://media.giphy.com/media/13UZisxBxkjPwI/giphy.gif">',
    question: 'In welk HTML-element plaatsen we JavaScript?',
    answers: ['<script>', '<scripting>', '<js>', '<javascript>'],
    answer: '<script>'
  },
  {
    media: '<img src="https://media.giphy.com/media/ZgBHqRyBXetos/giphy.gif">',
    question: 'Wat is de juiste JavaScript-syntaxis om de inhoud van het onderstaande HTML-element te wijzigen?',
    answers: ['document.getElementById("demo").innerHTML = "Hello World!";', 'document.getElementByName("demo").innerHTML = "Hello World!";', 'document.getElement("p").innerHTML = "Hello World!";', 'document.innerHTML("demo") = "Hello World!";'],
    answer: 'document.getElementById("demo").innerHTML = "Hello World!";'
  },
  {
    media: '<img src="https://i.imgur.com/dSxdwsJ.png" alt="Shallow Copy VS Deep Copy">',
    question: 'Wat is waar?',
    answers: ['Een deep copy is heel erg vergelijkbaar met een shallow copy', 'Een shallow copy is een ander woord voor deep copy', 'Beide antwoorden kloppen niet', 'Beide antwoorden kloppen.'],
    answer: 'Beide antwoorden kloppen niet'
  },
  {
    media: '<img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif">',
    question: "Wat is de juiste syntaxis voor het verwijzen naar een extern script genaamd 'xxx.js'?",
    answers: ['<script href="xxx.js">', '<script name="xxx.js">', '<script src="xxx.js">', '<script source="xxx.js">'],
    answer: '<script src="xxx.js">'
  },
  {
    media: '<img src="https://media.giphy.com/media/ekjmhJUGHJm7FC4Juo/giphy.gif">',
    question: "Hoe schrijf je 'Hello World' in een 'alert box'?",
    answers: ['alertBox("Hello World")', 'alert("Hello World")', 'msg("Hello World")', 'm("Hello World")'],
    answer: 'alert("Hello World")'
  },
  {
    media: false,
    question: 'Hoe creëer je een functie in JavaScript?',
    answers: ['function myFuncion()', 'function:myFunction()', 'function = myFunction()', 'func myFunction()'],
    answer: 'function myFuncion()'
  },
  {
    media: false,
    question: "Hoe roep je een functie aan met de naam 'myFunction'?",
    answers: ['myFuncion()', 'call function myFunction()', 'call myFunction()', 'myFunction() call'],
    answer: 'myFuncion()'
  },
  {
    media: false,
    question: "Hoe schrijf je een 'if-statement' in JavaScript?",
    answers: ['if i = 5 then', 'if (i == 5)', 'if i = 5', 'if i == 5 then'],
    answer: 'if (i == 5)'
  },
  {
    media: false,
    question: "Hoe schrijf je een 'if-statement' voor het uitvoeren van een stuk code als 'i' NIET gelijk is aan 5?",
    answers: ['if (i <> 5)', 'if i =! then', 'if (i !=5)', 'if i <> 5'],
    answer: 'if (i !=5)'
  },
  {
    media: false,
    question: "Wat is de juiste syntaxis voor een 'while-loop'?",
    answers: ['while (i <= 10; i++)', 'while (i <= 10)', 'while i = 1 to 10', 'while i 1 to 10'],
    answer: 'while (i <= 10)'
  }
]
