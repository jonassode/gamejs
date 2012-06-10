// Create Director
var Director = new _director_class();

// Namespace
var Index = {
	screen : null,
	menu_screen : null,
	enemies : null,
	temporary_tiles : null
};

// Init
window.onload = function() {
	// Create screen
	Index.screen = _screen("game", {});

	// Create Array
	Index.temporary_tiles = new Array();

	// Create Layers and Objects
	var lb = Index.screen.layer("background");
	lb.node({
		image : 'bg.png'
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
	var player = NODES.player;
	player.tilemap = tm;

	make_map(tm, player);

	// Create Textbox
	var tb = lb.textbox({
		x : 10,
		y : 400,
		cols : 67,
		rows : 5,
		padding : 8,
		text : "Instructions:\nWalk with W,A,S,D. Use space to investigate.",
		bordersize : 3,
		bordercolor : '#CCC',
	});

	// Create Statbox
	var sb = lb.textbox({
		x : 498,
		y : 10,
		cols : 17,
		rows : 40,
		padding : 8,
		text : "LORD ZEDRIK\n-----------\nLevel: {Index.player.level}\nXp: {Index.player.xp} - {Index.player.nextlevel}\n\nAttack: {Index.player.attack}\nDefense: {Index.player.defense}\n\nHp: {Index.player.hp}\nFood: {Index.player.food}\nWater: {Index.player.water}\nWood: {Index.player.wood}\nMp: {Index.player.mp}",
		bordersize : 3,
	});
	Index.stats = sb;

	lb.button({
		x : 571,
		y : 426,
		text : "Spells"
	}).onclick(function() { say('You have no spells.');
	});
	lb.button({
		x : 498,
		y : 426,
		text : "Inventory"
	}).onclick(function() { say('You have nothing.');
	});
	lb.button({
		x : 498,
		y : 446,
		text : "Instructions"
	}).onclick(function() { say("Walk with W,A,S,D.\nSpace to investigate.\nm to show map.\nc to conjure familiar to fight by your side.");
	});
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
	Index.screen.keypress('m', function() {
		Dialog();
	});
	Index.screen.keypress('c', function() {
		if(Index.player.mp >= 30) {
			var tile = Index.player;
			for(var ii = 0; ii < tile.interfaces.length; ii++) {
				var a = tile.interfaces[ii].background();

				if(a != null) {
					if(tile.tilemap.get_tile(a.row, a.col) == null && a.walkable != false) {
						tile.tilemap.place_tile(a.row, a.col, NODES.familiar_placer).onclick(function() {
							this.click()
						});
						temp_tile = tile.tilemap.get_tile(a.row, a.col);
						Index.temporary_tiles[Index.temporary_tiles.length] = temp_tile;
					}
				}
			}
			tile.tilemap.draw();
		} else {
			say('You dont have enough mp. Cost: 30');
		}
	});
	Index.screen.keypress(' ', function() {
		if(player.status == "ALIVE") {
			tm.background(player.row, player.col).space(Index.player);
			Director.end_turn();
		}

	});

	Index.tilemap = tm;
	Index.player = player;
	Index.textbox = tb;

	Preload('cave_floor.gif');
	Preload('cave_stairs.gif');
	Preload('cave_wall.gif');
	Preload('ground_0.gif');
	Preload('ground_1.gif');
	Preload('ground_2.gif');
	Preload('ground_3.gif');
	Preload('ground_4.gif');
	Preload('ground_5.gif');
	Preload('ground_6.gif');
	Preload('ground_7.gif');
	Preload('ground_8.gif');
	Preload('man.gif');
	Preload('town.gif');
	Preload('heart.gif');
	Preload('heart_empty.gif');
	Preload('tree.gif');
	Preload('tree_chopped.gif');
	Preload('tree_empty.gif');
	Preload('water.gif');
	Preload('zombie.gif');
	Preload('bg.png');
	Preload('familiar.gif');
	Preload('familiar_placer.gif');
	Preload('tombstone.gif');

	_load(Index.screen);
	Director.start_game();

};
function fight(actor, monster) {
	var attack = Math.floor(Math.random() * actor.attack + 3);
	monster.hp = monster.hp - attack;

	say_again(actor.name + " attack " + monster.name + " and do " + attack + " damage.");
	if(monster.hp > 0) {
		say_again("Hp left " + monster.hp);
	} else {
		say_again(monster.name + " died");
		if(monster.list != null) {
			monster.list[monster.index] = null;
		}
		monster.hp = 0;
		monster.death();
		var gained_xp = Math.floor(Math.random() * 15 + 10)
		actor.xp = actor.xp + gained_xp;
		say_again(actor.name + " gained " + gained_xp + " xp.");
		if(actor.xp > actor.nextlevel) {
			gain_level(actor);
		}
	}

}

function gain_level(actor) {
	actor.level = actor.level + 1;
	actor.xp = 0;
	actor.nextlevel = actor.nextlevel + Math.floor(actor.nextlevel * 0.2);
	actor.maxhp = actor.maxhp + Math.floor(actor.maxhp * 0.2);
	actor.attack = actor.attack + Math.floor(actor.attack * 0.2);
	actor.defense = actor.defense + Math.floor(actor.defense * 0.2);
	actor.hp = actor.maxhp;

	say_again(actor.name + " gained a Level!");
}

function move(direction) {
	if(player.status == "ALIVE") {
		Index.textbox.text = "";
		var pos = Index.player.get_position_from_direction(direction);
		var dest_bg = Index.tilemap.background(pos.row, pos.col);
		var dest_tile = Index.tilemap.get_tile(pos.row, pos.col);

		if(dest_tile != null) {
			if(dest_tile.object == "monster") {
				fight(Index.player, dest_tile);
				Index.player.moved = true;
				Director.end_turn();
			}

		} else if(dest_bg.walkable != false) {
			Index.player.move(direction);
			Index.player.moved = true;
			Director.end_turn();
		}
	}
}

function say(text) {
	Index.textbox.text = text;
	Index.textbox.draw();
}

function say_again(text) {
	if(Index.textbox.text != "") {
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
	var wall = NODES.wall;
	var heart = NODES.heart;
	var tree = NODES.tree;
	var water = NODES.water;
	var stairs = NODES.stairs;
	var zombie = NODES.zombie;
	var familiar = NODES.familiar;
	var familiar_placer = NODES.familiar_placer;

	// Draw Ground
	for(var i = 0; i < tm.cols; i++) {
		for(var j = 1; j < tm.rows; j++) {
			tm.background(j, i).set_image('ground_' + Math.floor(Math.random() * 9) + '.gif');
			tm.background(j, i).space = function() { say('Nothing of interest here');
			}
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
		tm.place(random_row(tm), random_col(tm), wall);
	}

	for(var i = 0; i < 15; i++) {
		tm.place(random_row(tm), random_col(tm), water);
	}

	// 10 random hearts
	for(var i = 0; i < 10; i++) {

		tm.place(random_row(tm), random_col(tm), heart);

	}

	// Clear list of enemies
	Index.enemies = new Array();

	// Place Zombies On Empty Squares
	for(var i = 0; i < 20; i++) {
		var r = random_row(tm);
		var c = random_col(tm);
		if(tm.background(r, c).walkable != false) {
			tm.place_tile(r, c, zombie);
			add_unit_to_list(tm.get_tile(r, c));
		}
	}

	// Place player on start position,
	tm.background(3, 3).set_image('ground_' + Math.floor(Math.random() * 9) + '.gif').text = "";
	tm.background(3, 3).walkable = true;
	tm.background(3, 3).space = function() { say('Nothing of interest here');
	}
	tm.put_tile(3, 3, player).onclick(function() {say('This is You! Lord Zedrik of the old clan Borg. Zedrik Borg. What a wonderful name for such a wonderful man.')
	});
	// Place stairs on ending position,
	Index.end = tm.place(tm.rows - 3, tm.cols - 3, stairs);

	tm.col = 0;
	tm.row = 0;
	tm.draw();
}

//
function clear_temporary_tiles() {
	var tile
	var tilemap
	for(var i = 0; i < Index.temporary_tiles.length; i++) {
		tile = Index.temporary_tiles[i];
		tilemap = tile.tilemap;
		tile.tilemap.remove(tile.row, tile.col);
	}
	Index.temporary_tiles = new Array();
	if(tilemap != null) {
		tilemap.draw();
	}
}

// Add a unit to the list
// To make them move and die
function add_unit_to_list(tile) {
	var index = Index.enemies.length;
	Index.enemies[index] = tile;
	tile.index = index;
	tile.list = Index.enemies;
}

function _end_of_turn() {

	// Clear Temprary Tiles
	clear_temporary_tiles();

	// Decrease Food and Water
	if(Index.player.moved == true) {
		Index.player.food--;
		Index.player.water--;
		if(Index.player.mp < Index.player.maxmp) {
			Index.player.mp++;
		}
	}
	// Reset moved state
	Index.player.moved = false;

	// Warning if low on food
	if(Index.player.food <= 10) {
		say('You are running low on food. You need to eat very soon.');
	}
	// Water Warning
	if(Index.player.water <= 10) {
		say('You are running low on water. You need to drink very soon.');
	}

	// Check if player died of starvation
	if(Index.player.food <= 0 || Index.player.water <= 0) {
		say('You died a glorious death of starvation and/or thirst. You will be remembered for that.\n\nPlease Refresh to play again.');
		Index.player.death();
	}

	// Check if the player is on the stairs
	if((Index.player.row == Index.end.row) && ((Index.player.col == Index.end.col))) {
		make_map(Index.tilemap, Index.player);
	}

	//
	for(var i = 0; i < Index.enemies.length; i++) {
		if(Index.enemies[i] != null) {
			Index.enemies[i].move();
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