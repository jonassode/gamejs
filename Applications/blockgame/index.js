// Create Director
var Director = new _director_class();

// Namespace
var Index = {
    screen: null,
    library: null,
    selected_tile: null,
    board:null
};

// Init
window.onload = function () {
    // Adding Players
    var jonas = Director.add_player({
        name:"Jonas"
    });
    var nisse = Director.add_player({
        name:"Nisse"
    });

    // Create screen
    Index.screen = _screen("block_canvas", {});

    // Register Events

    // Create Layer
    var ltm = Index.screen.layer("board");

    var tm = ltm.tilemap({
        tilesize:30,
        cols:11,
        rows:16
    });
    Index.board = tm;

    // Building Board Game
    var img = new Image();
    var red = new Image();
    var blue = new Image();
    img.src = 'images/background.png'
    red.src = 'images/red.png'
    blue.src = 'images/blue.png'

    for(var i=0;i<tm.cols;i++){
        for(var j=1;j<tm.rows-1;j++){
            Index.board.background(j,i).image = img 
        }
    }

    for(var i=0;i<tm.cols;i++){
        Index.board.background(0,i).image = red 
    }

    for(var i=0;i<tm.cols;i++){
        Index.board.background(15,i).image = blue 
    }

    var white = Index.board._tile({
        img:"images/white.png"
    })
    var move_tile = function(){
        Index.board.move_tile(this.row, this.col, Director.current_player.tile)
        Index.board.draw()
    }

    // Placing Player Tiles
    var red_player = Index.board.tile(0,5,{
        img:'images/red_player.png'
    })
    red_player.owner = jonas
    jonas.tile = red_player
    
    var blue_player = Index.board.tile(15,5,{
        img:'images/blue_player.png'
    })
    blue_player.owner = nisse
    nisse.tile = blue_player

    // Register Events
    var tile_click = function(){
        if(this.owner == Director.current_player){
            var tile = Index.board.background(this.row,this.col);
            for(var ii=0;ii<tile.interfaces.length;ii++){
                var a = tile.interfaces[ii].background();
                if ( a != null ){
                    Index.board.place_tile(a.row,a.col, white).onclick(move_tile)
                    Index.board.draw()
                }
            }
        }
    }
    
    red_player.onclick(tile_click)
    blue_player.onclick(tile_click)

    // Preloading Images
    Preload('images/background.png')
    Preload('images/red.png')
    Preload('images/blue.png')
    Preload('images/white.png')
    Preload('images/red_player.png')
    Preload('images/blue_player.png')

    _load(Index.screen);
    Director.start_game();
};


// Override Methods
function _log(msg) {
    $('#log').val(msg+"\n"+$('#log').val());
}

function _start_game(){

}

function _beginning_of_turn(){

}

function _end_of_turn(){

}


function place_tile_and_end_turn(){
    Director.end_turn();
}


