const wsConfig = { 
  wssHost: window.location.hostname === 'localhost'
    ? `ws://${window.location.host}`
    : `wss://${window.location.host}`
};
const wsc = new WebSocket(wsConfig.wssHost);
let isWebSocketOpen = false;
let connId;
let roomId;
let game;
let isHost = false;

const words = ['a','ability','able','about','above','accept','according','account','across','act','action','activity','actually','add','address','administration','admit','adult','affect','after','again','against','age','agency','agent','ago','agree','agreement','ahead','air','all','allow','almost','alone','along','already','also','although','always','American','among','amount','analysis','and','animal','another','answer','any','anyone','anything','appear','apply','approach','area','argue','arm','around','arrive','art','article','artist','as','ask','assume','at','attack','attention','attorney','audience','author','authority','available','avoid','away','baby','back','bad','bag','ball','bank','bar','base','be','beat','beautiful','because','become','bed','before','begin','behavior','behind','believe','benefit','best','better','between','beyond','big','bill','billion','bit','black','blood','blue','board','body','book','born','both','box','boy','break','bring','brother','budget','build','building','business','but','buy','by','call','camera','campaign','can','cancer','candidate','capital','car','card','care','career','carry','case','catch','cause','cell','center','central','century','certain','certainly','chair','challenge','chance','change','character','charge','check','child','choice','choose','church','citizen','city','civil','claim','class','clear','clearly','close','coach','cold','collection','college','color','come','commercial','common','community','company','compare','computer','concern','condition','conference','Congress','consider','consumer','contain','continue','control','cost','could','country','couple','course','court','cover','create','crime','cultural','culture','cup','current','customer','cut','dark','data','daughter','day','dead','deal','death','debate','decade','decide','decision','deep','defense','degree','Democrat','democratic','describe','design','despite','detail','determine','develop','development','die','difference','different','difficult','dinner','direction','director','discover','discuss','discussion','disease','do','doctor','dog','door','down','draw','dream','drive','drop','drug','during','each','early','east','easy','eat','economic','economy','edge','education','effect','effort','eight','either','election','else','employee','end','energy','enjoy','enough','enter','entire','environment','environmental','especially','establish','even','evening','event','ever','every','everybody','everyone','everything','evidence','exactly','example','executive','exist','expect','experience','expert','explain','eye','face','fact','factor','fail','fall','family','far','fast','father','fear','federal','feel','feeling','few','field','fight','figure','fill','film','final','finally','financial','find','fine','finger','finish','fire','firm','first','fish','five','floor','fly','focus','follow','food','foot','for','force','foreign','forget','form','former','forward','four','free','friend','from','front','full','fund','future','game','garden','gas','general','generation','get','girl','give','glass','go','goal','good','government','great','green','ground','group','grow','growth','guess','gun','guy','hair','half','hand','hang','happen','happy','hard','have','he','head','health','hear','heart','heat','heavy','help','her','here','herself','high','him','himself','his','history','hit','hold','home','hope','hospital','hot','hotel','hour','house','how','however','huge','human','hundred','husband','I','idea','identify','if','image','imagine','impact','important','improve','in','include','including','increase','indeed','indicate','individual','industry','information','inside','instead','institution','interest','interesting','international','interview','into','investment','involve','issue','it','item','its','itself','job','join','just','keep','key','kid','kill','kind','kitchen','know','knowledge','land','language','large','last','late','later','laugh','law','lawyer','lay','lead','leader','learn','least','leave','left','leg','legal','less','let','letter','level','lie','life','light','like','likely','line','list','listen','little','live','local','long','look','lose','loss','lot','love','low','machine','magazine','main','maintain','major','majority','make','man','manage','management','manager','many','market','marriage','material','matter','may','maybe','me','mean','measure','media','medical','meet','meeting','member','memory','mention','message','method','middle','might','military','million','mind','minute','miss','mission','model','modern','moment','money','month','more','morning','most','mother','mouth','move','movement','movie','Mr','Mrs','much','music','must','my','myself','name','nation','national','natural','nature','near','nearly','necessary','need','network','never','new','news','newspaper','next','nice','night','no','none','nor','north','not','note','nothing','notice','now','number','occur','of','off','offer','office','officer','official','often','oh','oil','ok','old','on','once','one','only','onto','open','operation','opportunity','option','or','order','organization','other','others','our','out','outside','over','own','owner','page','pain','painting','paper','parent','part','participant','particular','particularly','partner','party','pass','past','patient','pattern','pay','peace','people','per','perform','performance','perhaps','period','person','personal','phone','physical','pick','picture','piece','place','plan','plant','play','player','PM','point','police','policy','political','politics','poor','popular','population','position','positive','possible','power','practice','prepare','present','president','pressure','pretty','prevent','price','private','probably','problem','process','produce','product','production','professional','professor','program','project','property','protect','prove','provide','public','pull','purpose','push','put','quality','question','quickly','quite','race','radio','raise','range','rate','rather','reach','read','ready','real','reality','realize','really','reason','receive','recent','recently','recognize','record','red','reduce','reflect','region','relate','relationship','religious','remain','remember','remove','report','represent','Republican','require','research','resource','respond','response','responsibility','rest','result','return','reveal','rich','right','rise','risk','road','rock','role','room','rule','run','safe','same','save','say','scene','school','science','scientist','score','sea','season','seat','second','section','security','see','seek','seem','sell','send','senior','sense','series','serious','serve','service','set','seven','several','sex','sexual','shake','share','she','shoot','short','shot','should','shoulder','show','side','sign','significant','similar','simple','simply','since','sing','single','sister','sit','site','situation','six','size','skill','skin','small','smile','so','social','society','soldier','some','somebody','someone','something','sometimes','son','song','soon','sort','sound','source','south','southern','space','speak','special','specific','speech','spend','sport','spring','staff','stage','stand','standard','star','start','state','statement','station','stay','step','still','stock','stop','store','story','strategy','street','strong','structure','student','study','stuff','style','subject','success','successful','such','suddenly','suffer','suggest','summer','support','sure','surface','system','table','take','talk','task','tax','teach','teacher','team','technology','television','tell','ten','tend','term','test','than','thank','that','the','their','them','themselves','then','theory','there','these','they','thing','think','third','this','those','though','thought','thousand','threat','three','through','throughout','throw','thus','time','to','today','together','tonight','too','top','total','tough','toward','town','trade','traditional','training','travel','treat','treatment','tree','trial','trip','trouble','true','truth','try','turn','TV','two','type','under','understand','unit','until','up','upon','us','use','usually','value','various','very','victim','view','violence','visit','voice','vote','wait','walk','wall','want','war','watch','water','way','we','weapon','wear','week','weight','well','west','western','what','whatever','when','where','whether','which','while','white','who','whole','whom','whose','why','wide','wife','will','win','wind','window','wish','with','within','without','woman','wonder','word','work','worker','world','worry','would','write','writer','wrong','yard','yeah','year','yes','yet','you','young','your','yourself'];
const $landingButtons = document.getElementById('landing-buttons');
const $gameBar = document.getElementById('game-bar');
const $joinDialog = document.getElementById('join-dialog');
const $hostBtn = document.getElementById('hostBtn');
const $joinBtn = document.getElementById('joinBtn');
const $roomLink = document.getElementById('room-link');
const $joinSubmit = document.getElementById('join-submit');
const $newCategorySubmit = document.getElementById('new-category-submit');
const $peopleCounter = document.getElementById('people-counter');
const $joinRoomInput = document.getElementById('join-room-input');
const $newCategoryInput = document.getElementById('new-category-input');
const $gameChooser = document.getElementById('game-chooser');
const $pages = Array.from(document.querySelectorAll('.page'));
const $existingCategories = document.getElementById('existing-categories');
const $startGame = document.getElementById('start-game');
const $categoryInpts = document.getElementById('category-inputs');
const $readyButton = document.getElementById('ready-button');
const $games = {
  scattergories: {
    setup: document.getElementById('scattergories-setup'),
    round: document.getElementById('scattergories-game'),
  },
};

const getRoomId = () => words[Math.floor(Math.random()*words.length)] + '-' + words[Math.floor(Math.random()*words.length)];
const setRoomLink = (id) => {
  $roomLink.innerText = window.location.origin + '/' + id
};
const hideAllElements = () => {
  $pages.forEach($page => $page.style.display = 'none');
}
const showHostingBar = () => {
  hideAllElements();
  $roomLink.classList.remove('hide');
  $gameBar.style.display = 'flex';
}
const showParticipantBar = () => {
  hideAllElements();
  $gameBar.style.display = 'flex';
}
const showJoinDialog = () => {
  hideAllElements();
  $joinDialog.style.display = 'block';
  $joinRoomInput.focus();
}
const showLandingButtons = () => {
  hideAllElements();
  $landingButtons.style.display = 'grid';
}
const showGameChooser = () => {
  hideAllElements();
  $gameChooser.style.display = 'grid';
}
const setParticipantCount = (count) => {
  $peopleCounter.innerText = `Participants: ${count}`;
}
const setCategories = (categories) => {
  $existingCategories.innerHTML = categories.map(category => `<li>${category} <span data-category="${category}">X</span></li>`).join('');
}
const setCategoryInputs = (categories) => {
  $categoryInpts.innerHTML = categories.map(category => `
    <label for="${category}">${category}</label>
    <input type="text" />`
  ).join('');
}
const showGame = (game) => {
  $games[game].setup.style.display = 'grid';

  if(isHost) {
    document.querySelectorAll('.host-only').forEach(el => el.style.display = 'block')
  }
};

const wireUpGameChooser = () => {
  document.querySelectorAll('.game-chooser').forEach(($game) => {
    $game.addEventListener('click', (e) => {
      game = $game.dataset.game;
      createRoom();
    });
  });
}

function init() {
  const [, dirtyRoomId] = window.location.pathname.split('/');
  console.log(dirtyRoomId);
  $newCategorySubmit.addEventListener('click', newCategory);
  $existingCategories.addEventListener('click', removeCategory);
  $readyButton.addEventListener('click', ready);
  if(dirtyRoomId) {
    joinRoom(dirtyRoomId);
  } else {
    showLandingButtons();
    wireUpGameChooser();
    $hostBtn.addEventListener('click', gameChooser);
    $joinBtn.addEventListener('click', showJoinDialog);
    $joinSubmit.addEventListener('click', joinRoom);
    $startGame.addEventListener('click', startGame);
  }
}
function ready() {
  wsc.send(JSON.stringify({type:'scattergories-ready', connId, roomId}));
}
function showRound() {
  $games[game].round.style.display = 'grid';
  $games[game].setup.style.display = 'none';
}
function startGame() {
  wsc.send(JSON.stringify({type:'scattergories-start', roomId}));
};
function removeCategory(e) {
  if(e.target.tagName.toLowerCase() === 'span') {
    const { category } = e.target.dataset;
    wsc.send(JSON.stringify({type: 'scattergories-remove-category', roomId, category }))
  }
}

function newCategory () {
  const category = $newCategoryInput.value;
  $newCategoryInput.value = '';
  wsc.send(JSON.stringify({ type: 'scattergories-add-category', roomId, category }));
}

function gameChooser() {
  showGameChooser();
}

async function createRoom() {
  isHost = true;
  showHostingBar();
  showGame(game, true);
  roomId = getRoomId();
  setRoomLink(roomId);
  wsc.send(JSON.stringify({ type:'host', roomId, game }));
}

const getCleanRoomId = (roomId) => {
  let cleanRoomIdBits = roomId.toLowerCase().split(/[^a-z]/).filter(x => x !== '');
  return cleanRoomIdBits.join('-');
}

function joinRoom(localRoomId) {
  if(!isWebSocketOpen) {
    return setTimeout(() => {
      joinRoom(localRoomId);
    }, 10);
  }

  roomId = typeof(localRoomId) === 'string'
    ? localRoomId
    : getCleanRoomId($joinRoomInput.value);

  // update url if not already
  const newUrl = `/${roomId}`;
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }

  console.log(`Joining room ${roomId}`);
  showParticipantBar();
  wsc.send(JSON.stringify({ type: 'join', roomId }));
}

var startTime;

function doCountdown(callback) {
  const $3 = document.getElementById('c3');
  const $2 = document.getElementById('c2');
  const $1 = document.getElementById('c1');
  const $go = document.getElementById('cgo');

  $3.classList.add('counting');

  setTimeout(() => {
    $2.classList.add('counting');

    setTimeout(() => {
      $1.classList.add('counting');
      setTimeout(() => {
        $go.classList.add('counting');
        callback();
      }, 1000);
    }, 1000);
  }, 1000);
}

function startCountdown(callback) {
  startTime = Date.now();
  requestAnimationFrame(doCountdown(callback));
}

function updateState(state) {
  console.log(state.readyCount)
  setParticipantCount(state.count);
  game = state.game;
  if(game === 'scattergories') {
    if(state.status === 'waiting') {
      showRound();
      setCategoryInputs(state.categories);
    } else if (state.status === 'ready') {
      $readyButton.innerText = 'STOP';
      $readyButton.setAttribute('disabled', 'disabled');
      doCountdown(() => console.log('done'));
    } else {      
      showGame(game);
      if(state.categories) setCategories(state.categories);
    }
  }
}

wsc.onmessage = function (evt) {
  const signal = JSON.parse(evt.data);
  switch (signal.type) {
    case 'id':
      connId = signal.connId;
      console.log(connId);
      break;
    case 'ice':
      $remoteVideos[signal.remoteId].peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      break;
    case 'offer':
      initiatePeerConnection(signal.remoteId)
        .then(() => $remoteVideos[signal.remoteId].peerConnection.setRemoteDescription(new RTCSessionDescription(signal.offer)))
        .then(() => $remoteVideos[signal.remoteId].peerConnection.createAnswer())
        .then(answer => $remoteVideos[signal.remoteId].peerConnection.setLocalDescription(answer))
        .then(() => wsc.send(JSON.stringify({type: 'answer', remoteId: signal.remoteId, answer: $remoteVideos[signal.remoteId].peerConnection.localDescription})));
      break;
    case 'answer':
      $remoteVideos[signal.remoteId].peerConnection.setRemoteDescription(new RTCSessionDescription(signal.answer));
      break;
    case 'newMember':
      initiatePeerConnectionAndSendOffer(signal.id);
      break;
    case 'participantList':
      initiatePeerConnectionAndSendOffers(signal.participants);
      break;
    case 'state':
      updateState(signal);
      break;
    default:
      console.log(signal);
  }
  return;
};

wsc.onopen = () => {
  isWebSocketOpen = true;
};

init();

