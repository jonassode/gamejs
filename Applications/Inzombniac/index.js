
// Namespace
var Index = {
    screen: null,
    menu_screen: null
};

// Init
window.onload = function () {
    // Create screen
    Index.screen = _screen("game", {});

    // Register Events

    // Create Layers and Objects
    var lb = Index.screen.layer("background");
    lb.node({img:'bg.png'});

    var tm = lb.tilemap({cols:20, rows:25, tilesize:32, x:10, y:10, visiblecols:15, visiblerows:12, col:0, row:0});
    tm.fill({img:'ground.gif'});
    var player = tm.tile(0,0,{img:'man.gif'});
    tm.background(1,1,{img:'tree.gif', walkable:false}).text = "this is a tree";
    tm.background(1,8,{img:'tree.gif', walkable:false}).text = "this is another tree";
    var treetile = tm.background(1,18,{img:'tree.gif', walkable:false});
    tm.background(8,1,{img:'town.gif'});
    tm.background(8,8,{img:'town.gif'});
    tm.background(8,18,{img:'town.gif'});
    tm.background(18,1,{img:'water.gif', walkable:false}).text = "You found a coin in the pond.";
    tm.background(18,8,{img:'water.gif', walkable:false}).text = "Dagon ate you; Game over!";
    tm.background(18,18,{img:'water.gif', walkable:false});

    // Register Click
    treetile.onclick(function(){ alert('I am a tree')});

    var tb = lb.textbox({x:10, y:400, width:67, height:5, padding:8, text:"Instructions:\nWalk with W,A,S,D. Use space to investigate."});

    // Register movements
    Index.screen.keypress('w', function(){ player.move(_up);});
    Index.screen.keypress('s', function(){ player.move(_down);});
    Index.screen.keypress('a', function(){ player.move(_left);});
    Index.screen.keypress('d', function(){ player.move(_right);});
    Index.screen.keypress(' ', function(){ tb.text = tm.backgrounds[player.row+player.direction.row][player.col+player.direction.col].text; tb.draw(); } );

    _load(Index.screen);

};

// Override Methods
function _log(msg) {
    $('#log').val(msg+"\n"+$('#log').val());
}

