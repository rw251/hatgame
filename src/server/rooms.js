const WebSocketServer = require('ws').Server;

const wsClients = {};

const id = () => Math.floor(Math.random()*10000000000);

const rooms = {};

const broadcast = (message, people) => {
  people.forEach(person => wsClients[person].ws.send(JSON.stringify(message)));
};

const send = (message, person) => {
  wsClients[person].ws.send(JSON.stringify(message));
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

const leaveAllRooms = (participantId) => {
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

exports.initializeRooms = ({server, games}) => {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {

    const connId = id();
    console.log('connection up', connId);

    wsClients[connId] = { ws, rooms: [] };

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
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
        default:
          isHandled = false;
      }

      if(!isHandled) {
        if(!signal.game || !games[signal.game] || !games[signal.game][signal.type]) {
          console.log(signal);
        } else {
          games[signal.game][signal.type](signal);
        }
      }

    });

    ws.on('close', () => {
      leaveAllRooms(connId);
    });

  });
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