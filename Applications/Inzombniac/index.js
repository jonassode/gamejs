// Create Director
var Director = new _director_class();

// Namespace
var Index = {
	screen : null,
	menu_screen : null
};

// Init
window.onload = function() {
	// Create screen
	Index.screen = _screen("game", {});

	// Create Layers and Objects
	var lb = Index.screen.layer("background");
	lb.node({
		img : 'bg.png'
	});
	// Tile Map

	var tm = lb.tilemap({
		cols : 20,
		rows : 25,
		tilesize : 32,
		x : 10,
		y : 10,
		visiblecols : 15,
		visiblerows : 12,
		col : 0,
		row : 0
	});

	// Creating the player
	var player = tm._tile({
		image : 'man.gif'
	});
	player.tilemap = tm;
	player.hp = 20;
	player.food = 70;
	player.water = 70;
	player.level = 1;
	player.xp = 0;
	player.nextlevel = 100;
	player.moved = false;
	player.attack = 5;
	player.defense = 5;
	player.wood = 0;
	player.name = "You, the Noble Lord Zedrik";
	player.object = "hero";

	make_map(tm, player);

	// Create Textbox
	var tb = lb.textbox({
		x : 10,
		y : 400,
		width : 67,
		height : 5,
		padding : 8,
		text : "Instructions:\nWalk with W,A,S,D. Use space to investigate."
	});

	// Create Statbox
	var sb = lb.textbox({
		x : 498,
		y : 10,
		width : 17,
		height : 44,
		padding : 8,
		text : "LORD ZEDRIK\n-----------\nLevel: {Index.player.level}\nXp: {Index.player.xp}\n\nAttack: {Index.player.attack}\nDefense: {Index.player.defense}\n\nHp: {Index.player.hp}\nFood: {Index.player.food}\nWater: {Index.player.water}\nWood: {Index.player.wood}\n\nEquiptment:\nNone!"
	});
	Index.stats = sb;

	// Register movements
	Index.screen.keypress('w', function() {
		move(_up);
	});
	Index.screen.keypress('s', function() {
		move(_down);
	});
	Index.screen.keypress('a', function() {
		move(_left);
	});
	Index.screen.keypress('d', function() {
		move(_right);
	});
	Index.screen.keypress(' ', function() {
		tm.background(player.row,player.col).space();
		Director.end_turn();
	});

	Index.tilemap = tm;
	Index.player = player;
	Index.textbox = tb;

	Preload('cave_floor.gif');
	Preload('cave_stairs.gif');
	Preload('cave_wall.gif');
	Preload('ground_0.gif');
	Preload('man.gif');
	Preload('town.gif');
	Preload('tree.gif');
	Preload('tree_chopped.gif');
	Preload('tree_empty.gif');
	Preload('water.gif');
	Preload('zombie.gif');
	Preload('bg.png');

	_load(Index.screen);
	Director.start_game();

};

function fight(actor, monster){
	var attack = Math.floor(Math.random() * actor.attack + 3);
	monster.hp = monster.hp - attack;

	say_again(actor.name + " attack " + monster.name + " and do " + attack + " damage.");
	if ( monster.hp > 0 ) {			
		say_again("Hp left " + monster.hp);
	} else {
		say_again(monster.name + " died");
		if ( monster.list != null){
			monster.list[monster.index] = null;
		}
		Index.tilemap.remove(monster.row, monster.col);
		
	}

}

function move(direction){
	Index.textbox.text = "";
	var pos = Index.player.get_position_from_direction(direction);
	var dest_bg = Index.tilemap.background(pos.row, pos.col);
	var dest_tile = Index.tilemap.get_tile(pos.row, pos.col);


	if ( dest_tile != null ) {
		if ( dest_tile.object == "monster" ) {
			fight(Index.player, dest_tile);
			Index.player.moved = true;
			Director.end_turn();
		}

	} else if ( dest_bg.walkable != false ) {
		Index.player.move(direction);
		Index.player.moved = true;
		Director.end_turn();
	}
}

function say(text) {
	Index.textbox.text = text;
	Index.textbox.draw();
}

function say_again(text) {
	if ( Index.textbox.text != ""){
		Index.textbox.text = Index.textbox.text + "\n" + text;
	} else {
		Index.textbox.text = text;
	}
	Index.textbox.draw();
}


function random_row(tm) {
	return (Math.floor(Math.random() * (tm.rows - 6))) + 3;
}

function random_col(tm) {
	return (Math.floor(Math.random() * (tm.cols - 6))) + 3;
}

function make_map(tm, player) {

	tm.clear_tiles();
	tm.all("walkable", null);

	// build tiles
	var wall = tm._tile({
		image : 'cave_wall.gif',
		walkable : false,
	});
	var tree = tm._tile({
		image : 'tree.gif',
	});

	tree.text = "this is a tree";
	tree.state = "NEW";
	tree.space = function(){
		switch(this.state)
		{
		case "NEW":
			Index.player.food = Index.player.food + 20;
			say("You ate the forbidden fruit. You are slightly less hungry.");
			this.set_image('tree_empty.gif');
			this.state = "EMPTY";
			break;
		case "EMPTY":
			Index.player.wood++;
			say("You chopped down the tree with your mighty sword, which is slight less sharp now.");
			this.set_image('tree_chopped.gif');
			this.state = "CHOPPED";
			Index.player.moved = true;
			break;
		default:
			say("What once was a mighty beautiful tree is now just a stubb. A sad old stubb. There is nothign for you here.");
			break;
		}
	}

	var water = tm._tile({
		image : 'water.gif',
	});
	water.text = "this is a pond",
	water.space = function(){
		Index.player.water = 70;
		say("You water from the pond. You are thirsty no more.");
	}

	var stairs = tm._tile({
		image : 'cave_stairs.gif',
	});
	stairs.text = "down we go";
	var zombie = tm._tile({
		image:'zombie.gif',
		walkable:false,
	});
	zombie.defense = 5;
	zombie.attack = 5;
	zombie.hp = 10;
	zombie.object = "monster";
	zombie.name = "Zombie";

	for(var i = 0; i < tm.cols; i++) {
		for(var j = 1; j < tm.rows; j++) {
			tm.background(j, i).set_image('ground_' + Math.floor(Math.random() * 9) + '.gif');
			tm.background(j, i).space = function() { say('Nothing of interest here'); }
		}
	}

	// Build Walls
	for(var i = 0; i < tm.cols; i++) {
		tm.place(0, i, wall);
		tm.place(tm.rows - 1, i, wall);
	}
	for(var j = 0; j < tm.rows; j++) {
		tm.place(j, 0, wall);
		tm.place(j, tm.cols - 1, wall);
	}

	// Place 40 random tiles
	for(var i = 0; i < 40; i++) {

		tm.place(random_row(tm), random_col(tm), tree);
		tm.place(random_row(tm), random_col(tm), water);
		tm.place(random_row(tm), random_col(tm), wall);

	}

	// Clear list of enemies
	Index.enemies = new Array();

	// Place Zombies On Empty Squares
	for(var i = 0; i < 20; i++) {
		var r = random_row(tm);
		var c = random_col(tm);
		if ( tm.background(r,c).walkable != false ) {
			tm.place_tile(r, c, zombie);
			var index = Index.enemies.length;
			Index.enemies[index] = tm.get_tile(r, c);
			tm.get_tile(r,c).index = index;
			tm.get_tile(r,c).list = Index.enemies;
		}
	} 

	// Place player on start position,
	tm.background(3, 3).set_image('ground_' + Math.floor(Math.random() * 9) + '.gif' ).text = "";
	tm.background(3, 3).walkable = true;
	tm.background(3, 3).space = function() { say('Nothing of interest here'); }
	tm.place_tile(3, 3, player).onclick(function() {alert('This is You! Lord Zedrik of the old clan Borg. Zedrik Borg. What a wonderful name.')
	});
	// Place stairs on ending position,
	Index.end = tm.place(tm.rows - 3, tm.cols - 3, stairs);

	tm.col = 0;
	tm.row = 0;
	tm.draw();
}

function move_enemy(actor){
	var direction = null;

	switch(Math.floor(Math.random() * 4))
	{
	case 0:
	  direction = _up;
	  break;
	case 1:
	  direction = _down;
	  break;
	case 2:
	  direction = _left;
	  break;
	case 3:
	  direction = _right;
	  break;
	default:
		_log('bajs');
	}

	var pos = actor.get_position_from_direction(direction);
	var dest_bg = Index.tilemap.background(pos.row, pos.col);
	var dest_tile = Index.tilemap.get_tile(pos.row, pos.col);

	if ( dest_tile != null ) {
		if ( dest_tile.object == "hero" ) {
			fight(actor, dest_tile);
		}
	} else if ( dest_bg.walkable != false ) {
		Index.tilemap.move_tile(pos.row, pos.col, actor);
	}
}

function _end_of_turn() {
	// Decrease Food and Water
	if ( Index.player.moved == true ) {
		Index.player.food--;
		Index.player.water--;
	}
	// Reset moved state
	Index.player.moved = false;


	// Warning if low on food
	if(Index.player.food <= 10){
		say('You are running low on food. You need to eat very soon.');
	}
	// Water Warning
	if( Index.player.water <= 10) {
		say('You are running low on water. You need to drink very soon.');
	}

	// Check if player died fo starvation
	if(Index.player.food <= 0 || Index.player.water <= 0) {
		alert('You died a glorious death of starvation and/or thirst. You will be remembered for that.\n\nPlease Refresh to play again.');
	}

	// Check if the player is on the stairs
	if((Index.player.row == Index.end.row) && ((Index.player.col == Index.end.col))) {
		make_map(Index.tilemap, Index.player);
	}

	//
	for(var i=0; i < Index.enemies.length;i++){
		if ( Index.enemies[i] != null){
			move_enemy(Index.enemies[i]);	
		}
	}

	// Redraw stuff 
	Index.stats.draw();
	Index.tilemap.draw();
}

// Override Methods
function _log(msg) {
	$('#log').val(msg + "\n" + $('#log').val());
}
