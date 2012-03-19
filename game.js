// Dependencies
if( typeof jQuery == 'undefined') {
	alert('Warning!\njQuery is not loaded.\nAs of version 0.010 game.js requires jQuery\nPlease add a call to jQuery in your website and reload page.');
}
/**
 * GAMEJS - A set of objects used for creating board games in the html5 canvas object
 *
 * @public
 * @name GAMEJS
 * @namespace GAMEJS
 */
var GAMEJS = {}

// Globals
GAMEJS.scripts = document.getElementsByTagName("script");
GAMEJS.gamejs_folder = (GAMEJS.scripts[GAMEJS.scripts.length - 1].src).replace("game.js", "");
var _visible_screen = null;
var _id_list = new Array();
var _id_hash = {};
var _images = new Array();
var _preloading_screen = null;
var _first_screen = null;

/**
 * GAMEJS.Alpha - A set of methods for holding the letters of the printable alphabet,
 * Used by textboxes when text is written
 *
 * @public
 * @name GAMEJS.Alpha
 * @namespace GAMEJS.Alpha
 */
GAMEJS.Alpha = {}
GAMEJS.Alpha.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ:!.,1234567890-_'?/[]()\"";
GAMEJS.Alpha.letters = {};
GAMEJS.Alpha.letter_padding = 2;
GAMEJS.Alpha.letter_width = 5 + GAMEJS.Alpha.letter_padding;
// Including Padding
GAMEJS.Alpha.letter_height = 8 + GAMEJS.Alpha.letter_padding;
// Including Padding

/**
 *  GAMEJS.Alpha.load() - Load the alphabet
 *
 * @public
 * @static
 * @function
 */
GAMEJS.Alpha.load = function() {
	var letter_image;
	for(var counter = 0; counter < this.alphabet.length; counter++) {
		switch(this.alphabet[counter])
		{
		case "?":
		  letter_image = "_question_mark.gif";
		  break;
		case "/":
		  letter_image = "_slash.gif";
		  break;
		default:
		  letter_image = this.alphabet[counter] + ".gif";
		}		
		
		this.letters[this.alphabet[counter]] = new Image();
		this.letters[this.alphabet[counter]].src = GAMEJS.gamejs_folder + "Images/" + letter_image;
		_images[_images.length] = this.letters[this.alphabet[counter]];
	}
}
// Directions
var _up = {
	row : -1,
	col : 0
};
var _down = {
	row : 1,
	col : 0
};
var _left = {
	row : 0,
	col : -1
};
var _right = {
	row : 0,
	col : 1
};

// Classes

/**
 * Object for Doing Player Stuff.
 *
 * @public
 * @name GAMEJS.Player
 * @namespace GAMEJS.Player
 */
function _player_class(attributes) {
	this.name = (attributes.name || "guest");
	this.status = "ACTIVE"
	this.resources = new Array();

	/**
	 *  bla bla
	 *
	 * @public
	 * @static
	 * @function
	 * @param resource            bla bla
	 */
	this.add_resource = function(resource) {
		this.resources[this.resources.length] = jQuery.extend(true, {}, resource);
	}

	this.kill = function() {
		this.status = "INACTIVE"
	}

	this.get_resources = function(type) {
		var a = new Array
		for(var r in this.resources) {
			if(this.resources[r].type == type) {
				a[a.length] = this.resources[r];
			}
		}
		return a
	}

	this.pop_resource = function() {
		return this.resources.splice(0, 1)[0];
	}

	this.kill_resource = function() {
		return this.resources.splice(0, 1)[0];
	}
}

function _director_class() {
	this.players = new Array();
	this.current_player = null;

	this.add_player = function(attributes) {
		var p = new _player_class(attributes);

		this.players[this.players.length] = p;

		if(this.current_player == null) {
			this.current_player = p;
		}

		return p
	}

	this.draw_player_list = function() {
		var html = ""
		for(var p in this.players) {
			if(this.players[p].name == this.current_player.name) {
				html = html + "* "
			}
			html = html + this.players[p].name + "<br>";
		}
		$('#player_list').html(html)

	}

	this.end_turn = function() {
		// End Of Turn Moves
		_end_of_turn();
		// Change To Next Player
		for(var p in this.players) {
			if(this.players[p].name == this.current_player.name) {
				var next_player = parseInt(p) + 1;
				if(next_player < this.players.length) {
					this.current_player = this.players[next_player]
				} else {
					this.current_player = this.players[0]
				}
				break
			}
		}
		this.draw_player_list();
		// Beginning Of Turn Moves
		_beginning_of_turn();

	}

	this.start_game = function() {
		this.draw_player_list();
		_start_game();
		_beginning_of_turn();
	}

	this.end_game = function(message) {
		alert(message);
		_end_game();
	}

	this.player = function(name) {
		var player = null;

		for(var p in this.players) {
			if(this.players[p].name == name) {
				player = this.players[p];
				break;
			}
		}
		return player;
	}
}

function _beginning_of_turn() {
	// Does Nothing
	// Player Can Override This
}

function _end_of_turn() {
	// Does Nothing
	// Player Can Override This
}

function _start_game() {
	// Does Nothing
	// Player Can Override This
}

function _end_game() {
	// Does Nothing
	// Player Can Override This
}

function Library() {
	this.list = new Array();

	this.length = function() {
		return this.list.length;
	}

	this.add_resource = function(resource, amount) {
		for( i = 0; i < amount; i++) {
			this.list[this.list.length] = jQuery.extend(true, {}, resource);
		}

	}

	this.item = function(i) {
		return this.list[i]
	}

	this.shuffle = function() {
		for(var i = 0; i < this.list.length; i++) {
			var randomnumber = Math.floor(Math.random() * this.list.length)
			var temp
			temp = this.list[i]
			this.list[i] = this.list[randomnumber]
			this.list[randomnumber] = temp
		}
	}

	this.pop = function() {
		return this.list.splice(0, 1)[0];
	}
}

// Hardcoded right now but should be based on Board Type (square, hex, node)
function getDirBasedOnDirection(direction) {
	var hash = {};
	hash["W"] = "E";
	hash["E"] = "W";
	hash["N"] = "S";
	hash["S"] = "N";
	return hash[direction];
}

// Hardcoded right now but should be based on Board Type (square, hex, node)
function getRowBasedOnDirection(direction) {
	var hash = {};
	hash["W"] = 0;
	hash["E"] = 0;
	hash["N"] = -1;
	hash["S"] = 1;
	return hash[direction];
}

// Hardcoded right now but should be based on Board Type (square, hex, node)
function getColBasedOnDirection(direction) {
	var hash = {};
	hash["W"] = -1;
	hash["E"] = 1;
	hash["N"] = 0;
	hash["S"] = 0;
	return hash[direction];
}

function Interface(attributes) {
	this.type = (attributes.type || null);
	this.parent = (attributes.parent || null);
	this.direction = (attributes.direction || null);

	// Should return the interface of the connected node
	this.tile_interface = function() {

		var x = this.parent.row + getRowBasedOnDirection(this.direction);
		var y = this.parent.col + getColBasedOnDirection(this.direction);
		var o = getDirBasedOnDirection(this.direction);
		if(this.parent.tilemap.tiles[x] != null && this.parent.tilemap.tiles[x][y] != null) {
			return this.parent.tilemap.tiles[x][y].intf(o);
		} else {
			return null;
		}
	}

	this.background = function() {

		var x = this.parent.row + getRowBasedOnDirection(this.direction);
		var y = this.parent.col + getColBasedOnDirection(this.direction);
		if(this.parent.tilemap.backgrounds[x] != null && this.parent.tilemap.backgrounds[x][y] != null) {
			return this.parent.tilemap.backgrounds[x][y];
		} else {
			return null;
		}
	}
}

function Resource(attributes) {
	this.type = (attributes.type || "stuff");
	this.image = (attributes.image || "");
	this.name = (attributes.name || "stuff");
	this.interfaces = (attributes.interfaces || null);

	this.interfaces = []
	if(attributes.interfaces != null) {
		for(var i = 0; i < attributes.interfaces.length; i++) {
			this.interfaces[this.interfaces.length] = new Interface(attributes.interfaces[i]);
			this.interfaces[this.interfaces.length - 1].parent = this;
		}
	}
	this.intf = function(direction) {
		var intf = null;
		if(this.interfaces != null) {
			for(var i = 0; i < this.interfaces.length; i++) {
				if(this.interfaces[i].direction == direction) {
					intf = this.interfaces[i];
				}
			}
		}
		return intf;
	}
}

function _layer_class(layer_name) {
	// Attributes
	this.id = _generate_id("l");
	this.name = layer_name;
	this.visible = true;
	this.nodes = new Array();
	this.tilemaps = new Array();
	this.lables = new Array();
	this.textboxes = new Array();
	this.buttons = new Array();

	// Add Layer to Id Hahs
	_id_hash[this.id] = this

	// Functions
	// Draws all nodes in the layer on Canvas
	// Returns self-reference
	this.draw = function() {
		for(var ni = 0; ni < this.nodes.length; ni++) {
			this.nodes[ni].draw();
		}
		for(var tmi = 0; tmi < this.tilemaps.length; tmi++) {
			this.tilemaps[tmi].draw();
		}
		for(var li = 0; li < this.lables.length; li++) {
			this.lables[li].draw();
		}
		for(var tbi = 0; tbi < this.textboxes.length; tbi++) {
			this.textboxes[tbi].draw();
		}
		for(var bbi = 0; bbi < this.buttons.length; bbi++) {
			this.buttons[bbi].draw();
		}

		return this;
	};
	// Toggles Visibility
	// Returns self-reference
	this.toggle = function() {
		if(this.visible == true) {
			this.visible = false;
		} else {
			this.visible = true;
		}
		return this;
	};
	// Create a node
	this.node = function(attributes) {
		var n = new _node_class(attributes);
		n.layer = this;
		this.nodes[this.nodes.length] = n;
		return n;
	};
	// Create a lable
	this.lable = function(attributes) {
		var l = new _lable_class(attributes);
		l.layer = this;
		this.lables[this.lables.length] = l;
		return l;
	};
	// Create a textbox
	this.textbox = function(attributes) {
		var tb = new _textbox_class(attributes);
		tb.layer = this;
		this.textboxes[this.textboxes.length] = tb;
		return tb;
	};
	// Create a button
	this.button = function(attributes) {
		var button = new _button_class(attributes);
		button.layer = this;
		this.buttons[this.buttons.length] = button;
		return button;
	};
	// Create a tilemap
	this.tilemap = function(attributes) {
		var tm = new _tilemap_class(attributes);
		tm.layer = this;
		tm.all('layer', this);
		tm.all('type', 'background');
		this.tilemaps[this.tilemaps.length] = tm;
		return tm;
	};
}

// Position Class
function _position(row, col) {
	this.row = row;
	this.col = col;
}

// Node Class
function _node_class(attributes) {
	this.id = _generate_id("n");
	_id_hash[this.id] = this
	if(attributes.image != null) {
		this.type = 'image';
		this.image = new Image();
		this.image.src = attributes.image;
		_images[_images.length] = this.image;
	} else {
		this.type = 'block';
	}

	this.setInterfaces = function(interfaces) {
		for(var i = 0; i < interfaces.length; i++) {
			this.interfaces[i] = new Interface(interfaces[i]);
			this.interfaces[i].parent = this;
		}
	}
	// Default Interfaces
	var interfaces = [{
		direction : "N"
	}, {
		direction : "E"
	}, {
		direction : "S"
	}, {
		direction : "W"
	}];

	this.onclick_event = null;
	this.x = (attributes.x || 0);
	this.y = (attributes.y || 0);
	this.width = (attributes.width || null);
	this.height = (attributes.height || null);
	this.color = (attributes.color || '#000');
	this.interfaces = []
	if(attributes.interfaces != null) {
		this.setInterfaces(attributes.interfaces);
	} else {
		this.setInterfaces(interfaces);
	}
	if(attributes.walkable != null) {
		this.walkable = attributes.walkable;
	} else {
		this.walkable = true;
	}

	// Draws the node on canvas
	// Returns self-reference
	this.draw = function() {
		if(this.type == 'block') {
			this.layer.screen.context.fillStyle = this.color;
			this.layer.screen.context.fillRect(this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety, this.width, this.height);
		} else if(this.type == 'image' || this.type == 'tile' || this.type == 'background') {
			if(this.height != null && this.width != null && this.image != null) {
				var xstart = this.x + this.layer.screen.offsetx + ((this.tilemap.tilewidth - this.width) / 2 ) ;
				var width = this.width;
				var ystart;
				if (this.type == 'tile' ){
					ystart = this.y + this.layer.screen.offsety - (this.height - this.tilemap.tileheight);
				} else {
					ystart = this.y + this.layer.screen.offsety;
				}
				var height = this.height;
				this.layer.screen.context.drawImage(this.image, xstart, ystart, width, height);

			} else if(this.image != null) {
				this.layer.screen.context.drawImage(this.image, this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety);
			}
		}
		return this;
	};

	this.set = function(attribute, value) {
		this[attribute] = value;
	}

	this.get_position_from_direction = function(direction) {
		var y = this.row;
		var x = this.col;
		// Calculate New Direction
		var newrow = y + direction.row;
		var newcol = x + direction.col;

		return new _position(newrow, newcol);
	}
	// Movement
	this.move = function(direction) {
		if(this.type == 'tile') {
			// Set direction
			this.direction = direction;

			var y = this.row;
			var x = this.col;

			var pos = this.get_position_from_direction(direction);

			if(!(pos.row < 0) && !(pos.col < 0) && !(pos.row >= this.tilemap.rows) && !(pos.col >= this.tilemap.cols)) {

				this.tilemap.move_tile(pos.row, pos.col, this);

				//
				var newtilemaprow = this.tilemap.row + direction.row;
				var newtilemapcol = this.tilemap.col + direction.col;
				var centerrow = Math.round(this.tilemap.visiblerows / 2);
				var centercol = Math.round(this.tilemap.visiblecols / 2);
				var tilepositionrow = (y - this.tilemap.row + 1);
				var tilepositioncol = (x - this.tilemap.col + 1);

				if(!(newtilemaprow < 0) && !(newtilemaprow > (this.tilemap.rows - this.tilemap.visiblerows)) && (tilepositionrow == centerrow)) {
					this.tilemap.row = newtilemaprow;
				}
				if(!(newtilemapcol < 0) && !(newtilemapcol > (this.tilemap.cols - this.tilemap.visiblecols)) && (tilepositioncol == centercol)) {
					this.tilemap.col = newtilemapcol;
				}
			}
		}
	}

	this.intf = function(direction) {
		var intf = null;
		if(this.interfaces != null) {
			for(var i = 0; i < this.interfaces.length; i++) {
				if(this.interfaces[i].direction == direction) {
					intf = this.interfaces[i];
				}
			}
		}
		return intf;
	}

	this.onclick = function(onclick_function) {
		// Add tile to list of clickable objects on screen
		this.layer.screen.clickable_objects[this.layer.screen.clickable_objects.length] = this;
		// Register function for this tiles onlick event
		this.onclick_event = onclick_function;
		return this;
	}
	// Updates the Image of the Node
	//  src: Path to image or null if you want to remove the image
	// Usage
	// Index.board.background(j,i).set_image('images/background.png')
	// Returns self-reference
	this.set_image = function(src) {
		if(src != null) {
			this.image = new Image();
			this.image.src = src;
		} else {
			this.image = null;
		}
		return this;
	}

	this.distance_to = function(tile) {
		var distance = 0;

		if(this.row > tile.row) {
			distance = this.row - tile.row;
		} else {
			distance = tile.row - this.row;

		}

		if(this.col > tile.col) {
			distance += this.col - tile.col;
		} else {
			distance += tile.col - this.col;

		}
		return distance;
	}

	this.direction_to = function(tile) {
		var direction = null;
		var horizontal_distance = 0;
		var horizontal_direction = null;
		var vertical_distance = 0;
		var vertical_direction = null;

		if(this.row == tile.row) {
			horizontal_distance = 0;
			horizontal_direction = null;
		} else if(this.row > tile.row) {
			horizontal_distance = this.row - tile.row;
			horizontal_direction = _up;
		} else {
			horizontal_distance = tile.row - this.row;
			horizontal_direction = _down;
		}

		if(this.col == tile.col) {
			vertical_distance = 0;
			vertical_direction = null;
		} else if(this.col > tile.col) {
			vertical_distance = this.col - tile.col;
			vertical_direction = _left
		} else {
			vertical_distance = tile.col - this.col;
			vertical_direction = _right
		}

		if(vertical_distance == horizontal_distance) {
			// Should be random
			switch(Math.floor(Math.random() * 2)) {
				case 0:
					direction = vertical_direction;
					break;
				case 1:
					direction = horizontal_direction;
					break;
			}

		} else if(vertical_distance > horizontal_distance) {
			direction = vertical_direction;
		} else {
			direction = horizontal_direction;
		}

		return direction;
	}
}

function _log(msg) {
	//
}

// ENUM VALUES FOR DIALOGS
// TEXT Displays Text and a OK button to close the frame
// input : should be a string
GAMEJS.TEXT = 1;
// ASK Displays Text and
GAMEJS.ASK = 2;
GAMEJS.DISPLAY = 3;
GAMEJS.CUSTOM = 4;

function _dialog_class(attributes) {
	this.canvas = (attributes.canvas || _visible_screen.canvas);
	this.screen_name = (attributes.screen_name || "dialog");
	this.width = (attributes.width || this.canvas.width - 40);
	this.height = (attributes.height || this.canvas.height - 40);

	this.screen = _screen(_visible_screen.canvas_name, {
		offsetx : (20),
		offsety : (20),
		width : this.width,
		height : this.height,
		name : this.screen_name,
	});

	// Create Default Layer
	// This can be overrided with function 'override_layer'
	this.layer = this.screen.layer("background");
	this.layer.node({
		image : GAMEJS.gamejs_folder + "Images/dialog_background.png",
		width : width,
		height : height,
	});

	// Override Layer
	this.override_layer = function(layer) {
		this.default_layer = layer;
	}

	this.button = function(x, y, text, callback) {
		this.layer.button({
			x : x,
			y : y,
			text : text
		}).onclick(callback);
	}

	this.center = function() {
		return (this.width / 2);
	}
	return this;
}

function Dialog(type, input, attributes) {

	if(attributes == null) {
		attributes = {};
	}

	// Create Dialog
	var dialog = _dialog_class(attributes);

	if(type == GAMEJS.TEXT) {
		// Create Text
		dialog.layer.textbox({
			x : 10,
			y : 10,
			cols : (dialog.width - 30) / GAMEJS.Alpha.letter_width,
			rows : (dialog.height - 50) / GAMEJS.Alpha.letter_height,
			padding : 5,
			bordersize : 1,
			text : input
		});

		// Create Button
		dialog.button(dialog.width - 55, dialog.height - 25, "Close", function() {
			this.layer.screen.close();
		});
	}

	// Draw screen and return dialog
	dialog.screen.draw();
	return dialog;
}

function _screen_class(canvas_name, attributes) {
	// Attributes
	this.id = _generate_id("s");
	this.name = (attributes.name || "Screen");
	this.layers = new Array();
	this.canvas = document.getElementById(canvas_name);
	this.canvas_name = canvas_name;
	this.context = this.canvas.getContext("2d");
	this.keypresses = {};
	this.clickable_objects = new Array();
	this.previous_screen = null;

	this.offsetx = (attributes.offsetx || 0);
	this.offsety = (attributes.offsety || 0);
	this.width = (attributes.width || this.canvas.width);
	this.height = (attributes.height || this.canvas.height);

	// Add screen to Object Hash
	_id_hash[this.id] = this

	// Builds a Layer
	// Returns reference to new layer
	this.layer = function(layer_name) {
		var l = new _layer_class(layer_name);
		this.layers[this.layers.length] = l;
		this._default_layer = l;
		l.screen = this;
		return l
	}
	// Draws all the visible layers of the screen
	// Returns self-reference
	this.draw = function() {
		this.context.clearRect(this.offsetx, this.offsety, this.width, this.height);
		for(var li = 0; li < this.layers.length; li++) {
			if(this.layers[li].visible == true) {
				this.layers[li].draw();
			}
		}
		this.previous_screen = _visible_screen;
		_visible_screen = this;
		return this;
	};
	// Registers a key press event to the screen
	// Returns self-reference
	this.keypress = function(character, func) {
		var charUpperCase = character.toUpperCase()
		this.keypresses[charUpperCase] = func;
		return this;
	};

	this.close = function() {
		_visible_screen = this.previous_screen;
		_visible_screen.draw();
	}
}

function _lable_class(attributes) {
	this.x = (attributes.x || 0);
	this.y = (attributes.y || 0);
	this.text = (attributes.text || "");
	this.font = (attributes.font || '12px sans-serif');
	this.color = (attributes.color || '#000');
	this.baseline = (attributes.baseline || 'top');

	this.draw = function() {
		var context = this.layer.screen.context;
		context.fillStyle = this.color;
		context.font = this.font;
		context.textBaseline = this.baseline;
		context.color = this.color;
		context.fillText(this.text, this.x, this.y);
	}
}

function _button_class(attributes) {
	var button = new _textbox_class(attributes);
	button.bordersize = (attributes.bordersize || 1);
	button.padding = (attributes.padding || 5);
	button.color = (attributes.color || '#444');

	button.onclick = function(onclick_function) {
		this.layer.screen.clickable_objects[this.layer.screen.clickable_objects.length] = this;
		// Register function for this tiles onlick event
		this.onclick_event = onclick_function;
		return this;
	}
	return button;
}

function _textbox_class(attributes) {
	this.padding = (attributes.padding || 3);
	this.x = (attributes.x || 0);
	this.y = (attributes.y || 0);
	this.text = (attributes.text || "");
	this.cols = (attributes.cols || this.text.length || 1);
	this.color = (attributes.color || '#000');
	this.rows = (attributes.rows || 1);

	this.width = (attributes.width || null);
	this.height = (attributes.height || null);
	this.bordersize = (attributes.bordersize || 0);
	this.bordercolor = (attributes.bordercolor || '#FFF');
	this.image = null;

	// Load Image
	if (attributes.image != null){
		this.image = new Image();
		this.image.src = attributes.image;
	}

	this.draw = function() {
		var x = this.x + this.layer.screen.offsetx;
		var y = this.y + this.layer.screen.offsety;
		var imgx = 0;
		var imgy = 0;
		var row = 0;
		var col = 0;
		var character = null;
		var img = null;
		var word = null;
		this.width = (this.width || ((this.cols * GAMEJS.Alpha.letter_width) + (this.padding * 2) - GAMEJS.Alpha.letter_padding));
		this.height = (this.height || ((this.rows * GAMEJS.Alpha.letter_height) + (this.padding * 2) - GAMEJS.Alpha.letter_padding));

		if(this.bordersize > 0) {
			this.layer.screen.context.fillStyle = this.bordercolor;
			this.layer.screen.context.fillRect(x, y, this.width, this.height);
			this.layer.screen.context.fillStyle = this.color;
			this.layer.screen.context.fillRect(x + this.bordersize, y + this.bordersize, this.width - (this.bordersize * 2), this.height - (this.bordersize * 2));
		} else {
			this.layer.screen.context.fillStyle = this.color;
			this.layer.screen.context.fillRect(x, y, this.width, this.height);
		}
		
		// Draw background image
		if (this.image != null){
			this.layer.screen.context.drawImage(this.image, this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety, this.width, this.height);
		}

		if(this.text != null && this.text != undefined) {

			var temp_text = this.text.replace(/\n/g, " \n ");
			var words = temp_text.toString().split(/[ ]/);

			for(var wi = 0; wi < words.length; wi++) {
				word = words[wi];

				// Evaluate Parameters
				if(word[0] == "{") {
					var parameter_name = "";
					var temp_counter = 1;
					while(word[temp_counter] != "}" && temp_counter < word.length) {
						parameter_name = parameter_name + word[temp_counter];
						temp_counter = temp_counter + 1;
					}
					try {
					  var evaluated_value = eval(parameter_name);
					}
					catch(err){
					   _log(err);
					}
					if ( evaluated_value === undefined){
						_log("Could not evaluate parameter" + word );
						word = "";
					} else {
						word = "" + evaluated_value;
					}
				}

				// Check if we want to move to next row
				if(word.length + col > this.cols) {
					row = row + 1;
					col = 0;
				}

				// Print Character By Character
				for(var counter = 0; counter < word.length; counter++) {
					character = word[counter];
					switch(character) {
						// Move Down One Row on Carriage Return
						case "\n":
							row = row + 1;
							col = 0;
							break;
						default:
							character = character.toUpperCase();
							imgx = x + this.padding + (col * GAMEJS.Alpha.letter_width);
							imgy = y + this.padding + (row * GAMEJS.Alpha.letter_height);
							img = GAMEJS.Alpha.letters[character];
							if(img != null) {
								this.layer.screen.context.drawImage(img, imgx, imgy);
								//Move To Next Letter
								col = col + 1;
							} else {
								_log('Tried to write character ' + character + ' which is not supported.');
							}
							break;
					}
				}
				// Move A Space Between Each Words
				// But don't do this on the first column, because this is after a line break
				if(col != 0) {
					col = col + 1;
				}
			}
		}
	}
}

function _tilemap_class(attributes) {
	this.id = _generate_id("tm");
	_id_hash[this.id] = this
	if(attributes.cols != null) {
		this.cols = attributes.cols;
	}
	if(attributes.rows != null) {
		this.rows = attributes.rows;
	}
	if(attributes.visiblecols != null) {
		this.visiblecols = attributes.visiblecols;
	} else {
		this.visiblecols = this.cols;
	}
	if(attributes.visiblerows != null) {
		this.visiblerows = attributes.visiblerows;
	} else {
		this.visiblerows = this.rows;
	}
	if(attributes.col != null) {
		this.col = attributes.col;
	} else {
		this.col = 0;
	}
	if(attributes.row != null) {
		this.row = attributes.row;
	} else {
		this.row = 0;
	}
	if(attributes.rows != null) {
		this.rows = attributes.rows;
	}
	if(attributes.tilewidth != null) {
		this.tilewidth = attributes.tilewidth;
	}
	if(attributes.tileheight != null) {
		this.tileheight = attributes.tileheight;
	}
	if(attributes.tilesize != null) {
		this.tilewidth = attributes.tilesize;
		this.tileheight = attributes.tilesize;
	}
	if(attributes.x != null) {
		this.x = attributes.x;
	} else {
		this.x = 0;
	}
	if(attributes.y != null) {
		this.y = attributes.y;
	} else {
		this.y = 0;
	}

	// Creating Tiles Array
	var row;
	this.tiles = new Array(this.rows);
	for( row = 0; row < this.rows; row++) {
		this.tiles[row] = new Array(this.cols);
	}

	this.backgrounds = new Array(this.rows);
	for( row = 0; row < this.rows; row++) {
		this.backgrounds[row] = new Array(this.cols);
		// Place a Tile on Each Background Board
		for( col = 0; col < this.cols; col++) {
			this.backgrounds[row][col] = new _node_class({});
			this.backgrounds[row][col].row = row;
			this.backgrounds[row][col].col = col;
			this.backgrounds[row][col].tilemap = this;

		}
	}

	this.all = function(attribute, value) {
		for( row = 0; row < this.rows; row++) {
			for( col = 0; col < this.cols; col++) {
				this.backgrounds[row][col][attribute] = value;
			}
		}
	}

	this.clear_tiles = function() {
		var row, col;
		for( row = 0; row < this.rows; row++) {
			for( col = 0; col < this.cols; col++) {
				this.remove(row, col);
			}
		}
	}

	this.all_onclick = function(func) {
		for( row = 0; row < this.rows; row++) {
			for( col = 0; col < this.cols; col++) {
				this.backgrounds[row][col].onclick(func);
			}
		}
	}
	// Moves a Tile from one square to another
	this.move_tile = function(row, col, tile) {
		this.tiles[tile.row][tile.col] = null
		this.tiles[row][col] = tile;
		tile.row = row
		tile.col = col
		return tile;
	}
	// Creates a tile and places it on the tilemap
	this.tile = function(row, col, attributes) {
		var tile = this._tile(attributes);
		tile.row = row;
		tile.col = col;
		tile.tilemap = this;
		this.tiles[row][col] = tile;
		return tile;
	}
	// Places a specified tile ( NOT A COPY OF IT ) on the tilemap
	this.put_tile = function(row, col, tile) {
		tile.layer = this.layer;
		tile.row = row;
		tile.col = col;
		tile.tilemap = this;
		this.tiles[row][col] = tile;
		return tile;
	}
	// Places a copy of a specified tile on the tilemap
	this.place_tile = function(row, col, original_tile) {
		var tile = jQuery.extend(true, {}, original_tile);
		tile.layer = this.layer;
		tile.id = _generate_id("n");
		// Why are we doing this?
		original_tile.row = row;
		original_tile.col = col;
		tile.row = row;
		tile.col = col;
		tile.tilemap = this;
		this.tiles[row][col] = tile;
		return tile;

	}
	// Create A tile object ( but does not place it on the map )
	this._tile = function(attributes) {
		var tile = new _node_class(attributes);
		tile.layer = this.layer;
		tile.type = 'tile';
		// Update Interfaces
		for(var i = 0; i < tile.interfaces.length; i++) {
			tile.interfaces[i] = jQuery.extend(true, {}, tile.interfaces[i]);
			tile.interfaces[i].parent = tile;
		}
		return tile;
	}
	this.place = function(row, col, tile) {
		var background = jQuery.extend(true, {}, tile);
		background.layer = this.layer;
		background.row = row;
		background.col = col;
		background.type = 'background';
		background.tilemap = this;

		// Update Interfaces
		for(var i = 0; i < background.interfaces.length; i++) {
			background.interfaces[i] = jQuery.extend(true, {}, background.interfaces[i]);
			background.interfaces[i].parent = background;
		}
		this.backgrounds[row][col] = background;
		if(background.onclick_event != null) {
			this.layer.screen.clickable_objects[this.layer.screen.clickable_objects.length] = background;
		}

		return background;
	}
	this.background = function(row, col, attributes) {
		var background = new _node_class(attributes);
		background.layer = this.layer;
		background.row = row;
		background.col = col;
		background.type = 'background';
		background.tilemap = this;
		// Update Interfaces
		for(var i = 0; i < background.interfaces.length; i++) {
			background.interfaces[i] = jQuery.extend(true, {}, background.interfaces[i]);
			background.interfaces[i].parent = background;
		}
		this.backgrounds[row][col] = background;
		return background;
	}

	this.remove = function(row, col) {
		var tile
		tile = this.tiles[row][col]
		if(tile != null) {
			// Removing Tile From Clickable Objects
			for(var i = 0; i < tile.layer.screen.clickable_objects.length; i++) {
				if(tile.layer.screen.clickable_objects[i].id == tile.id) {
					tile.layer.screen.clickable_objects.splice(i, 1)
				}
			}

			this.tiles[row][col] = null;
			tile = null;
		}
		return null;
	}

	this.draw = function() {
		for(var row = this.row; row < (this.visiblerows + this.row); row++) {
			for(var col = this.col; col < (this.visiblecols + this.col); col++) {

				this.backgrounds[row][col].x = ((col - this.col) * this.tilewidth) + this.x;
				this.backgrounds[row][col].y = ((row - this.row) * this.tileheight) + this.y;
				this.backgrounds[row][col].draw();

				if(this.tiles[row][col] != null) {
					this.tiles[row][col].x = ((col - this.col) * this.tilewidth) + this.x;
					this.tiles[row][col].y = ((row - this.row) * this.tileheight) + this.y;
					this.tiles[row][col].draw();
				}
			}
		}
		return this;
	}

	this.fill = function(attributes) {
		for(var row = 0; row < this.rows; row++) {
			for(var col = 0; col < this.cols; col++) {
				this.background(row, col, attributes);
			}
		}
	}

	this.background = function(i, j) {
		return this.backgrounds[i][j];
	}

	this.get_tile = function(i, j) {
		return this.tiles[i][j];
	}
	
	this.dump = function(){
		var dump = "";
		dump += "id:"+ this.id +",";
		dump += "cols:"+this.cols+",";
		dump += "rows:"+this.rows+",";
		dump += "visiblecols:"+this.visiblecols+",";
		dump += "visiblerows:"+this.visiblerows+",";
		dump += "col:"+this.col+",";
		dump += "row:"+this.row+",";
		dump += "tilewidth:"+this.tilewidth+",";
		dump += "tileheight:"+this.tileheight+",";
		dump += "x:"+this.x+",";
		dump += "y:"+this.y+",";
		
		var backgrounds = "";
		var tiles = "";
		
		return "{"+ dump +" backgrounds:{"+ backgrounds +"},tiles:{"+ tiles +"}}";
		
	}
}

// Builders
// _screen
function _screen(screen_name, attributes) {
	var s = new _screen_class(screen_name, attributes)

	return s;
}

function _tile(attributes) {
	var tile = new _node_class(attributes);
	//tile.layer = this.layer;
	tile.type = 'tile';
	// Update Interfaces
	for(var i = 0; i < tile.interfaces.length; i++) {
		tile.interfaces[i] = jQuery.extend(true, {}, tile.interfaces[i]);
		tile.interfaces[i].parent = tile;
	}
	return tile;
}

// Search Functions
function _(search_criteria) {
	// Returns What Ever The Searc Criteria Found
}

function _layers(layer_name) {
	for(var i = 0; i < _id_list.length; i++) {
		if(_id_list[i].substr(0, 1) == "l") {
			if(_id_hash[_id_list[i]].name == layer_name) {
				return _id_hash[_id_list[i]];
			}
		}
	}
	return false;
}

function _generate_id(type) {
	var new_id = type + _id_list.length;
	_id_list[_id_list.length] = new_id;
	return new_id;
}

function _load(screen) {

	// Load Alphabet
	GAMEJS.Alpha.load()

	// Register Keypress Function
	var canvas_name = screen.canvas.id
	$("#" + canvas_name).click(function(e) {

		var x = Math.floor((e.pageX - $("#" + canvas_name).offset().left));
		var y = Math.floor((e.pageY - $("#" + canvas_name).offset().top));

		if(_visible_screen != null && _visible_screen != undefined) {

			for(var coi = 0; coi < _visible_screen.clickable_objects.length; coi++) {
				var object = _visible_screen.clickable_objects[coi];
				var obj_x = (_visible_screen.offsetx + object.x);
				var obj_y = (_visible_screen.offsety + object.y);
				if(obj_x <= x && (obj_x + object.width) >= x && obj_y <= y && (obj_y + object.height) >= y) {
					object.onclick_event();
				}
			}
		}
	});
	_first_screen = screen;
	_preloading_screen = _screen(screen.canvas.id, {});
	var l = _preloading_screen.layer("_gamejs_loading_screen");
	l.node({
		color : 'black',
		width : _preloading_screen.canvas.width,
		height : _preloading_screen.canvas.height
	});
	l.lable({
		text : 'Please wait while loading.',
		color : '#fff',
		font : '20pt Helvetica',
		x : 20,
		y : 20
	});
	_update_loading_screen();
}

function Preload(filepath) {
	var image = new Image();
	image.src = filepath;
	_images[_images.length] = image;
}

function _update_loading_screen() {

	var loaded = 0;

	for(var i = 0; i < _images.length; i++) {
		if(_images[i].complete) {
			loaded++;
		}
	}
	if(loaded < _images.length) {
		_preloading_screen.draw();
		setTimeout('_update_loading_screen()', 250);
	} else {
		_first_screen.draw();
	}
}


$(document).keyup(function(event) {
	var method = String.fromCharCode(event.which);
	if(_visible_screen != null && _visible_screen != undefined && _visible_screen.keypresses[method] != null) {
		_visible_screen.keypresses[method]();
	}
});
