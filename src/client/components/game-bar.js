import { hideAllElements } from '../scripts/main';

const $gameBar = document.getElementById('game-bar');
const $roomLink = document.getElementById('room-link');
const $peopleCounter = document.getElementById('people-counter');

const setParticipantCount = (count) => {
  $peopleCounter.innerText = `Participants: ${count}`;
}
const showGameBar = () => {
  hideAllElements();
  $roomLink.classList.remove('hide');
  $gameBar.style.display = 'flex';
}
const setRoomLink = (id) => {
  $roomLink.innerText = window.location.origin + '/' + id
};

export {
  showGameBar,
  setRoomLink,
  setParticipantCount,
}