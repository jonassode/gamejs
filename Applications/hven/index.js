// Create The Director Object
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
    // Create screen
    Index.screen = _screen("hven_canvas", {});

    // Register Events

    // Create Layer
    var lb = Index.screen.layer("background");
    lb.node({
        image:'images/map2.png'
    });

    var ltm = Index.screen.layer("tilemap");

    var tm = ltm.tilemap({
        tilesize:50,
        cols:17,
        rows:16
    });
    Index.board = tm;
    Index.bg = lb;

    var interfaces = [{
        direction:"N"
    },{
        direction:"E"
    },{
        direction:"S"
    },{
        direction:"W"
    }];
    var click = function(){
        place_tile(this)
    };

    var a = [[1,1,8],[2,1,10],[3,1,11],[4,2,12],[5,2,13],[6,4,15],[7,5,15],[8,6,15],[9,6,14],[10,7,14],[11,8,14],[12,9,14],[13,9,14],[14,9,13]]

    for(var i=0;i<a.length;i++){
        var b=a[i];
        for(var j=b[1];j<=b[2];j++){
            tm.background(b[0],j).active = true;
            tm.background(b[0],j).onclick(click);
            tm.background(b[0],j).board = tm;
            tm.background(b[0],j).setInterfaces(interfaces);
        }
    }

    // Adding Players
    Director.add_player({
        name:"Jonas"
    });
    Director.add_player({
        name:"Nisse"
    });
    Director.add_player({
        name:"Matte"
    });

    // Library
    Index.library = new Library;
    var grass_card = new Resource({
        type:"card",
        image:"grass.png",
        name:"Grass",
        interfaces: [{
            type:"grass",
            direction:"N"
        },{
            type:"grass",
            direction:"E"
        },{
            type:"grass",
            direction:"S"
        },{
            type:"grass",
            direction:"W"
        }]
    })
    var road_card = new Resource({
        type:"card",
        image:"road.png",
        name:"Road",
        interfaces: [{
            type:"grass",
            direction:"N"
        },{
            type:"road",
            direction:"E"
        },{
            type:"grass",
            direction:"S"
        },{
            type:"road",
            direction:"W"
        }]
    })
    var road_up_card = new Resource({
        type:"card",
        image:"road_up.png",
        name:"Road",
        interfaces: [{
            type:"road",
            direction:"N"
        },{
            type:"grass",
            direction:"E"
        },{
            type:"road",
            direction:"S"
        },{
            type:"grass",
            direction:"W"
        }]
    })
    var road_corner_card = new Resource({
        type:"card",
        image:"road_corner.png",
        name:"Road",
        interfaces: [{
            type:"road",
            direction:"N"
        },{
            type:"road",
            direction:"E"
        },{
            type:"grass",
            direction:"S"
        },{
            type:"grass",
            direction:"W"
        }]
    })
    var road_cross_card = new Resource({
        type:"card",
        image:"road_cross.png",
        name:"Road",
        interfaces: [{
            type:"road",
            direction:"N"
        },{
            type:"road",
            direction:"E"
        },{
            type:"road",
            direction:"S"
        },{
            type:"road",
            direction:"W"
        }]
    })
    var town_south_card = new Resource({
        type:"card",
        image:"town_south.png",
        name:"Road",
        interfaces: [{
            type:"town",
            direction:"N"
        },{
            type:"grass",
            direction:"E"
        },{
            type:"road",
            direction:"S"
        },{
            type:"grass",
            direction:"W"
        }]
    })
    Index.library.add_resource(grass_card, 25)
    Index.library.add_resource(road_card, 26)
    Index.library.add_resource(road_up_card, 20)
    Index.library.add_resource(road_corner_card, 20)
    Index.library.add_resource(road_cross_card, 20)
    Index.library.add_resource(town_south_card, 15)

    // Preloading Images
    Preload('images/cannotplacehere.png')
    Preload('images/grass.png')
    Preload('images/road.png')
    Preload('images/road_up.png')
    Preload('images/road_cross.png')
    Preload('images/road_corner.png')
    Preload('images/town_south.png')

    _load(Index.screen);
    Director.start_game();
};


// Override Methods
function _log(msg) {
    $('#log').val(msg+"\n"+$('#log').val());
}

function _start_game(){
    Index.library.shuffle();
    draw_cards();
    draw_player_cards();
}

function _beginning_of_turn(){
    var card = Index.library.pop();
    if(card != undefined){
        Director.current_player.add_resource(card);
    }
    Index.selected_tile = null;
    draw_cards();
    draw_player_cards();
}

function _end_of_turn(){
    save_tile_placement()
}

// Game Functions
function draw_cards(){
    $('#cards').html(Index.library.length())
}

function place_tile(tile){
    if(Index.selected_tile != null && tile.occupied != true && tile.status == "legal"){
        if(Index.tileplace != null){
            Index.board.tiles[Index.tileplace.row][Index.tileplace.col] = null;
        }
        Index.board.tile(tile.row, tile.col, {
            image:'images/'+Index.selected_tile.image
        }).interfaces=Index.selected_tile.interfaces;
        Index.tileplace = tile
        Index.bg.draw();
        Index.board.draw();

    }    
}

function save_tile_placement(){
    if(Index.tileplace != null){

        tile = Index.tileplace;
        Index.selected_tile = null;
        Director.current_player.pop_resource();
        draw_player_cards();
        tile.occupied = true;
        Index.board.all("image",null);
        Index.bg.draw();
        Index.board.draw();
        
        Index.tileplace = null;
    }
}


function calculate_places(){
    var canPlaceTileHere = true;
    var u;
    for(var i=0;i<Index.board.rows;i++){
        for(var j=0;j<Index.board.cols;j++){
            if(Index.board.background(i,j).active == true){
                canPlaceTileHere = true;
                var tile = Index.board.background(i,j);
                if (tile.occupied != true){
                    for(var ii=0;ii<tile.interfaces.length;ii++){
                        var a = tile.interfaces[ii];
                        u = a.tile_interface();
                        if ( u != null ){
                            if ( u.type != Index.selected_tile.intf(getDirBasedOnDirection(u.direction)).type){
                                canPlaceTileHere = false; 
                            }
                        }
                    }

                    if ( canPlaceTileHere == true ){
                        Index.board.background(i,j).set_image(null)
                        Index.board.background(i,j).status = "legal"
                    } else {
                        Index.board.background(i,j).set_image('images/cannotplacehere.png')
                        Index.board.background(i,j).status = "illegal"
                    }
                }
            }
        }
    }
    Index.bg.draw();
    Index.board.draw();
    
}

function click_active_card( i ){
    if(Index.tileplace != null){
        Index.board.tiles[Index.tileplace.row][Index.tileplace.col] = null;
    }
    Index.tileplace = null

    Index.selected_tile = Director.current_player.get_resources('card')[i];
    calculate_places();
    var player_cards = Director.current_player.get_resources("card");
    for(var j=0;j<player_cards.length;j++){
        $("#card"+j).removeClass("active");
    }

    $("#card"+i).addClass("active");
}

function draw_player_cards(){
    var html = ""
    var player_cards = Director.current_player.get_resources("card");
    for(var i=0;i<player_cards.length;i++){
        var card = player_cards[i];
        html = html + '<img id="card'+i+'" class="inactive"src="images/' + card.image + '" onclick="click_active_card('+i+');">' + '<br>';
    }

    $('#player_cards').html(html)
}

function place_tile_and_end_turn(){
    if(Index.tileplace == null){
        alert('You must place a tile befor you end your turn.')
    } else {
        Director.end_turn();
    }
}


