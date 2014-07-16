// TODO:
// FIX second card chosen fades before it displays...
// Make this look better...
// Do something interesting if user wins game
// Do something interesting if user does not win game
// MAYBE Add game history/stats to go backwards
// Allow multi-player games
// create / allow different deck types
// allow users to create own deck cards
// alow users to screencap & share game
// introduce levels based on ratio of #of cards types per deck & #of squares on grid
// animate grid building
// animate game in play dots
// cycle weird quotes sourced from twitter? in game status bar on every new turn
// translate # of turns to $? points?
// build total points based on # of games won at varying levels. I.E. 1 game won at level 1 will give 1 point. 1 game won at level 10 will give 10 points. 1 game won at level 1 combined with another game won at level 10 will equal 11 total points overall.
// animate stories / interactions between cards that are active - i.e. when a cat and mouse are active, they will look at each other or the cat will eat the mouse and the mouse card will no longer be playable (you may have lost the ability to win the game this way = harder level)

var myMemory = {};

//CARD OBJECT
var Card = function Card(status, id){
	this.status = status; //active or inactive
	this.id = id;
	this.type;
}

Card.prototype.setType = function(){
	if(this.type){
		return this.type;
	}
	else{
		var types = ["king", "queen", "joker", "ace"];
		var randomNumber = Math.round(Math.random() * 3);
		
		this.type = types[randomNumber];
		return types[randomNumber];
	}
};

Card.prototype.physicalCard = function(){
	var listItem = document.createElement("li");
	var divItem = document.createElement("div");
	
	divItem.className = "box";
	divItem.setAttribute("data-status", this.status);
	divItem.setAttribute("data-cardid", this.id);

	listItem.appendChild(divItem);
	return listItem;
};


//GRID OBJECT
var Grid = function Grid(dimensions){
	this.rows = dimensions[0];
	this.columns = dimensions[1];
}

Grid.prototype.build = function(){
	var deck = [];
	var totalBoxes = parseInt(this.rows) * parseInt(this.columns);
	var gridList = document.getElementById("grid");

	this.removeGrid();
		
	for(var i = 0; i < totalBoxes; i++){

		var cardBuilt = new Card("inactive", i);
		cardBuilt.setType();
		console.log(cardBuilt.type);
		gridList.appendChild(cardBuilt.physicalCard());

		deck.push(cardBuilt);
	}

	this.setWidth();

	myMemory.deck = deck; //ermmm
	myMemory.turnsRemaining = 6;
	myMemory.message = "";
	myMemory.wonGames = myMemory.wonGames || 0;
	myMemory.totalGames = myMemory.totalGames || 0;
	myMemory.gameStatus = "in play";
	// return deck;
};

Grid.prototype.setWidth = function(){
	var gridList = document.getElementById("grid");
	var x = (this.columns * 100) + 60;
	gridList.style.width = x.toString() + "px";

};

Grid.prototype.removeGrid = function(){
	var gridList = document.getElementById("grid");
	while(gridList.firstChild){
		gridList.removeChild(gridList.firstChild);
	}
};

Grid.prototype.getDeck = function(){
	return this.deck;
}


//INIT EVENTS
document.getElementById('submitSettings').addEventListener('click', buildGrid, false);

function updateStats(){
	myMemory.turnsRemaining -= 1;

	if(myMemory.turnsRemaining < 0){
		myMemory.message = "GAME OVER. Play again?<br /><br />Click the BUILD button to start a new game<br /><br />";
		myMemory.gameStatus = "lost";
		myMemory.totalGames += 1;

		promptNewGame();
	}
	else if(myMemory.gameStatus === "won"){
		myMemory.message = "GAME WON<br /><br />Click the BUILD button to start a new game<br /><br />";
		myMemory.wonGames += 1;
		myMemory.totalGames += 1;

		promptNewGame();
	}
	else{
		myMemory.message = "Game in play<span class='dot1'>.</span><span class='dot2'>.</span><span class='dot3'>.</span>";
	}

	displayStats();
}

function promptNewGame(){
	setTimeout(function(){ //so we can see the match for a bit
		Grid.prototype.removeGrid();
	}, 900);

	var grid = document.getElementById('grid');

	grid.removeEventListener('click', queryActiveCards, false);
	grid.removeEventListener('click', revealCard, false);
	grid.removeEventListener('click', fadeOutCard, false);
	grid.removeEventListener('click', updateStats, false);

	if(myMemory.gameStatus === "lost"){
		console.log("you lost");
	}
}

function displayStats(){
	var message = document.getElementById("message");
	message.innerHTML = myMemory.message;

	var movesLeft = document.getElementById("movesLeft");
	if(myMemory.gameStatus === "won"){
		movesLeft.innerHTML = "You won the game with " + myMemory.turnsRemaining + " turns remaining<br /><br />";
	}
	if(myMemory.gameStatus === "in play"){
		movesLeft.innerHTML = "You have " + myMemory.turnsRemaining + " turns remaining<br /><br />";
	}
	if(myMemory.gameStatus === "lost"){
		movesLeft.innerHTML = "You used up all your turns<br /><br />";
	}

	var score = document.getElementById("score");
	score.innerHTML = myMemory.wonGames + " games won out of " + myMemory.totalGames;
}

function getGridDimensions(){
	var rows = document.getElementById("numberRows").value || 4;
	var columns = document.getElementById("numberColumns").value || 4;

	return [rows, columns]; 
}

function buildGrid(){
	var dimensions = getGridDimensions();
	var newGrid = new Grid(dimensions);
	newGrid.build();

	var grid = document.getElementById('grid');

	grid.addEventListener('click', queryActiveCards, false);
	grid.addEventListener('click', revealCard, false);
	grid.addEventListener('click', fadeOutCard, false);
	grid.addEventListener('click', updateStats, false);
}

function getDataCardId(e){
	var dataCardId = e.toElement.attributes['data-cardid'].nodeValue;
	return dataCardId;
}

function revealCard(e){
	var cardId = getDataCardId(e);
	var cardShape = myMemory.deck[cardId].type;
	var card = e.target;

	var changeStat = toggleCardStatus(myMemory.deck[cardId].status, cardId);

	switch(cardShape){
		case "king":
			setCSS(card, "backgroundImage", "url('img/king.jpg')");//make this map to the cardShape.jpg
			break;
		case "queen":
			setCSS(card, "backgroundImage", "url('img/queen.jpg')");
			break;
		case "joker":
			setCSS(card, "backgroundImage", "url('img/joker.jpg')");
			break;
		case "ace":
			setCSS(card, "backgroundImage", "url('img/ace.jpg')");
			break;
		default:
			setCSS(card, "backgroundImage", "url('img/gold.jpg')");
			break;
	}

}

function toggleCardStatus(cardStats, cardId){
	var targetedCard = myMemory.deck[cardId];

	if(cardStats === "inactive"){
		targetedCard.status = "active";
	}
	else{
		targetedCard.status = "inactive";
	}
}

function fadeOutCard(e){
	var cardsActive = queryActiveCards(e);
	var IdNumber = getDataCardId(e);

	console.log("there are " + cardsActive.length + " active cards: ");
	console.log(cardsActive);
	
	if(cardsActive.length === 1){
		//do nothing
	}
	if(cardsActive.length === 2){
		setTimeout(function(){
			toggleCardStatus("active", cardsActive[0].id.toString());
			toggleCardStatus("active", cardsActive[1].id.toString()); //this is crap
		}, 900);
	}
	else{
		if(myMemory.gameStatus === "won"){
			setTimeout(function(){
				turnOffFade(cardsActive[0], cardsActive[1]);
			}, 300); //UGH this sucks
		} 
	}
}

function getBoxElemByNumber(IdNumber){
	var boxes = document.querySelectorAll('.box');
	for(var i = 0; i < boxes.length; i++){
		if(boxes[i].getAttribute("data-cardid") === IdNumber){
			return boxes[i];
		}
		else{ 
			console.log("did not match " + boxes[i]);
			continue; 
		}
	}
}

function queryActiveCards(e){ //determines which cards have been flipped
	var targetCard = getDataCardId(e);
	var activeCards = [];

	for(var i = 0; i < myMemory.deck.length; i++){
		if(myMemory.deck[i].status === "active"){
			activeCards.push(myMemory.deck[i]);
		}
		else{ continue; }
	}

	if(activeCards.length === 2){
		if(cardsMatch(activeCards)){
			console.log("the cards match");
		}
		else{
			setTimeout(function(){ //so we can see second card for a bit
				clearGrid();
			}, 900);

		}

	}
	if(activeCards.length > 2){
		console.log("ERROR: more than 2 active cards");
		clearGrid();
	}

	return activeCards;
}

function turnOffFade(target1, target2){ //make this less shitty
	var t1 = target1.id.toString();
	var t2 = target2.id.toString(); 

	var card1 = getBoxElemByNumber(t1);
	var card2 = getBoxElemByNumber(t2);
	var url = "url('img/" + target1.type + ".jpg')";

	setCSS(card1, "backgroundImage", url.toString());
	setCSS(card2, "backgroundImage", url.toString());
}


function cardsMatch(activeCards){ //determines if there is a match among flipped cards
	if(activeCards.length !== 2){
		console.log("ERROR: Attempting to matching less than 2 cards");
	}
	if(activeCards[0].type ===  activeCards[1].type){
		console.log("activeCards[0].type = " + activeCards[0].type);
		console.log("activeCards[1].type = " + activeCards[1].type);
		console.log("MATCH DETECTED");

		alert("Congratulations, you matched two " + activeCards[0].type + " cards together!");

		myMemory.gameStatus = "won";
		//give option to begin new game?

		return true;
	}
	else{ 
		console.log("activeCards = " + activeCards);
		console.log("NO MATCH");
		return false;
	}
}


function clearGrid(){
	var boxes = document.querySelectorAll('.box');
	for(var i = 0; i < boxes.length; i++){
		boxes[i].style.background = "";
	}
}


function setCSS(target, property, value){
	var elementStyle = target.style;
	elementStyle[property.toString()] = value.toString();
}