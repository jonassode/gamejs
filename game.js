// Dependencies
if (typeof jQuery == 'undefined') { 
    alert('Warning!\njQuery is not loaded.\nAs of version 0.010 game.js requires jQuery\nPlease add a call to jQuery in your website and reload page.');
}

// Globals
var _visible_screen = null;
var _id_list = new Array();
var _id_hash = {};
var _images = new Array();
var _preloading_screen = null;
var _first_screen = null;

// Movement
var _up = {
    row:-1,
    col:0
};
var _down = {
    row:1,
    col:0
};
var _left = {
    row:0,
    col:-1
};
var _right = {
    row:0,
    col:1
};

// Classes
function _layer_class( layer_name ){
    // Attributes
    this.id = _generate_id("l");
    this.name = layer_name;
    this.visible = true;
    this.nodes = new Array();
    this.tilemaps = new Array();
    this.lables = new Array();

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
        for (var li = 0; li < this.lables.length; li++) {
            this.lables[li].draw();
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
        n.layer = this;
        this.nodes[this.nodes.length] = n;
        return n;
    };

    // Create a node
    this.lable = function( attributes ){
        var l = new _lable_class( attributes );
        l.layer = this;
        this.lables[this.lables.length] = l;
        return l;
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
        _images[_images.length] = this.image;
    } else {
        this.type = 'block';
    }

    this.x = (attributes.x || 0);
    this.y = (attributes.y || 0);
    this.width = (attributes.width || null);
    this.height = (attributes.height || null);
    this.color = (attributes.color || '#000');
    this.walkable = (attributes.walkable || true);

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
        // Calculate New Direction
        var newrow = row + direction.row;
        var newcol = col + direction.col;

        if(!(newrow < 0) && !(newcol < 0) && !(newrow >= this.tilemap.rows) && !(newcol >= this.tilemap.cols) && !(this.tilemap.backgrounds[newrow][newcol].walkable == false) ) {
            this.row = newrow;
            this.col = newcol;

            this.tilemap.tiles[this.row][this.col] = this;
            this.tilemap.tiles[row][col] = null;
            //
            var newtilemaprow = this.tilemap.row + direction.row;
            var newtilemapcol = this.tilemap.col + direction.col;
            var centerrow = Math.round(this.tilemap.visiblerows/2);
            var centercol = Math.round(this.tilemap.visiblecols/2);
            var tilepositionrow = (row-this.tilemap.row+1);
            var tilepositioncol = (col-this.tilemap.col+1);

            if (!(newtilemaprow < 0) && !(newtilemaprow > (this.tilemap.rows-this.tilemap.visiblerows)) && ( tilepositionrow == centerrow) ){
                this.tilemap.row = newtilemaprow;
            }
            if (!(newtilemapcol < 0) && !(newtilemapcol > (this.tilemap.cols-this.tilemap.visiblecols)) && ( tilepositioncol == centercol) ){
                this.tilemap.col = newtilemapcol;
            }

            this.tilemap.draw();
        }
    }
}

function _log(msg){
//
}

function _screen_class( canvas_name, attributes ){
    // Attributes
    this.id = _generate_id("s");
    this.name = "Screen";
    this.layers = new Array();
    this.canvas = document.getElementById( canvas_name );
    this.context = this.canvas.getContext("2d");
    this.keypresses = {};

    this.offsetx = (attributes.offsetx || 0);
    this.offsety = (attributes.offsety || 0);

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

    this.keypress = function(character, func){
        var charUpperCase = character.toUpperCase()
        this.keypresses[charUpperCase] = func;
    };

}

function _lable_class( attributes ){
    this.x = (attributes.x || 0);
    this.y = (attributes.y || 0);
    this.text = (attributes.text || "");
    this.font = (attributes.font || '12px sans-serif');
    this.color = (attributes.color || '#000');
    this.baseline = (attributes.baseline || 'top');
    ;

    this.draw = function(){
        var context = this.layer.screen.context;
        context.fillStyle = this.color;
        context.font = this.font;
        context.textBaseline = this.baseline;
        context.color = this.color;
        context.fillText  (this.text, this.x, this.y);
    }
}


function _tilemap_class( attributes ){
    this.id = _generate_id("tm");
    _id_hash[this.id] = this
    if (attributes.cols != null ) {
        this.cols = attributes.cols;
    }
    if (attributes.rows != null ) {
        this.rows = attributes.rows;
    }
    if (attributes.visiblecols != null ) {
        this.visiblecols = attributes.visiblecols;
    } else {
        this.visiblecols = this.cols;
    }
    if (attributes.visiblerows != null ) {
        this.visiblerows = attributes.visiblerows;
    } else {
        this.visiblerows = this.rows;
    }
    if (attributes.col != null ) {
        this.col = attributes.col;
    } else {
        this.col = 0;
    }
    if (attributes.row != null ) {
        this.row = attributes.row;
    } else {
        this.row = 0;
    }
    if (attributes.rows != null ) {
        this.rows = attributes.rows;
    }
    if (attributes.tilesize != null ) {
        this.tilesize = attributes.tilesize;
    }
    if (attributes.x != null ) {
        this.x = attributes.x;
    } else {
        this.x = 0;
    }
    if (attributes.y != null ) {
        this.y = attributes.y;
    } else {
        this.y = 0;
    }

    // Creating Tiles Array
    this.tiles = new Array(this.rows);
    for (var row = 0; row < this.rows; row++) {
        this.tiles[row] = new Array(this.cols);
    }
    this.backgrounds = new Array(this.rows);
    for (var row = 0; row < this.rows; row++) {
        this.backgrounds[row] = new Array(this.cols);
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
    this.background = function(row, col, attributes ){
        var background = new _node_class( attributes );
        background.layer = this.layer;
        background.row = row;
        background.col = col;
        background.tilemap = this;
        this.backgrounds[row][col] = background;
        return background;
    }

    this.draw = function(){
        for (var row = this.row; row < (this.visiblerows+this.row); row++) {
            for (var col = this.col; col < (this.visiblecols+this.col); col++) {
                var tile = this.tiles[row][col]
                if ( tile != null){
                    tile.x = ((col-this.col) * this.tilesize) + this.x;
                    tile.y = ((row-this.row) * this.tilesize) + this.y;
                    tile.width = this.tilesize;
                    tile.height = this.tilesize;
                    tile.draw();
                } else {
                    var bg = this.backgrounds[row][col]
                    bg.x = ((col-this.col) * this.tilesize) + this.x;
                    bg.y = ((row-this.row) * this.tilesize) + this.y;
                    bg.width = this.tilesize;
                    bg.height = this.tilesize;
                    bg.draw();
                }
            }
        }
        return this;
    }

    this.fill = function(attributes){
        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                this.background(row, col, attributes);
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

function _load(screen){
    _first_screen = screen;
    _preloading_screen = _screen(screen.canvas.id, {});
    var l = _preloading_screen.layer("_gamejs_loading_screen");
    l.node({
        color:'black',
        width:_preloading_screen.canvas.width,
        height:_preloading_screen.canvas.height
    });
    l.lable({
        text: 'Please wait while loading.',
        color:'#fff',
        font:'20pt Helvetica',
        x: 20,
        y: 20
    });
    _update_loading_screen();
}

function _update_loading_screen(){

    var loaded = 0;

    for(var i=0; i < _images.length; i++)
    {
        if(_images[i].complete){
            loaded++;
        }
    }
    if (loaded < _images.length){
        _preloading_screen.draw();
        setTimeout('_update_loading_screen()',250);
    } else {
        _first_screen.draw();
    }
}


$(document).keyup(function(event){
    var method = String.fromCharCode(event.which);
    if ( _visible_screen.keypresses[method] != null ) {
        _visible_screen.keypresses[method]();
    }
});
