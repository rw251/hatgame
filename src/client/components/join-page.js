import { hideAllElements } from '../scripts/main';
import { joinRoom } from '../scripts/room-management';
import { showParticipantBar } from './game-bar';

const $joinDialog = document.getElementById('join-dialog');
const $joinRoomInput = document.getElementById('join-room-input');
const $joinSubmit = document.getElementById('join-submit');

const getCleanRoomId = (roomId) => {
  let cleanRoomIdBits = roomId.toLowerCase().split(/[^a-z]/).filter(x => x !== '');
  return cleanRoomIdBits.join('');
}

const wireUpJoinPage = () => {
  $joinSubmit.addEventListener('click', () => {
    const roomId = getCleanRoomId($joinRoomInput.value);
    joinRoom(roomId);
    showParticipantBar();
  });
}

const showJoinDialog = () => {  
  // update url if not already
  const newUrl = '/join';
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }

  hideAllElements();
  $joinDialog.style.display = 'block';
  $joinRoomInput.focus();
}

export {
  showJoinDialog,
  wireUpJoinPage,
}