// Constants
var _default_scene = null;

// Classes
function _layer_class( s ){
    this.scene = s;
    this.name = "Default";
    this.visible = true;
    this.nodes = new Array();
    this.draw = function (){
        for (var ni = 0; ni < this.nodes.length; ni++) {
          this.nodes[ni].draw();

        }
    };
    this.add_node = function(n){
        n.layer = this;
        this.nodes[this.nodes.length] = n;
    };
}

function _node_class( attributes ){
    this.layer = parent;
    this.x = 10;
    this.y = 10;
    this.width = 10;
    this.height = 10;
    this.draw = function (){
        this.layer.scene.context.fillRect(this.x, this.y, this.width, this.height);
    };
}

function _scene_class( scene_name ){
    this.name = "Scene"
    this.layers = new Array();
    this.layers[0] = _layer(this);
    this._default_layer = this.layers[0];

    this.canvas = document.getElementById(scene_name);
    this.context = this.canvas.getContext("2d");

    this.draw = function (){
        for (var li = 0; li < this.layers.length; li++) {
            if (this.layers[li].visible === true) {
                this.layers[li].draw();
            }
        }
    };
}

// Builders
// _layer
function _layer( s ){
    var l = new _layer_class( s );
    return l;
}

// _node
function _node( attributes ){
    var n = new _node_class();
    _default_scene._default_layer.add_node(n);
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
