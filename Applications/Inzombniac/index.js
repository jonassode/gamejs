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

	// Register Events

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

	var player = tm._tile({
		image : 'man.gif'
	});
	player.tilemap = tm;

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

	// Register movements
	Index.screen.keypress('w', function() {
		player.move(_up);
		Director.end_turn();
	});
	Index.screen.keypress('s', function() {
		player.move(_down);
		Director.end_turn();
	});
	Index.screen.keypress('a', function() {
		player.move(_left);
		Director.end_turn();
	});
	Index.screen.keypress('d', function() {
		player.move(_right);
		Director.end_turn();
	});
	Index.screen.keypress(' ', function() {
		tb.text = tm.backgrounds[player.row][player.col].text;
		tb.draw();
	});

	Index.tilemap = tm;
	Index.player = player;

	_load(Index.screen);

};
function make_map(tm, player) {

	tm.clear_tiles();
	tm.all("walkable", null);

	// build tiles
	var wall = tm._tile({
		image : 'cave_wall.gif',
		walkable : false
	});
	var tree = tm._tile({
		image : 'tree.gif',
		text : "this is a tree"
	})
	var water = tm._tile({
		image : 'water.gif',
		text : "this is a pond"
	})
	var stairs = tm._tile({
		image : 'cave_stairs.gif',
		text : "down we go"
	})

	for(var i = 0; i < tm.cols; i++) {
		for(var j = 1; j < tm.rows; j++) {
			tm.background(j, i).set_image('cave_floor.gif');
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

	// Place 20 random tiles
	for(var i = 0; i < 40; i++) {

		var random_row = function() {
			return (Math.floor(Math.random() * (tm.rows - 6))) + 3;
		}
		var random_col = function() {
			return (Math.floor(Math.random() * (tm.cols - 6))) + 3;
		}
		_log(random_row(), random_col());
		tm.place(random_row(), random_col(), tree);
		tm.place(random_row(), random_col(), water);
		tm.place(random_row(), random_col(), wall);

	}

	// Place player on start position,
	tm.background(3, 3).set_image('cave_floor.gif').text = "";
	tm.place_tile(3, 3, player).onclick(function() {alert('test')
	});
	// Place stairs on ending position,
	Index.end = tm.place(tm.rows - 3, tm.cols - 3, stairs);

	tm.col = 0;
	tm.row = 0;
	tm.draw();
}

function _end_of_turn() {
	if((Index.player.row == Index.end.row) && ((Index.player.col == Index.end.col))) {
		make_map(Index.tilemap, Index.player);
	}
}

// Override Methods
function _log(msg) {
	$('#log').val(msg + "\n" + $('#log').val());
}