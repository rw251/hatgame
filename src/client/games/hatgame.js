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

let isPlayer = false;
let names = [];
let isStillPlaying = false;
const removeNameAndGetNext = () => {
  if(names.length === 1) {
    isStillPlaying = false;
    isPlayer = false;
    showHatGameResults(progress);
    sendMessage({type:'hatgame-round-ends', progress, isDeckEmpty: true});
  } else {
    const firstIndex = names.indexOf($nameEl.innerText);
    names.splice(firstIndex, 1);
    $nameEl.innerText = names[Math.floor(Math.random() * names.length)];
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
    sendMessage({ type: 'hatgame-add-name', name });
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
      .keys(progress)
      .map(x => `<li class="${progress[x]}">${x}</li>`)
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

const showRound = (namesToPlay) => {

  
  $gameEl.style.display = 'grid';
  $setupEl.style.display = 'none';

  names = namesToPlay;

  // disable buttons
  $skipBtn.setAttribute('disabled','disabled');
  $gotItBtn.setAttribute('disabled','disabled');

  progress = {};
  
  isStillPlaying = true;

  // Show 3s countdown to player
  doCountdown(() => {
    setTimeout(() => {
      // Finish round
      if(isStillPlaying) {
        showHatGameResults(progress, true);
        isPlayer = false;
        sendMessage({type:'hatgame-round-ends', progress, isDeckEmpty: false});
      }
    }, 25000);

    // enabled buttons
    $skipBtn.removeAttribute('disabled');
    $gotItBtn.removeAttribute('disabled');
    $nameEl.innerText = names[Math.floor(Math.random() * names.length)];
  });
}

const startHatGame = () => {
  sendMessage({type:'hatgame-round-ends', progress: {firstRound:true}, isDeckEmpty: false});
};

const nextRoundHatGame = () => {
  isPlayer = true;
  hideAllElements();
  $name.innerText = "Name will appear here";
  sendMessage({type:'hatgame-start'});
}

const skipName = () => {
  progress[$nameEl.innerText] = 'skipped';
  removeNameAndGetNext();
};

const gotName = () => {
  progress[$nameEl.innerText] = 'got';
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