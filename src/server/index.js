const express = require('express');
const morgan = require('morgan');
const server = require('http').createServer();
const WebSocketServer = require('ws').Server;
const path = require('path');

const port = process.env.PORT || 3091;

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// for heroku we are behind a proxy so req.secure is false as
// the internal traffic is http. If we "trust the proxy", then
// we truxt the x-forwarded--blah header and req.secure is true
if (process.env.NODE_ENV === 'production') {
  console.log('Production and heroku so lets do some http to https redirects');
  app.enable('trust proxy');
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

app.use(express.static(path.join(__dirname, '..', '..', 'public_html')));

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, '..', '..', 'public_html', 'index.html'))
});

const wsClients = {};
const rooms = {};
const wss = new WebSocketServer({ server });
const id = () => Math.floor(Math.random()*10000000000);

server.on('request', app);

const createRoom = (hostId, roomId, game) => {
  const lowerRoomId = roomId.toLowerCase();
  wsClients[hostId].hosting = true;
  wsClients[hostId].rooms.push(lowerRoomId);
  rooms[lowerRoomId] = { host: hostId, participants: {} };
  rooms[lowerRoomId].participants[hostId] = { state: 'not-ready' };
  rooms[lowerRoomId].state = { game, count: 1 };
};

const updateCount = (roomId) => {
  rooms[roomId].state.count = Object.keys(rooms[roomId].participants).length;
};

const updateReadiness = (roomId) => {
  rooms[roomId].state.readyCount = Object
    .values(rooms[roomId].participants)
    .filter(x => x.state === 'ready')
    .length;
  if(rooms[roomId].state.readyCount === rooms[roomId].state.count) {
    rooms[roomId].state.status = 'ready';
  }
}

const updateState = (roomId) => {
  Object.keys(rooms[roomId].participants)
    .forEach(person => wsClients[person].ws.send(JSON.stringify({type: 'state', ...rooms[roomId].state})));
};

const joinRoom = (participantId, roomId) => {
  const cleanRoomId = roomId;
  if(!rooms[cleanRoomId]) {
    return wsClients[participantId].ws.send(JSON.stringify({type:'noRoom', roomId: cleanRoomId}));
  }
  rooms[cleanRoomId].participants[participantId] = {state: 'not-ready'};
  wsClients[participantId].rooms.push(cleanRoomId);
  updateCount(cleanRoomId);
  updateState(cleanRoomId);
};

const leaveRoom = (participantId, roomId) => {
  if(!rooms[roomId]) return;
  delete rooms[roomId].participants[participantId];
  updateCount(roomId);
  updateState(roomId);
};

const leaveAllRooms = (participantId) => {
  wsClients[participantId].rooms.forEach(roomId => leaveRoom(participantId, roomId));
  delete wsClients[participantId];
}

// GAME SPECIFIC METHODS
const addCategory = (roomId, category) => {
  if(!rooms[roomId].state.categories) rooms[roomId].state.categories = [];
  rooms[roomId].state.categories.push(category);
  updateState(roomId);
}
const removeCategory = (roomId, category) => {
  rooms[roomId].state.categories = rooms[roomId].state.categories.filter(x => x !== category);
  updateState(roomId);
}
const startScattergories = (roomId) => {
  rooms[roomId].state.status = 'waiting';
  updateState(roomId);
}
const readyScattergories = (participantId, roomId) => {
  rooms[roomId].participants[participantId].state = 'ready';
  updateReadiness(roomId);
  updateState(roomId);
}

const startHatGame = (roomId, connId) => {
  rooms[roomId].state.status = 'playing';
  updateState(roomId);
  wsClients[connId].ws.send(JSON.stringify({type:'state', status:'names', names: rooms[roomId].names}));
}
const addName = (roomId, name) => {
  if(!rooms[roomId].names) rooms[roomId].names = [];
  rooms[roomId].names.push(name);
  rooms[roomId].state.numberOfNames = rooms[roomId].names.length;
  updateState(roomId);
}

const endHatGameRound = (roomId, progress, isDeckEmpty) => {
  rooms[roomId].state.status = 'results';
  if(!rooms[roomId].doneNames) rooms[roomId].doneNames = [];
  rooms[roomId].names.forEach((name) => {
    if(progress[name]) rooms[roomId].doneNames.push(name);
  });
  rooms[roomId].names = rooms[roomId].names.filter(name => !progress[name]);
  const namesLeft = rooms[roomId].names.length;
  if(namesLeft === 0) {
    rooms[roomId].names = rooms[roomId].doneNames;
    rooms[roomId].doneNames = [];
    rooms[roomId].state.allGone = true;
  } else {
    rooms[roomId].state.allGone = false;
  }
  rooms[roomId].state.namesLeft = rooms[roomId].names.length;
  rooms[roomId].state.progress = progress;
  updateState(roomId);
}

const games = {
  scattegories: {
    addCategory,
    removeCategory,
    start: startScattergories,
    ready: readyScattergories,
  },
  hatgame: {
    addName,
    start: startHatGame,
    endround: endHatGameRound,
  }
};

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
      case 'leave':
        leaveRoom(connId, signal.roomId);
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
        games.scattegories.addCategory(signal.roomId, signal.category);
        break;
      case 'scattergories-remove-category':
        games.scattegories.removeCategory(signal.roomId, signal.category);
        break;
      case 'scattergories-start':
        games.scattegories.start(signal.roomId, connId);
        break;
      case 'scattergories-ready':
        games.scattegories.ready(connId, signal.roomId);
        break;
      default:
        console.log(signal);
    }
  });

  ws.on('close', () => {
    leaveAllRooms(connId);
  });

});

server.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on server http://localhost:${port}`)
})
