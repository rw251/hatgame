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
      console.log(signal.type, signal.roomId);
      switch(signal.type) {
        case 'join':
          joinRoom(connId, signal.roomId);
          break;
        case 'host':
          createRoom(connId, signal.roomId, signal.game);
          break;
        case 'hatgame-round-ends':
          games.hatgame.endround(signal.roomId, signal.progress, signal.isDeckEmpty);
          break;
        case 'hatgame-add-name':
          games.hatgame.addName(signal.roomId, signal.name);
          break;
        case 'hatgame-start':
          games.hatgame.start(signal.roomId, connId);
          break;
        case 'scattergories-add-category':
          games.scattergories.addCategory(signal.roomId, signal.category);
          break;
        case 'scattergories-remove-category':
          games.scattergories.removeCategory(signal.roomId, signal.category);
          break;
        case 'scattergories-start':
          games.scattergories.start(signal.roomId, connId);
          break;
        case 'scattergories-ready':
          games.scattergories.ready(connId, signal.roomId);
          break;
        default:
          console.log(signal);
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