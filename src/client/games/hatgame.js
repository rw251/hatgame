import { sendMessage } from '../scripts/web-sockets';
import { hideAllElements } from '../scripts/main';
import { doCountdown } from '../components/countdown';

const $startHatGame = document.getElementById('start-hatgame');
const $nextRoundHatGame = document.getElementById('pull-next-name');
const $newNameSubmit = document.getElementById('new-hat-name-submit');
const $newNameInput = document.getElementById('new-hat-name-input');
const $nameCount = document.getElementById('hat-game-name-count');
const $nameEl =document.getElementById('hatgame-name');
const $skipBtn = document.getElementById('hatgame-skip-button');
const $gotItBtn = document.getElementById('hatgame-done-button');
const $results = document.getElementById('hatgame-results');
const $resultsHeader = document.querySelector('#hatgame-results h1');
const $resultsList = document.querySelector('#hatgame-results ul');
const $goAgainBtn = document.getElementById('hatgame-start-over');
const $name = document.getElementById('hatgame-name');
const $setupEl = document.getElementById('hatgame-setup');
const $gameEl = document.getElementById('hatgame-game');
const $waitingMessage = document.getElementById('hatgame-waiting');

let timeOfRound = 25000;
let isPlayer = false;
let names = [];
let isStillPlaying = false;
let startedAt;

const getTimeRemaining = () => {
  const endedAt = new Date();
  const timeElapsed = endedAt - startedAt;
  return Math.ceil((timeOfRound - timeElapsed) / 1000);
};

const showNextName = () => {
  const next = names[Math.floor(Math.random() * names.length)];
  $nameEl.innerText = next.name;
  $nameEl.dataset.id = next.id;
}

const removeNameAndGetNext = () => {
  if(names.length === 1) {
    const secondsRemaining = getTimeRemaining();
    console.log(`TIME REMAINING: ${secondsRemaining}s`);
    isStillPlaying = false;
    isPlayer = false;
    showHatGameResults(progress);
    sendMessage({type:'endRound', game: 'hatgame', progress, isDeckEmpty: true});
  } else {
    const nameId = +$nameEl.dataset.id;
    names = names.filter(x => x.id !== nameId);
    showNextName()
  }
};
let progress = {};

const setNumberOfNames = (number) => {
  $nameCount.innerText = `${number} name${number===1 ? '' : 's'} so far`;
}

const newName = () => {
  const name = $newNameInput.value;
  $newNameInput.value = '';
  if(name.length >= 2) {
    sendMessage({ type: 'addName', game: 'hatgame', name });
  }
}

function showHatGameResults(progress, allCardsAreGone){
  hideAllElements();
  $results.style.display = 'block';
  if(progress.firstRound) {
    $resultsHeader.style.display = 'none';
  } else {
    $resultsHeader.style.display = 'block';
    $resultsList.innerHTML = Object
      .values(progress)
      .sort((a,b) => a.orderOfName - b.orderOfName)
      .map((value) => `<li class="${value.status}">${value.name}</li>`)
      .join('');
    if(Object.keys(progress).length === 0) {
      $resultsList.innerHTML = '<li>You didn\'t get any. Better luck next time!</li>';
    }
    if(allCardsAreGone) {
      $goAgainBtn.innerText = 'The hat was emptied. All the names are back in the hat.';
    } else {
      $goAgainBtn.innerText = '';
    }
  }
}

let orderOfName = 0;

const showRound = (namesToPlay) => {
  
  $gameEl.style.display = 'grid';
  $setupEl.style.display = 'none';

  names = namesToPlay;

  orderOfName = 0;

  // disable buttons
  $skipBtn.setAttribute('disabled','disabled');
  $gotItBtn.setAttribute('disabled','disabled');

  progress = {};
  
  isStillPlaying = true;

  // Show 3s countdown to player
  doCountdown(() => {
    startedAt = new Date();

    setTimeout(() => {
      // Finish round
      if(isStillPlaying) {
        showHatGameResults(progress, true);
        isPlayer = false;
        sendMessage({type:'endRound', game: 'hatgame', progress, isDeckEmpty: false});
      }
    }, timeOfRound);

    // enabled buttons
    $skipBtn.removeAttribute('disabled');
    $gotItBtn.removeAttribute('disabled');
    showNextName();
  });
}

const startHatGame = () => {
  sendMessage({type:'endRound', game: 'hatgame', progress: {firstRound:true}, isDeckEmpty: false});
};

const nextRoundHatGame = () => {
  isPlayer = true;
  hideAllElements();
  $name.innerText = "Name will appear here";
  sendMessage({type:'start', game:'hatgame'});
}

const skipName = () => {
  progress[$nameEl.dataset.id] = {name: $nameEl.innerText, status: 'skipped', orderOfName};
  orderOfName++;
  removeNameAndGetNext();
};

const gotName = () => {
  progress[$nameEl.dataset.id] = {name: $nameEl.innerText, status: 'got', orderOfName};
  orderOfName++;
  removeNameAndGetNext();

  // prevent accidental double click
  $gotItBtn.setAttribute('disabled', 'disabled');
  setTimeout(() => {
    $gotItBtn.removeAttribute('disabled');
  }, 500);
}

const initializeHatGame = () =>{
  $startHatGame.addEventListener('click', startHatGame);
  $nextRoundHatGame.addEventListener('click', nextRoundHatGame);
  $newNameSubmit.addEventListener('click', newName);
  $skipBtn.addEventListener('click', skipName);
  $gotItBtn.addEventListener('click', gotName);
};

const showHatGamePlaying = () => {  
  if(!isPlayer) {
    hideAllElements();
    $waitingMessage.style.display = 'block';
  }
}

const updateNames = (state) => {
  $newNameInput.focus();
  if(state.numberOfNames) setNumberOfNames(state.numberOfNames);
}

const updateState = (state) => {
  if(state.status === 'names') {
    showRound(state.names);
  } else if(state.status === 'playing') {
    console.log('received playing message');
    showHatGamePlaying();
  } else if(state.status === 'results') {
    console.log('showing results...');
    console.log(state.progress);
    showHatGameResults(state.progress, state.allGone);
  } else {
    console.log('name update...');
    $setupEl.style.display = 'block';
    updateNames(state);
  }
}

const hatgame = {
  setup: $setupEl,
  round: $gameEl,
  init: updateNames,
  showRound,
  updateState,
};

export {
  initializeHatGame,
  hatgame,
}