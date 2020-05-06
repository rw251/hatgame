const WebSocketServer = require('ws').Server;

const wsClients = {};

const id = () => Math.floor(Math.random()*10000000000);

const rooms = {};

const broadcast = (message, people) => {
  people.forEach(person => wsClients[person].webSocket.send(JSON.stringify(message)));
};

const send = (message, person) => {
  wsClients[person].webSocket.send(JSON.stringify(message));
};

const disconnect = (participantId) => {
  delete wsClients[participantId];
};

const getRoomsFor = (participantId) => wsClients[participantId].rooms;

const connect = (participantId, roomId) => {
  wsClients[participantId].rooms.push(roomId);
};

const broadcastState = (roomId) => broadcast(
  {type: 'state', ...rooms[roomId].state},
  Object.keys(rooms[roomId].participants),
);

const updateParticipantCount = (roomId) => {
  rooms[roomId].state.count = Object.keys(rooms[roomId].participants).length;
};

const createRoom = (hostId, roomId, game) => {
  const lowerRoomId = roomId.toLowerCase();
  connect(hostId, lowerRoomId);
  rooms[lowerRoomId] = { participants: {} };
  rooms[lowerRoomId].participants[hostId] = { state: 'not-ready' };
  rooms[lowerRoomId].state = { game, count: 1 };
};

const leaveRoom = (participantId, roomId) => {
  if(!rooms[roomId]) return;
  delete rooms[roomId].participants[participantId];
  updateParticipantCount(roomId);
  broadcastState(roomId);
};

const leaveAllRooms = (participantId) => () => {
  getRoomsFor(participantId).forEach(roomId => leaveRoom(participantId, roomId));
  disconnect(participantId);
}

const joinRoom = (participantId, roomId) => {
  const cleanRoomId = roomId;
  if(!rooms[cleanRoomId]) {
    return send({type:'noRoom', roomId: cleanRoomId}, participantId);
  }
  rooms[cleanRoomId].participants[participantId] = {state: 'not-ready'};
  connect(participantId, cleanRoomId);
  updateParticipantCount(cleanRoomId);
  broadcastState(cleanRoomId);
};

const listRooms = (participantId) => send({ type: 'admin', ...rooms}, participantId);

const initializeClient = (games) => (webSocket) => {
  const connId = id();

  wsClients[connId] = { webSocket, rooms: [] };

  webSocket.on('message', (message) => {
    const signal = JSON.parse(message);
    signal.connId = connId;
    console.log(signal.type, signal.roomId);

    let isHandled = true;
    // Room management
    switch(signal.type) {
      case 'join':
        joinRoom(connId, signal.roomId);
        break;
      case 'host':
        createRoom(connId, signal.roomId, signal.game);
        break;
      case 'admin':
        listRooms(connId);
        break;
      default:
        isHandled = false;
    }

    if(!isHandled) {
      if(!signal.game || !games[signal.game] || !games[signal.game][signal.type]) {
        // shouldn't happen - useful for debugging
        console.log(signal);
      } else {
        games[signal.game][signal.type](signal);
      }
    }

  });

  webSocket.on('close', leaveAllRooms(connId));
}

exports.initializeRooms = ({server, games}) => {
  const wss = new WebSocketServer({ server });  
  wss.on('connection', initializeClient(games));
}

exports.send = send;
exports.broadcastState = broadcastState;

exports.getRoom = (roomId) => rooms[roomId];

exports.setState = (roomId, prop, value) =>{  
  rooms[roomId].state[prop] = value;
}

exports.updateReadiness = (roomId) => {
  rooms[roomId].state.readyCount = Object
    .values(rooms[roomId].participants)
    .filter(x => x.state === 'ready')
    .length;
  if(rooms[roomId].state.readyCount === rooms[roomId].state.count) {
    rooms[roomId].state.status = 'ready';
  }
};