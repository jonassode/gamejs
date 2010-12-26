
// Namespace
var Index = {
    scene: null
};

// Init
window.onload = function () {
    Index.scene = _scene("exampel_canvas");
    _node();
    Index.scene.draw();
};

// Custom Event Handlers