// Constants
var _default_scene = null;
var _id_list = new Array();
var _id_hash = {}

// Classes
function _layer_class( layer_name ){
    this.id = _generate_id("l");
    _id_hash[this.id] = this
    this.name = layer_name;
    this.visible = true;
    this.nodes = new Array();
    // Draws all nodes in the layer on Canvas
    // Returns self-reference
    this.draw = function (){
        for (var ni = 0; ni < this.nodes.length; ni++) {
          this.nodes[ni].draw();

        }
        return this;
    };
    // Adds specified node to layer
    // Returns reference to new node
    this.add_node = function(n){
        n.layer = this;
        this.nodes[this.nodes.length] = n;
        return n;
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
    }
}

function _node_class( attributes ){
    this.id = _generate_id("n");
    _id_hash[this.id] = this
    this.layer = parent;
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
            this.layer.scene.context.fillStyle = this.color;
            this.layer.scene.context.fillRect(this.x, this.y, this.width, this.height);
        } else if(this.type == 'image') {
            if (this.height != null && this.width != null) {
                this.layer.scene.context.drawImage(this.image, this.x, this.y, this.width, this.height);
            } else {
                this.layer.scene.context.drawImage(this.image, this.x, this.y);
            }
        }
        return this;
    };
}

function _scene_class( scene_name ){
    this.id = _generate_id("s");
    _id_hash[this.id] = this
    this.name = "Scene"
    this.layers = new Array();

    this.canvas = document.getElementById(scene_name);
    this.context = this.canvas.getContext("2d");

    // Builds a Layer
    // Returns reference to new layer
    this._layer = function( layer_name ){
        var l = new _layer_class( layer_name );
        this.layers[this.layers.length] = l;
        this._default_layer = l;
        l.scene = this;
        return l
    }

    // Draws all the visible layers of the scene
    // Returns self-reference
    this.draw = function (){
        this.context.clearRect ( 0 , 0 , this.canvas.width , this.canvas.height );
        for (var li = 0; li < this.layers.length; li++) {
            if (this.layers[li].visible == true) {
                this.layers[li].draw();
            }
        }
        return this;
    };
}

// Builders

// _node
function _node( attributes ){
    var n = new _node_class( attributes );
    _default_scene._default_layer.add_node(n);
    return n;
}

// _scene
function _scene( scene_name ){
    var s = new _scene_class( scene_name )
    _default_scene = s;
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
