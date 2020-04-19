const express = require('express');
const morgan = require('morgan');
const server = require('http').createServer();
const forceSsl = require('express-force-ssl');
const WebSocketServer = require('ws').Server;
const path = require('path');

const port = process.env.PORT || 3091;

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..', 'client')));

if (process.env.NODE_ENV === 'production') {
  console.log('ATTEMPTING FORCESSL');
  app.use(forceSsl);
}

// So that on heroku it recognises requests as https rather than http
app.enable('trust proxy');

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
});

const wsClients = {};
const rooms = {};
const wss = new WebSocketServer({ server });
const id = () => Math.floor(Math.random()*10000000000);

server.on('request', app);

const createRoom = (hostId, roomId) => {
  const lowerRoomId = roomId.toLowerCase();
  wsClients[hostId].hosting = true;
  wsClients[hostId].rooms.push(lowerRoomId);
  rooms[lowerRoomId] = { host: hostId, participants: {} };
  rooms[lowerRoomId].participants[hostId] = true;
};

const updateCount = (roomId) => {
  const count = Object.keys(rooms[roomId].participants).length;
  Object.keys(rooms[roomId].participants)
    .forEach(person => wsClients[person].ws.send(JSON.stringify({type: 'count', count})));
};

const getCleanRoomId = (roomId) => {
  let cleanRoomIdBits = roomId.toLowerCase().split(/[^a-z]/).filter(x => x !== '');
  return cleanRoomIdBits.join('-');
}
const joinRoom = (participantId, roomId) => {
  const cleanRoomId = getCleanRoomId(roomId);
  if(!rooms[cleanRoomId]) {
    return wsClients[participantId].ws.send(JSON.stringify({type:'noRoom', roomId: cleanRoomId}));
  }
  rooms[cleanRoomId].participants[participantId] = true;
  wsClients[participantId].rooms.push(cleanRoomId);
  updateCount(cleanRoomId);
};

const leaveRoom = (participantId, roomId) => {
  if(!rooms[roomId]) return;
  delete rooms[roomId].participants[participantId];
  updateCount(roomId);
};

const leaveAllRooms = (participantId) => {
  wsClients[participantId].rooms.forEach(roomId => leaveRoom(participantId, roomId));
  delete wsClients[participantId];
}

wss.on('connection', (ws) => {

  const connId = id();
  console.log('connection up', connId);

  wsClients[connId] = { ws, rooms: [] };

  //connection is up, let's add a simple simple event
  ws.on('message', (message) => {
    const signal = JSON.parse(message);
    switch(signal.type) {
      case 'join':
        joinRoom(connId, signal.roomId);
        break;
      case 'host':
        createRoom(connId, signal.roomId);
        break;
      case 'leave':
        leaveRoom(connId, signal.roomId);
        break;
      default:
        console.log(signal);
    }
  });

  ws.on('close', () => {
    leaveAllRooms(connId);
  });

  //send immediatly a feedback to the incoming connection    
  ws.send(JSON.stringify({type: 'id', connId}));
});

server.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on server http://localhost:${port}`)
})
