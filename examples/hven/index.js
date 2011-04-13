
// Namespace
var Index = {
    screen: null
};

// Init
window.onload = function () {
    // Create screen
    Index.screen = _screen("hven_canvas", {});

    // Register Events

    // Create Layer
    var lb = Index.screen.layer("background");
    lb.node({img:'images/map2.png'});


    var ltm = Index.screen.layer("tilemap");

    var tm = ltm.tilemap({
        tilesize:50,
        cols:17,
        rows:16
    });

    tm.tile(8,8,{img:'images/alien.gif'});
   
    _load(Index.screen);

};

// Build Tileset


// Override Methods
function _log(msg) {
//    $('#log').val(msg+"\n"+$('#log').val());
}
