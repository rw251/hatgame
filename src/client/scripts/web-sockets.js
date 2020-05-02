let isWebSocketOpen = false;
let roomId;

const unambiguousLetters = ['a','b','c','d','e','f','g','h','k','m','n','p','q','r','s','t','u','v','w','x','y','z'];

const getRandomLetter = () => unambiguousLetters[Math.floor(Math.random()*unambiguousLetters.length)];
const generateRoomId = () => [
  getRandomLetter(),
  getRandomLetter(),
  getRandomLetter(),
].join('');

let wsc;

const initWebSocket = () => {
  const wsConfig = { 
    wssHost: window.location.hostname === 'localhost'
      ? `ws://${window.location.host}`
      : `wss://${window.location.host}`
  };
  wsc = new WebSocket(wsConfig.wssHost);

  wsc.onopen = () => {
    isWebSocketOpen = true;
  };

  wsc.onclose = () => {
    window.location.reload();
  }

  wsc.on

  return { wsc };
};

const createRoomOnServer = (game) => {

  if(!isWebSocketOpen) {
    return setTimeout(() => {
      createRoomOnServer(game);
    }, 10);
  }

  roomId = generateRoomId();
  wsc.send(JSON.stringify({ type:'host', roomId, game }));
  return roomId;
}

const joinRoomOnServer = (proposedRoomId) => {

  if(!isWebSocketOpen) {
    return setTimeout(() => {
      joinRoomOnServer(proposedRoomId);
    }, 10);
  }

  roomId = proposedRoomId;
  wsc.send(JSON.stringify({ type: 'join', roomId }));  
}

const sendMessage = (message) => {
  // add roomId
  wsc.send(JSON.stringify({ roomId, ...message }));
}

export {
  initWebSocket,
  createRoomOnServer,
  joinRoomOnServer,
  sendMessage,
}