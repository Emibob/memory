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

/**********
CARD OBJECT
**********/
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


/**********
GRID OBJECT
**********/
var Grid = function Grid(dimensions){
	this.rows = dimensions[0];
	this.columns = dimensions[1];
}

Grid.prototype.build = function(){
	var deck = [];
	var totalBoxes = parseInt(this.rows) * parseInt(this.columns);
	var gridList = document.getElementById("grid");

	this.removeGrid(); //if we have a leftover grid, remove it before building a new one
		
	for(var i = 0; i < totalBoxes; i++){

		var cardBuilt = new Card("inactive", i); //create a new, inactive card
		cardBuilt.setType(); //randomly set the new card's type

		gridList.appendChild(cardBuilt.physicalCard()); //add the card elements to the grid

		deck.push(cardBuilt); //compile a deck array
	}

	this.setWidth(); //set width of grid container dynamically

	//maybe this can be wrapped into a init starter deck function:
	myMemory.deck = deck;
	resetGameStats();
};

Grid.prototype.setWidth = function(){
	var gridList = document.getElementById("grid");
	var x = (this.columns * 100); //TODO: see if we can remove extra 60px
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

function resetGameStats(numberTurns){
	myMemory.turnsRemaining = numberTurns || 6;
	myMemory.message = "";
	myMemory.wonGames = myMemory.wonGames || 0;
	myMemory.totalGames = myMemory.totalGames || 0;
	myMemory.gameStatus = "in play";
}

function updateStats(){ //this updates myMemory values on each click
	myMemory.turnsRemaining -= 1;

	//REFACTOR
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

function promptNewGame(){//change this name
	setTimeout(function(){ //delay clearing the old grid so we can see the match for a bit
		Grid.prototype.removeGrid();
	}, 900);

	var grid = document.getElementById('grid');

	//disables user from continuing to play
	grid.removeEventListener('click', queryActiveCards, false);
	grid.removeEventListener('click', revealCard, false);
	grid.removeEventListener('click', fadeOutCard, false);
	grid.removeEventListener('click', updateStats, false);
}

function buildGrid(){ //maybe rename to avoid confusion with object method
	var dimensions = getGridDimensions();
	var newGrid = new Grid(dimensions);
	newGrid.build();

	var grid = document.getElementById('grid');

	grid.addEventListener('click', queryActiveCards, false);
	grid.addEventListener('click', revealCard, false);
	grid.addEventListener('click', fadeOutCard, false);
	grid.addEventListener('click', updateStats, false);
}

function getGridDimensions(){
	var rows = document.getElementById("numberRows").value || 4;
	var columns = document.getElementById("numberColumns").value || 4;

	return [rows, columns]; 
}

function getDataCardId(e){
	var dataCardId = e.toElement.attributes['data-cardid'].nodeValue;
	return dataCardId;
}

function revealCard(e){
	var card = e.target;
	var cardId = getDataCardId(e);
	var cardShape = myMemory.deck[cardId].type;
	
	toggleCardStatus(myMemory.deck[cardId].status, cardId); //change the toggle function to accept diff args

	var url = "url('img/" + cardShape + ".jpg')";
	setCSS(card, "backgroundImage", url);
}

function toggleCardStatus(cardStats, cardId){ //REFACTOR so it's an actual toggle rather than setting hardcoded value
	var targetedCard = myMemory.deck[cardId];

	if(cardStats === "inactive"){
		targetedCard.status = "active";
	}
	else{
		targetedCard.status = "inactive";
	}
}

function fadeOutCard(e){ //rename - deactivate?
	var cardsActive = queryActiveCards(e); //find all active cards
	//console.log("there are " + cardsActive.length + " active cards: ");
	
	if(cardsActive.length === 1){
		//do nothing
	}
	if(cardsActive.length === 2){
		setTimeout(function(){
			toggleCardStatus("active", cardsActive[0].id.toString());
			toggleCardStatus("active", cardsActive[1].id.toString()); //change the toggle function args
		}, 900);
	}
	else if(myMemory.gameStatus === "won"){
		setTimeout(function(){
			turnOffFade(cardsActive[0], cardsActive[1]);
		}, 300); //UGH this sucks
	}
}

function getBoxElemByNumber(IdNumber){
	var boxes = document.querySelectorAll('.box');
	for(var i = 0; i < boxes.length; i++){
		if(boxes[i].getAttribute("data-cardid") === IdNumber){
			return boxes[i];
		}
		else{ continue; }
	}
}

function queryActiveCards(e){ //returns active cards, clears grid if 2 actives do not match (REFACTOR)
	var activeCards = [];

	for(var i = 0; i < myMemory.deck.length; i++){
		if(myMemory.deck[i].status === "active"){
			activeCards.push(myMemory.deck[i]);
		}
		else{ continue; }
	}

	if(activeCards.length === 2){ //Break out into new function / we're getting this in fadeOutCard
		if(cardsMatch(activeCards)){
			console.log("the cards match");
		}
		else{ //What does this have to do with querying active cards? Move this out
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

function turnOffFade(target1, target2){ 
	// Takes 2 cards (inpractice, the last 2 active),
	// Sets their background image according to their type. 
	// Use this function to refactor the revealCard function? 
	// Rename

	var t1 = target1.id.toString();//better check w/ error messages pls
	var t2 = target2.id.toString();//better check w/ error messages pls

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
		console.log("MATCH DETECTED: Congratulations, you matched two " + activeCards[0].type + " cards together!");

		myMemory.gameStatus = "won";
		return true;
	}
	else{ 
		console.log("These cards do not match");
		return false;
	}
}


function clearGrid(){
	var boxes = document.querySelectorAll('.box');
	for(var i = 0; i < boxes.length; i++){
		boxes[i].style.background = ""; //um is this actually working, it's just background not backgroundImage
	}
}


function setCSS(target, property, value){
	var elementStyle = target.style;
	elementStyle[property.toString()] = value.toString();
}