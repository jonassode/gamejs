
// Namespace
var Index = {
    scene: null
};

// Init
window.onload = function () {
    Index.scene = _scene("exampel_canvas");
    _node({x:20,color:'silver'});
    _node({color:'pink'});
    Index.scene.draw();
};

// Custom Event Handlers