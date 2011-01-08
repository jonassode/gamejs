// Dependencies
if (typeof jQuery == 'undefined') { 
    alert('Warning!\njQuery is not loaded.\nAs of version 0.010 game.js requires jQuery\nPlease add a call to jQuery in your website and reload page.');
}

// Constants
var _visible_screen = null;
var _id_list = new Array();
var _id_hash = {};
// Movement
var _up = {row:-1, col:0};
var _down = {row:1, col:0};
var _left = {row:0, col:-1};
var _right = {row:0, col:1};

// Classes
function _layer_class( layer_name ){
    // Attributes
    this.id = _generate_id("l");
    this.name = layer_name;
    this.visible = true;
    this.nodes = new Array();
    this.tilemaps = new Array();

    // Add Layer to Id Hahs
    _id_hash[this.id] = this

    // Functions
    // Draws all nodes in the layer on Canvas
    // Returns self-reference
    this.draw = function (){
        for (var ni = 0; ni < this.nodes.length; ni++) {
          this.nodes[ni].draw();
        }
        for (var tmi = 0; tmi < this.tilemaps.length; tmi++) {
          this.tilemaps[tmi].draw();
        }
        return this;
    };

    // Toggles Visibility
    // Returns self-reference
    this.toggle = function(){
        if ( this.visible == true ) {
            this.visible = false;
        } else {
            this.visible = true;
        }
        return this;
    };

    // Create a node
    this.node = function ( attributes ){
        var n = new _node_class( attributes );
        this.add_node(n);
        return n;
    };

    // Adds specified node to layer
    // Returns reference to new node
    this.add_node = function(n){
        n.layer = this;
        this.nodes[this.nodes.length] = n;
        return n;
    };

    // Create a tilemap
    this.tilemap = function ( attributes ){
        var tm = new _tilemap_class( attributes );
        tm.layer = this;
        this.tilemaps[this.tilemaps.length] = tm;
        return tm;
    };

}

function _node_class( attributes ){
    this.id = _generate_id("n");
    _id_hash[this.id] = this
    if (attributes.img != null) {
        this.type = 'image';
        this.image = new Image();
        this.image.src = attributes.img;
    } else {
        this.type = 'block';
    }

    if (attributes.x != null ) { this.x = attributes.x; } else { this.x = 0; }
    if (attributes.y != null ) { this.y = attributes.y; } else { this.y = 0; }
    if (attributes.width != null ) { this.width = attributes.width; } else { this.width = null; }
    if (attributes.height != null ) { this.height = attributes.height; } else { this.height = null; }
    if (attributes.color != null ) { this.color = attributes.color; } else { this.color = '#000'; }

    // Draws the node on canvas
    // Returns self-reference
    this.draw = function (){
        if (this.type == 'block') {
            this.layer.screen.context.fillStyle = this.color;
            this.layer.screen.context.fillRect(this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety, this.width, this.height);
        } else if(this.type == 'image') {
            if (this.height != null && this.width != null) {
                this.layer.screen.context.drawImage(this.image, this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety, this.width, this.height);
            } else {
                this.layer.screen.context.drawImage(this.image, this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety);
            }
        }
        return this;
    };

    // Movement
    this.move = function(direction){
        var row = this.row;
        var col = this.col;
        this.row = row + direction.row;
        this.col = col + direction.col;

        this.tilemap.tiles[this.row][this.col] = this;
        this.tilemap.tiles[row][col] = null;
        this.layer.screen.draw();
    }
}

function _screen_class( canvas_name, attributes ){
    // Attributes
    this.id = _generate_id("s");
    this.name = "Screen";
    this.layers = new Array();
    this.canvas = document.getElementById( canvas_name );
    this.context = this.canvas.getContext("2d");
    this.keypresses = {};
    if (attributes.offsetx != null ) { this.offsetx = attributes.offsetx; } else { this.offsetx = 0; }
    if (attributes.offsety != null ) { this.offsety = attributes.offsety; } else { this.offsety = 0; }

    // Add screen to Object Hash
    _id_hash[this.id] = this

    // Builds a Layer
    // Returns reference to new layer
    this.layer = function( layer_name ){
        var l = new _layer_class( layer_name );
        this.layers[this.layers.length] = l;
        this._default_layer = l;
        l.screen = this;
        return l
    }

    // Draws all the visible layers of the screen
    // Returns self-reference
    this.draw = function (){
        this.context.clearRect ( 0 , 0 , this.canvas.width , this.canvas.height );
        for (var li = 0; li < this.layers.length; li++) {
            if (this.layers[li].visible == true) {
                this.layers[li].draw();
            }
        }
        _visible_screen = this;
        return this;
    };

    this.keypress = function(char, func){
        var charUpperCase = char.toUpperCase()
        this.keypresses[charUpperCase] = func;
    };

}

function _tilemap_class( attributes ){
    this.id = _generate_id("tm");
    _id_hash[this.id] = this
    if (attributes.cols != null ) { this.cols = attributes.cols; }
    if (attributes.rows != null ) { this.rows = attributes.rows; }
    if (attributes.tilesize != null ) { this.tilesize = attributes.tilesize; }

    // Creating Tiles Array
    this.tiles = new Array(this.rows);
    for (var row = 0; row < this.rows; row++) {
        this.tiles[row] = new Array(this.cols);
    }

    this.tile = function(row, col, attributes ){
        var tile = new _node_class( attributes );
        tile.layer = this.layer;
        tile.row = row;
        tile.col = col;
        tile.tilemap = this;
        this.tiles[row][col] = tile;
        return tile;
    }

    this.draw = function(){
    for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
                var tile = this.tiles[row][col]
                if ( tile != null){
                    tile.x = (col * this.tilesize);
                    tile.y = (row * this.tilesize);
                    tile.width = this.tilesize;
                    tile.height = this.tilesize;
                    tile.draw();
                }
            }
        }
        return this;
    }

    this.fill = function(attributes){
        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                this.tile(row,col, attributes);
            }
        }
    }

}



// Builders
// _screen
function _screen( screen_name, attributes ){
    var s = new _screen_class( screen_name, attributes )
    return s;
}

// Search Functions
function _( search_criteria ){
    // Returns What Ever The Searc Criteria Found
}

function _layers( layer_name ){
    for (var i = 0; i < _id_list.length; i++) {
        if ( _id_list[i].substr(0,1) == "l") {
            if ( _id_hash[_id_list[i]].name == layer_name ) {
                return _id_hash[_id_list[i]];
            }
        }
    }
    return false;
}

function _generate_id(type){
    var new_id = type + _id_list.length;
    _id_list[_id_list.length] = new_id;
    return new_id;
}

$(document).keyup(function(event){
    var method = String.fromCharCode(event.which);
    if ( _visible_screen.keypresses[method] != null ) {
        _visible_screen.keypresses[method]();
    }
});
