const wsConfig = { 
  wssHost: window.location.hostname === 'localhost'
    ? `ws://${window.location.host}`
    : `wss://${window.location.host}`
};
const wsc = new WebSocket(wsConfig.wssHost);
let isWebSocketOpen = false;
let connId;
let roomId;
let game;
let isHost = false;
let isPlayer = false;

const unambiguousLetters = ['a','b','c','d','e','f','g','h','k','m','n','p','q','r','s','t','u','v','w','x','y','z'];
const $landingButtons = document.getElementById('landing-buttons');
const $gameBar = document.getElementById('game-bar');
const $joinDialog = document.getElementById('join-dialog');
const $hostBtn = document.getElementById('hostBtn');
const $joinBtn = document.getElementById('joinBtn');
const $roomLink = document.getElementById('room-link');
const $joinSubmit = document.getElementById('join-submit');
const $newCategorySubmit = document.getElementById('new-category-submit');
const $peopleCounter = document.getElementById('people-counter');
const $joinRoomInput = document.getElementById('join-room-input');
const $newCategoryInput = document.getElementById('new-category-input');
const $newNameInput = document.getElementById('new-hat-name-input');
const $gameChooser = document.getElementById('game-chooser');
const $pages = Array.from(document.querySelectorAll('.page'));
const $existingCategories = document.getElementById('existing-categories');
const $startGame = document.getElementById('start-game');
const $startHatGame = document.getElementById('start-hatgame');
const $nextRoundHatGame = document.getElementById('pull-next-name');
const $categoryInpts = document.getElementById('category-inputs');
const $readyButton = document.getElementById('ready-button');
const $newNameSubmit = document.getElementById('new-hat-name-submit');
const $games = {
  scattergories: {
    setup: document.getElementById('scattergories-setup'),
    round: document.getElementById('scattergories-game'),
  },
  hatgame: {
    setup: document.getElementById('hatgame-setup'),
    round: document.getElementById('hatgame-game'),
  }
};

//const getRoomId = () => words[Math.floor(Math.random()*words.length)] + '-' + words[Math.floor(Math.random()*words.length)];
const getRoomId = () => unambiguousLetters[Math.floor(Math.random()*unambiguousLetters.length)] + unambiguousLetters[Math.floor(Math.random()*unambiguousLetters.length)] + unambiguousLetters[Math.floor(Math.random()*unambiguousLetters.length)];
const setRoomLink = (id) => {
  $roomLink.innerText = window.location.origin + '/' + id
};
const hideAllElements = () => {
  $pages.forEach($page => $page.style.display = 'none');
}
const showHostingBar = () => {
  hideAllElements();
  $roomLink.classList.remove('hide');
  $gameBar.style.display = 'flex';
}
const showParticipantBar = () => {
  hideAllElements();
  $gameBar.style.display = 'flex';
}
const showJoinDialog = () => {
  hideAllElements();
  $joinDialog.style.display = 'block';
  $joinRoomInput.focus();
}
const showLandingButtons = () => {
  hideAllElements();
  $landingButtons.style.display = 'grid';
}
const showGameChooser = () => {
  hideAllElements();
  $gameChooser.style.display = 'grid';
}
const setParticipantCount = (count) => {
  $peopleCounter.innerText = `Participants: ${count}`;
}
const setCategories = (categories) => {
  $existingCategories.innerHTML = categories.map(category => `<li>${category} <span data-category="${category}">X</span></li>`).join('');
}
const setNumberOfNames = (number) => {
  document.getElementById('hat-game-name-count').innerText = `${number} name${number===1 ? '' : 's'} so far`;
}
const setCategoryInputs = (categories) => {
  $categoryInpts.innerHTML = categories.map(category => `
    <label for="${category}">${category}</label>
    <input type="text" />`
  ).join('');
}
const showGame = (game) => {
  $games[game].setup.style.display = 'block';

  if(game === 'hatgame') {
    $newNameInput.focus();
  }
};

const wireUpGameChooser = () => {
  document.querySelectorAll('.game-chooser').forEach(($game) => {
    $game.addEventListener('click', (e) => {
      game = $game.dataset.game;
      createRoom();
    });
  });
}

function init() {
  const [, dirtyRoomId] = window.location.pathname.split('/');
  console.log(dirtyRoomId);
  $newNameSubmit.addEventListener('click', newName);
  $newCategorySubmit.addEventListener('click', newCategory);
  $existingCategories.addEventListener('click', removeCategory);
  $readyButton.addEventListener('click', ready);
  $startHatGame.addEventListener('click', startHatGame);
  $nextRoundHatGame.addEventListener('click', nextRoundHatGame);
  if(dirtyRoomId) {
    joinRoom(dirtyRoomId);
  } else {
    showLandingButtons();
    wireUpGameChooser();
    $hostBtn.addEventListener('click', gameChooser);
    $joinBtn.addEventListener('click', showJoinDialog);
    $joinSubmit.addEventListener('click', joinRoom);
    $startGame.addEventListener('click', startGame);
  }
}
function showHatGameResults(progress, allCardsAreGone){
  hideAllElements();
  document.getElementById('hatgame-results').style.display = 'block';
  if(progress.firstRound) {
    document.querySelector('#hatgame-results h1').style.display = 'none';
  } else {
    document.querySelector('#hatgame-results h1').style.display = 'block';
    document.querySelector('#hatgame-results ul').innerHTML = Object
      .keys(progress)
      .map(x => `<li class="${progress[x]}">${x}</li>`)
      .join('');
    if(allCardsAreGone) {
      document.getElementById('hatgame-start-over').innerText = 'The hat was emptied. All the names are back in the hat.';
    } else {
      document.getElementById('hatgame-start-over').innerText = '';
    }
  }
}
let names = [];
let isStillPlaying = false;
const removeNameAndGetNext = () => {
  if(names.length === 1) {
    isStillPlaying = false;
    isPlayer = false;
    showHatGameResults(progress);
    wsc.send(JSON.stringify({type:'hatgame-round-ends', roomId, progress, isDeckEmpty: true}));
  } else {
    const firstIndex = names.indexOf(nameEl.innerText);
    names.splice(firstIndex, 1);
    nameEl.innerText = names[Math.floor(Math.random() * names.length)];
  }
};
const nameEl =document.getElementById('hatgame-name');
const skipBtn = document.getElementById('hatgame-skip-button');
const gotItBtn = document.getElementById('hatgame-done-button');
let progress = {};
skipBtn.addEventListener('click', () => {
  progress[nameEl.innerText] = 'skipped';
  removeNameAndGetNext();
});
gotItBtn.addEventListener('click', () => {
  progress[nameEl.innerText] = 'got';
  removeNameAndGetNext();

  // prevent accidental double click
  gotItBtn.setAttribute('disabled', 'disabled');
  setTimeout(() => {
    gotItBtn.removeAttribute('disabled');
  }, 500);
});

function showHatGameRound() {

  // disable buttons
  skipBtn.setAttribute('disabled','disabled');
  gotItBtn.setAttribute('disabled','disabled');

  showRound();

  progress = {};
  
  isStillPlaying = true;

  // Show 3s countdown to player
  doCountdown(() => {
    setTimeout(() => {
      // Finish round
      if(isStillPlaying) {
        showHatGameResults(progress, true);
        isPlayer = false;
        wsc.send(JSON.stringify({type:'hatgame-round-ends', roomId, progress, isDeckEmpty: false}));
      }
    }, 30000);

    // enabled buttons
    skipBtn.removeAttribute('disabled');
    gotItBtn.removeAttribute('disabled');
    nameEl.innerText = names[Math.floor(Math.random() * names.length)];
  });
}
function ready() {
  wsc.send(JSON.stringify({type:'scattergories-ready', connId, roomId}));
}
function showRound() {
  $games[game].round.style.display = 'grid';
  $games[game].setup.style.display = 'none';
}
function nextRoundHatGame() {
  isPlayer = true;
  hideAllElements();
  document.getElementById('hatgame-name').innerText = "Name will appear here";
  wsc.send(JSON.stringify({type:'hatgame-start', roomId}));
}
function startHatGame() {
  wsc.send(JSON.stringify({type:'hatgame-round-ends', roomId, progress: {firstRound:true}, isDeckEmpty: false}));
  // wsc.send(JSON.stringify({type:'hatgame-start', roomId}));
};
function startGame() {
  wsc.send(JSON.stringify({type:'scattergories-start', roomId}));
};
function removeCategory(e) {
  if(e.target.tagName.toLowerCase() === 'span') {
    const { category } = e.target.dataset;
    wsc.send(JSON.stringify({type: 'scattergories-remove-category', roomId, category }))
  }
}

function newName () {
  const name = $newNameInput.value;
  $newNameInput.value = '';
  if(name.length >= 2) {
    wsc.send(JSON.stringify({ type: 'hatgame-add-name', roomId, name }));
  }
}

function newCategory () {
  const category = $newCategoryInput.value;
  $newCategoryInput.value = '';
  wsc.send(JSON.stringify({ type: 'scattergories-add-category', roomId, category }));
}

function gameChooser() {
  showGameChooser();
}

async function createRoom() {
  isHost = true;
  document.querySelectorAll('.host-only').forEach(el => el.classList.remove('host-only'));
  showHostingBar();
  showGame(game, true);
  roomId = getRoomId();
  setRoomLink(roomId);
  wsc.send(JSON.stringify({ type:'host', roomId, game }));
}

const getCleanRoomId = (roomId) => {
  let cleanRoomIdBits = roomId.toLowerCase().split(/[^a-z]/).filter(x => x !== '');
  return cleanRoomIdBits.join('');
}

function joinRoom(localRoomId) {
  
  if(!isWebSocketOpen) {
    return setTimeout(() => {
      joinRoom(localRoomId);
    }, 10);
  }

  document.querySelectorAll('.guest-only').forEach(el => el.classList.remove('guest-only'));

  roomId = typeof(localRoomId) === 'string'
    ? localRoomId
    : getCleanRoomId($joinRoomInput.value);

  // update url if not already
  const newUrl = `/${roomId}`;
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }

  console.log(`Joining room ${roomId}`);
  showParticipantBar();
  wsc.send(JSON.stringify({ type: 'join', roomId }));
}

var startTime;

const $3 = document.getElementById('c3');
const $2 = document.getElementById('c2');
const $1 = document.getElementById('c1');
const $go = document.getElementById('cgo');
const $cd = document.getElementById('round-countdown');
function resetCountdown() {
  $3.classList.remove('counting');
  $2.classList.remove('counting');
  $1.classList.remove('counting');
  $go.classList.remove('counting');
}
function doCountdown(callback) {

  $cd.style.display = 'block';

  $3.classList.add('counting');

  setTimeout(() => {
    $2.classList.add('counting');

    setTimeout(() => {
      $1.classList.add('counting');
      setTimeout(() => {
        $go.classList.add('counting');
        setTimeout(() => {
          $cd.style.display = 'block';
          resetCountdown();
        },1000);
        callback();
      }, 1000);
    }, 1000);
  }, 1000);
}

function startCountdown(callback) {
  startTime = Date.now();
  requestAnimationFrame(doCountdown(callback));
}

function updateState(state) {
  setParticipantCount(state.count);
  game = state.game;
  if(game === 'scattergories') {
    if(state.status === 'waiting') {
      showRound();
      setCategoryInputs(state.categories);
    } else if (state.status === 'ready') {
      $readyButton.innerText = 'STOP';
      $readyButton.setAttribute('disabled', 'disabled');
      doCountdown(() => console.log('done'));
    } else {      
      showGame(game);
      if(state.categories) setCategories(state.categories);
    }
  } else {
    if(state.status === 'playing') {
      console.log('received playing message');
      if(!isPlayer) {
        hideAllElements();
        document.getElementById('hatgame-waiting').style.display = 'block';
      }
    } else if(state.status === 'results') {
      console.log('showing results...');
      console.log(state.progress);
      showHatGameResults(state.progress, state.allGone);
    } else {
      console.log('name update...');
      showGame(game);
      if(state.numberOfNames) setNumberOfNames(state.numberOfNames);
    }
  }
}

wsc.onmessage = function (evt) {
  const signal = JSON.parse(evt.data);
  console.log(signal.type);
  switch (signal.type) {
    case 'id':
      connId = signal.connId;
      break;
    case 'state':
      updateState(signal);
      break;
    case 'hatgame-names':
      names = signal.names;
      showHatGameRound();
      break;
    default:
      console.log(signal);
  }
  return;
};

wsc.onopen = () => {
  isWebSocketOpen = true;
};

init();

