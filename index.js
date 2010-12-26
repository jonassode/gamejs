
// Namespace
var Index = {
    scene: null
};

// Init
window.onload = function () {
    Index.scene = _scene("exampel_canvas");
    _node({x:20,color:'silver'});
    _node({color:'pink'});
    _node({y:40,width:5,height:20,x:20});
    Index.scene.draw();
};

// Custom Event Handlers