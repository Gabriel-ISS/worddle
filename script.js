class Validator {
  constructor(word) {
    this.word = word
  }

  minChar(number) {
    if (this.word.length < number) {
      throw new Error('La palabra debe tener al menos 5 letras')
    }
  }

  maxChar(number) {
    if (this.word.length > number) {
      throw new Error('La palabra debe tener como máximo 5 letras')
    }
  }

  onlyChars() {
    if (this.word.match(/^[A-Za-z]+$/) === null) {
      throw new Error('Solo se permiten letras')
    }
  }
}


// Documentación de la API https://random-word-api.herokuapp.com/home
const apiEndpoint = 'https://random-word-api.herokuapp.com/word?lang=es&length=5'
let remainingAttempts = 6
// PALABRA POR DEFECTO => ver función init
let word = 'APPLE';

const BUTTON = document.getElementById("guess-button");
const INPUT = document.getElementById("guess-input");
const GRID = document.getElementById("grid");
const MODAL = document.getElementById("modal")
const MODAL_CONTENT = document.getElementById("modal-content")
const ERROR = document.getElementById("error")
const REMAINING_ATTEMPTS = document.getElementById("remaining-attempts")
const RESTART_BUTTON = document.getElementById("restart-button")


window.addEventListener('load', init)
BUTTON.addEventListener('click', () => {
  try {
    tryToGuest()
  } catch (error) {
    ERROR.innerText = error.message
  }
})
INPUT.addEventListener('keydown', e => {
  ERROR.innerText = ''
  const validator = new Validator(e.target.value)
  try {
    if (e.key !== 'Backspace') {
      if (e.key === 'Enter') {
        validator.maxChar(5)
      } else {
        validator.maxChar(4)
      }
    }
    if (e.key == 'Enter') {
      // sin esto el modal se cerrara automáticamente
      e.preventDefault()
      tryToGuest()
    }
  } catch (error) {
    e.preventDefault()
    ERROR.innerText = error.message
  }
})
RESTART_BUTTON.addEventListener('click', () => {
  restartGame().then(() => {
    MODAL.close()
  })
})

async function init() {
  word = await getWord()
}

async function getWord() {
  const word = await fetch(apiEndpoint)
    .then(res => res.json())
    .then(data => data[0])
  return word.toUpperCase()
}

function tryToGuest() {
  const attempt = readAttempt();
  const validator = new Validator(attempt)
  validator.minChar(5)
  validator.onlyChars()
  if (attempt === word) {
    endGame("<h2>GANASTE!😀</h2>", 'success')
    return;
  }
  insertRow(attempt)
  INPUT.value = ''
  REMAINING_ATTEMPTS.innerText = --remainingAttempts
  if (remainingAttempts <= 0) {
    endGame(`
      <h2>PERDISTE!😖</h2>
      <p>La palabra era ${word}</p>
    `, 'fail')
  }
}

function readAttempt() {
  return INPUT.value.toUpperCase();
}

function insertRow(attempt) {
  const ROW = document.createElement('div');
  ROW.className = 'row';
  for (let i in word) {
    const SPAN = document.createElement('span');
    SPAN.className = 'letter';
    if (attempt[i] === word[i]) {
      SPAN.innerHTML = attempt[i];
      SPAN.style.backgroundColor = 'var(--success-color)';
    } else if (word.includes(attempt[i])) {
      SPAN.innerHTML = attempt[i];
      SPAN.style.backgroundColor = 'var(--fail-color)';
    } else {
      SPAN.innerHTML = attempt[i];
      SPAN.style.backgroundColor = 'var(--neutral-color)';
    }
    ROW.appendChild(SPAN)
  }
  GRID.insertBefore(ROW, GRID.firstChild)
}

function endGame(message, type) {
  INPUT.disabled = true;
  BUTTON.disabled = true;
  showModal(message, type)
}

async function restartGame() {
  RESTART_BUTTON.innerText = 'Reiniciando...'
  word = await getWord()
  remainingAttempts = 6
  REMAINING_ATTEMPTS.innerText = remainingAttempts
  GRID.innerHTML = ''
  INPUT.value = ''
  INPUT.disabled = false;
  BUTTON.disabled = false;
  RESTART_BUTTON.innerText = '🔄️ Reiniciar'
}

function showModal(message, type) {
  MODAL.className = type
  MODAL.showModal()
  MODAL_CONTENT.innerHTML = message
}

