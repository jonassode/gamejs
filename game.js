// Dependencies
if (typeof jQuery == 'undefined') { 
    alert('Warning!\njQuery is not loaded.\nAs of version 0.010 game.js requires jQuery\nPlease add a call to jQuery in your website and reload page.');
}

var scripts = document.getElementsByTagName("script");
var gamejs_folder = (scripts[scripts.length-1].src).replace("game.js","");

// Globals
var _visible_screen = null;
var _id_list = new Array();
var _id_hash = {};
var _images = new Array();
var _preloading_screen = null;
var _first_screen = null;
var _letter_padding = 2;
var _letter_width = 5 + _letter_padding; // Including Padding
var _letter_height = 8 + _letter_padding; // Including Padding

// Load Alphabet
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ:!.,1234567890";
var letters = {};

for (var counter = 0;counter < alphabet.length ;counter++ ) {
    letters[alphabet[counter]] = new Image();
    letters[alphabet[counter]].src = gamejs_folder + "images/"+alphabet[counter]+".gif";
    _images[_images.length] = letters[alphabet[counter]];
}

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
    this.textboxes = new Array();

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
        for (var tbi = 0; tbi < this.textboxes.length; tbi++) {
            this.textboxes[tbi].draw();
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

    // Create a lable
    this.lable = function( attributes ){
        var l = new _lable_class( attributes );
        l.layer = this;
        this.lables[this.lables.length] = l;
        return l;
    };

    // Create a lable
    this.textbox = function( attributes ){
        var tb = new _textbox_class( attributes );
        tb.layer = this;
        this.textboxes[this.textboxes.length] = tb;
        return tb;
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

    this.onclick_event = null;
    this.x = (attributes.x || 0);
    this.y = (attributes.y || 0);
    this.width = (attributes.width || null);
    this.height = (attributes.height || null);
    this.color = (attributes.color || '#000');
    if (attributes.walkable != null){
        this.walkable = attributes.walkable;
    } else {
        this.walkable = true;
    }

    // Draws the node on canvas
    // Returns self-reference
    this.draw = function (){
        if (this.type == 'block') {
            this.layer.screen.context.fillStyle = this.color;
            this.layer.screen.context.fillRect(this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety, this.width, this.height);
        } else if(this.type == 'image' || this.type == 'tile' || this.type == 'background') {
            if (this.height != null && this.width != null && this.image != null ) {
                this.layer.screen.context.drawImage(this.image, this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety, this.width, this.height);
            } else if (this.image != null ){
                this.layer.screen.context.drawImage(this.image, this.x + this.layer.screen.offsetx, this.y + this.layer.screen.offsety);
            }
        }
        return this;
    };

    // Movement
    this.move = function(direction){
        if (this.type == 'tile'){
            // Set direction
            this.direction = direction;
            
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

    this.onclick = function(onclick_function){
        // Add tile to list of clickable objects on screen
        this.layer.screen.clickable_objects[this.layer.screen.clickable_objects.length] = this;
        // Register function for this tiles onlick event
        this.onclick_event = onclick_function;
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
    this.clickable_objects = new Array();

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

    this.draw = function(){
        var context = this.layer.screen.context;
        context.fillStyle = this.color;
        context.font = this.font;
        context.textBaseline = this.baseline;
        context.color = this.color;
        context.fillText  (this.text, this.x, this.y);
    }
}

function _textbox_class( attributes ){
    this.padding = (attributes.padding || 3);
    this.x = (attributes.x || 0);
    this.y = (attributes.y || 0);
    this.text = (attributes.text || "");
    this.width = (attributes.width || 0);
    this.color = (attributes.color || '#000');
    this.height = (attributes.height || 0);

    this.draw = function(){
        var x = this.x + this.layer.screen.offsetx;
        var y = this.y + this.layer.screen.offsety;
        var imgx = 0;
        var imgy = 0;
        var row = 0;
        var col = 0;
        var character = null;
        var img = null;
        var word = null;

        width = (this.width * _letter_width)+(this.padding * 2)- _letter_padding;
        height = (this.height * _letter_height)+(this.padding * 2) -_letter_padding;

        this.layer.screen.context.fillStyle = this.color;
        this.layer.screen.context.fillRect(x, y, width, height);
        if (this.text != null && this.text != undefined){

            var words = this.text.toString().split(" ");
            for (var wi=0; wi< words.length; wi++){
                word = words[wi];
                if(word.length+col > this.width){
                    row = row + 1;
                    col = 0;
                }
                for (var counter = 0; counter < word.length; counter++ ) {
                    character = word[counter];
                    if (character == "\n"){
                        row = row + 1;
                        col = 0;
                    } else {
                        character = character.toUpperCase();
                        imgx = x + this.padding + (col * _letter_width);
                        imgy = y + this.padding + (row * _letter_height);
                        img = letters[character];
                        if (img != null){
                            this.layer.screen.context.drawImage(img, imgx, imgy);
                            col = col + 1;
                        } else {
                            _log('Trided to write character '+character+' which is not supported.');
                        }
                    }
                }
                col = col + 1;
            }
        }
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
    var row;
    this.tiles = new Array(this.rows);
    for (row = 0; row < this.rows; row++) {
        this.tiles[row] = new Array(this.cols);
    }
    this.backgrounds = new Array(this.rows);
    for (row = 0; row < this.rows; row++) {
        this.backgrounds[row] = new Array(this.cols);
    }

    this.tile = function(row, col, attributes ){
        var tile = new _node_class( attributes );
        tile.layer = this.layer;
        tile.row = row;
        tile.col = col;
        tile.tilemap = this;
        tile.type = 'tile';
        this.tiles[row][col] = tile;
        return tile;
    }
    this.place = function(row, col, tile){
        var background = jQuery.extend(true, {}, tile);
        background.layer = this.layer;
        background.row = row;
        background.col = col;
        background.type = 'background';
        background.tilemap = this;
        this.backgrounds[row][col] = background;
        if(background.onclick_event != null){
            this.layer.screen.clickable_objects[this.layer.screen.clickable_objects.length] = background;
        }

        return background;
    }
    this.background = function(row, col, attributes ){
        var background = new _node_class( attributes );
        background.layer = this.layer;
        background.row = row;
        background.col = col;
        background.type = 'background';
        background.tilemap = this;
        this.backgrounds[row][col] = background;
        return background;
    }

    this.draw = function(){
        for (var row = this.row; row < (this.visiblerows+this.row); row++) {
            for (var col = this.col; col < (this.visiblecols+this.col); col++) {
                //var tile = this.tiles[row][col]
                if ( this.tiles[row][col] != null){
                    this.tiles[row][col].x = ((col-this.col) * this.tilesize) + this.x;
                    this.tiles[row][col].y = ((row-this.row) * this.tilesize) + this.y;
                    this.tiles[row][col].width = this.tilesize;
                    this.tiles[row][col].height = this.tilesize;
                    this.tiles[row][col].draw();
                } else if (this.backgrounds[row][col] != null)  {
                    //var bg = this.backgrounds[row][col]
                    this.backgrounds[row][col].x = ((col-this.col) * this.tilesize) + this.x;
                    this.backgrounds[row][col].y = ((row-this.row) * this.tilesize) + this.y;
                    this.backgrounds[row][col].width = this.tilesize;
                    this.backgrounds[row][col].height = this.tilesize;
                    this.backgrounds[row][col].draw();
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

    // Register Keypress Function
    var canvas_name = screen.canvas.id
    $("#"+canvas_name).click(function(e){

        var x = Math.floor((e.pageX-$("#"+canvas_name).offset().left));
        var y = Math.floor((e.pageY-$("#"+canvas_name).offset().top));

        if ( _visible_screen != null && _visible_screen != undefined ) {

            for (var coi = 0; coi < _visible_screen.clickable_objects.length; coi++) {
                var object = _visible_screen.clickable_objects[coi];
                if ( object.x <= x && (object.x + object.width) >= x && object.y <= y && (object.y + object.height) >= y ){
                    object.onclick_event();
                }
            }
        }
    });

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
    if ( _visible_screen != null && _visible_screen != undefined && _visible_screen.keypresses[method] != null ) {
        _visible_screen.keypresses[method]();
    }
});


