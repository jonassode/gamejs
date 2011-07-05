// Create Director
var Director = new _director_class();

// Namespace
var Index = {
    screen: null,
    library: null,
    selected_tile: null,
    board:null,
    state:null,
    temporary_tiles: new Array()
};

// Init
window.onload = function () {
    // Adding Players
    var red_player = Director.add_player({
        name:"Red"
    });
    var blue_player = Director.add_player({
        name:"Blue"
    });

    // Create screen
    Index.screen = _screen("block_canvas", {});

    // Register Events

    // Create Layer
    var ltm = Index.screen.layer("board");

    // Tile Map
    var tm = ltm.tilemap({
        tilesize:30,
        cols:11,
        rows:16,
        y:40
    });
    Index.board = tm;

    // Text Box
    ltm.textbox({x:0, y:0, width:47, height:4, padding:2, text:"Welcome To block game.\n\nPlayer turn: {Director.current_player.name}\nYou have: {Director.current_player.blocks} blocks left."});

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
        clear_temporary_tiles();
        Index.board.move_tile(this.row, this.col, Director.current_player.tile)
        Index.screen.draw();
        Director.end_turn();
    }

    // Placing Player Tiles
    var red_meeple = Index.board.tile(0,5,{
        img:'images/red_player.png'
    })
    red_meeple.owner = red_player
    red_player.tile = red_meeple
    red_player.blocks = 20
    
    var blue_meeple = Index.board.tile(15,5,{
        img:'images/blue_player.png'
    })
    blue_meeple.owner = blue_player
    blue_player.tile = blue_meeple
    blue_player.blocks = 20

    // Register Events
    var tile_click = function(){
        if(this.owner == Director.current_player ){
            switch(Index.state){
            case "NEW":
                var tile = Index.board.background(this.row,this.col);
                var temp_tile
                for(var ii=0;ii<tile.interfaces.length;ii++){
                    var a = tile.interfaces[ii].background();

                    if ( a != null ){
                        if ( Index.board.get_tile(a.row, a.col) == null ) {
                            Index.board.place_tile(a.row,a.col, white).onclick(move_tile)
                            temp_tile = Index.board.get_tile(a.row, a.col)
                            Index.temporary_tiles[Index.temporary_tiles.length] = temp_tile;
                        }
                    }
                }
                Index.state = "PLACED"
                break;
            case "PLACED":
                clear_temporary_tiles();
                Index.state = "NEW"
                break;
            }
            Index.screen.draw();
        }
    }

    var place_blocker = function(){

        if( Index.board.get_tile(this.row, this.col) == null && this.row != 0 && this.row != 15 && Director.current_player.blocks > 0){
            Index.board.tile(this.row, this.col,{img:'images/green.png'});
            clear_temporary_tiles();
            Director.current_player.blocks--;
            Director.end_turn();
        }
    }

    Index.board.all_onclick(place_blocker)
    
    red_meeple.onclick(tile_click)
    blue_meeple.onclick(tile_click)

    // Preloading Images
    Preload('images/background.png')
    Preload('images/red.png')
    Preload('images/blue.png')
    Preload('images/white.png')
    Preload('images/green.png')
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
    Index.state = "NEW"
    Index.screen.draw();
}

function _end_of_turn(){

}


function place_tile_and_end_turn(){

}

function clear_temporary_tiles(){
    var tile
    for(var i=0;i<Index.temporary_tiles.length;i++){
        tile = Index.temporary_tiles[i];
        Index.board.remove(tile.row, tile.col);
    }
    Index.temporary_tiles = new Array()
}

