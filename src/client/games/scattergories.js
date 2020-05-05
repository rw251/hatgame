import { sendMessage } from '../scripts/web-sockets';
import { doCountdown } from '../components/countdown';

const $startGame = document.getElementById('start-game');
const $readyButton = document.getElementById('ready-button');
const $existingCategories = document.getElementById('existing-categories');
const $newCategorySubmit = document.getElementById('new-category-submit');
const $newCategoryInput = document.getElementById('new-category-input');
const $categoryInputs = document.getElementById('category-inputs');
const $setupEl = document.getElementById('scattergories-setup');

const startGame = () => {
  sendMessage({type:'start', game: 'scattergories' });
};

const ready = () => {
  sendMessage({type:'ready', game: 'scattergories' });
}

const initializeScattergories = () => {
  $startGame.addEventListener('click', startGame);
  $readyButton.addEventListener('click', ready);
  $existingCategories.addEventListener('click', removeCategory);
  $newCategorySubmit.addEventListener('click', newCategory);
};

const newCategory = () => {
  const category = $newCategoryInput.value;
  $newCategoryInput.value = '';
  sendMessage({ type: 'addCategory', game: 'scattergories', category });
}

const removeCategory = (e) => {
  if(e.target.tagName.toLowerCase() === 'span') {
    const { category } = e.target.dataset;
    sendMessage({type: 'removeCategory', game: 'scattergories', category })
  }
}

const setCategoryInputs = (categories) => {
  $categoryInputs.innerHTML = categories.map(category => `
    <label for="${category}">${category}</label>
    <input type="text" />`
  ).join('');
}

const setCategories = (categories) => {
  $existingCategories.innerHTML = categories.map(category => `<li>${category} <span data-category="${category}">X</span></li>`).join('');
}

const showRound = () => {};

const updateState = (state) => {
  if(state.status === 'waiting') {
    showRound();
    setCategoryInputs(state.categories);
  } else if (state.status === 'ready') {
    $readyButton.innerText = 'STOP';
    $readyButton.setAttribute('disabled', 'disabled');
    doCountdown(() => console.log('done'));
  } else {      
    $setupEl.style.display = 'block';
    if(state.categories) setCategories(state.categories);
  }
};

const scattergories = {
  setup: $setupEl,
  round: document.getElementById('scattergories-game'),
  init: (state) => {
    if(state.categories) setCategories(state.categories);
  },
  showRound,
  updateState,
};

export {
  initializeScattergories,
  scattergories,
}