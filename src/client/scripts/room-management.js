import { createRoomOnServer, joinRoomOnServer } from './web-sockets';

const createRoom = (game) => {
  const roomId = createRoomOnServer(game);
  // update url if not already
  const newUrl = `/${roomId}`;
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }
  return roomId;
}

const joinRoom = (localRoomId) => {
  
  document.querySelectorAll('.guest-only').forEach(el => el.classList.remove('guest-only'));

  // update url if not already
  const newUrl = `/${localRoomId}`;
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }

  console.log(`Joining room ${localRoomId}`);

  joinRoomOnServer(localRoomId);
}

export {
  createRoom,
  joinRoom,
}