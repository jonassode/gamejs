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
        rows:17,
        y:40
    });
    Index.board = tm;

    // Text Box
    ltm.textbox({
        x:0, 
        y:0, 
        width:47, 
        height:4, 
        padding:2, 
        text:"Welcome To Blockgame.\nPlayer turn: {Director.current_player.name}\nRed have: {Director.player(\"Red\").blocks} blocks left.\nBlue have: {Director.player(\"Blue\").blocks} blocks left."
    });

    // Building Board Game
    for(var i=0;i<tm.cols;i++){
        for(var j=1;j<tm.rows-1;j++){
            Index.board.background(j,i).set_image('images/background.png') 
        }
    }

    for(var ri=0;ri<tm.cols;ri++){
        Index.board.background(0,ri).set_image('images/red.png') 
    }

    for(var bi=0;bi<tm.cols;bi++){
        Index.board.background(16,bi).set_image('images/blue.png') 
    }

    var white = Index.board._tile({
        image:"images/white.png"
    })

    var move_tile = function(){
        clear_temporary_tiles();
        Index.board.move_tile(this.row, this.col, Director.current_player.tile)
        Index.screen.draw();
        if ( check_victory() == true ) {
            Director.end_game(Director.current_player.name + " won. Click OK to Play Again.")
            Director.start_game();
        } else {
            Director.end_turn();
        }
    }

    // Creating Player Tiles
    Index.red_meeple = Index.board._tile({
        image:'images/red_player.png'
    })
    Index.red_meeple.owner = red_player
    
    Index.blue_meeple = Index.board._tile({
        image:'images/blue_player.png'
    })
    Index.blue_meeple.owner = blue_player

    // Register Events
    Index.tile_click = function(){
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
        if( Index.board.get_tile(this.row, this.col) == null && this.row != 0 && this.row != 16 && Director.current_player.blocks > 0){
            Index.board.tile(this.row, this.col,{
                image:'images/green.png'
            });
            clear_temporary_tiles();
            Director.current_player.blocks--;
            Director.end_turn();
        }
    }

    // Register Functions
    Index.board.all_onclick(place_blocker)

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
    // Draw Screen And Tiles
    
    // Setting Up Red Player
    Index.board.place_tile(0,5, Index.red_meeple).onclick(Index.tile_click);
    Director.player("Red").tile = Index.board.get_tile(0,5);
    Director.player("Red").blocks = 20
    Director.player("Red").winning_row = 16

    // Setting Up Blue Player
    Index.board.place_tile(16,5, Index.blue_meeple).onclick(Index.tile_click);
    Director.player("Blue").tile = Index.board.get_tile(16,5);
    Director.player("Blue").blocks = 20
    Director.player("Blue").winning_row = 0
    
}

function _beginning_of_turn(){
    Index.state = "NEW"
    Index.screen.draw();
}

function _end_of_turn(){
    // Do Nothing
}

function _end_game(){
    Index.board.clear_tiles();

}

// Local Functions
function clear_temporary_tiles(){
    var tile
    for(var i=0;i<Index.temporary_tiles.length;i++){
        tile = Index.temporary_tiles[i];
        Index.board.remove(tile.row, tile.col);
    }
    Index.temporary_tiles = new Array()
}

function check_victory(){
    if ( Director.current_player.tile.row == Director.current_player.winning_row ){
        return true;
    } else {
        return false;
    }
}
