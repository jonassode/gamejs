// Classes
// Will be moved to game.js later
function _player_class( attributes ){
    this.name = (attributes.name || "guest");
    this.status = "ACTIVE"
    this.resources = new Array();

    this.add_resource = function(resource){
        this.resources[this.resources.length] = jQuery.extend(true, {}, resource);
    }

    this.kill = function(){
        this.status = "INACTIVE"
    }

    this.get_resources = function( type ){
        var a = new Array
        for(var r in this.resources)
        {
            if (this.resources[r].type == type ){
                a[a.length] = this.resources[r];
            }
        }
        return a
    }

    this.pop_resource = function(){
        return this.resources.splice(0, 1)[0];
    }

    this.kill_resource = function(){
        return this.resources.splice(0, 1)[0];
    }

}

function _director_class( ){
    this.players = new Array();
    this.current_player = null;

    this.add_player = function( attributes ){
        var p = new _player_class( attributes );

        this.players[this.players.length] = p;

        if (this.current_player == null){
            this.current_player = p;
        }

    }

    this.draw_player_list = function(){
        var html = ""
        for(var p in this.players)
        {
            if(this.players[p].name == this.current_player.name){
                html = html + "* "
            }
            html = html + this.players[p].name + "<br>";
        }
        $('#player_list').html(html)

    }

    this.end_turn = function(){
        // End Of Turn Moves
        _end_of_turn();
        // Change To Next Player
        for(var p in this.players)
        {
            if(this.players[p].name == this.current_player.name){
                var next_player = parseInt(p)+1; 
                if(next_player < this.players.length){
                    this.current_player = this.players[next_player]
                }else{
                    this.current_player = this.players[0]
                }
                break
            }
        }
        this.draw_player_list();
        // Beginning Of Turn Moves
        _beginning_of_turn();

    }

    this.start_game = function(){
        this.draw_player_list();
        _start_game();
        _beginning_of_turn();
    }

    this.player = function(name){
        for(var p in this.players)
        {
            if(this.players[p].name == name){
                return this.players[p];
                break;
            }
        }
    }

}

function _end_of_turn(){
// Does Nothing
// Player Can Override This
}

function _start_game(){
// Does Nothing
// Player Can Override This
}
function Library(){
    this.list = new Array();

    this.length = function(){
        return this.list.length;
    }

    this.add_resource = function(resource, amount){
        for (i=0;i<amount;i++)
        {
            this.list[this.list.length] = jQuery.extend(true, {}, resource);
        }

    }

    this.item = function( i ){
        return this.list[i]
    }

    this.shuffle = function(){
        this.list.sort(function() {
            return 0.5 - Math.random()
        });
    }

    this.pop = function(){
        return this.list.splice(0, 1)[0];
    }
}

// Hardcoded right now but should be based on Board Type (square, hex, node)
function getDirBasedOnDirection(direction){
    var hash = {};
    hash["W"] = "E";
    hash["E"] = "W";
    hash["N"] = "S";
    hash["S"] = "N";
    return hash[direction];
}

// Hardcoded right now but should be based on Board Type (square, hex, node)
function getRowBasedOnDirection(direction){
    var hash = {};
    hash["W"] = 0;
    hash["E"] = 0;
    hash["N"] = -1;
    hash["S"] = 1;
    return hash[direction];
}

// Hardcoded right now but should be based on Board Type (square, hex, node)
function getColBasedOnDirection(direction){
    var hash = {};
    hash["W"] = -1;
    hash["E"] = 1;
    hash["N"] = 0;
    hash["S"] = 0;
    return hash[direction];
}

function Interface( attributes ){
    this.type = (attributes.type || null);
    this.parent = (attributes.parent || null);
    this.direction = (attributes.direction || null);

    // Should return the interface of the connected node
    this.link = function(){

        var x = this.parent.row + getRowBasedOnDirection(this.direction);
        var y = this.parent.col + getColBasedOnDirection(this.direction);
        var o = getDirBasedOnDirection(this.direction);
        if ( this.parent.board.tiles[x][y] != null){
            return this.parent.board.tiles[x][y].intf(o);
        } else {
            return null;
        }
    }
    
}

function Resource( attributes ){
    this.type = (attributes.type || "stuff");
    this.image = (attributes.image || "");
    this.name = (attributes.name || "stuff");
    this.interfaces = (attributes.interfaces || null);

    this.onclick = function(onclick_function){

    }
    this.interfaces = []
    if (attributes.interfaces != null){
        for(var i=0;i<attributes.interfaces.length;i++){
            this.interfaces[this.interfaces.length] = new Interface(attributes.interfaces[i]);
            this.interfaces[this.interfaces.length-1].parent = this;
        }
    }
    this.intf = function(direction){
        var intf = null;
        if(this.interfaces != null){
            for(var i=0;i<this.interfaces.length;i++){
                if (this.interfaces[i].direction == direction){
                    intf = this.interfaces[i];
                }
            }
        }
        return intf;
    }

}

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
        img:'images/map2.png'
    });

    var ltm = Index.screen.layer("tilemap");

    var tm = ltm.tilemap({
        tilesize:50,
        cols:17,
        rows:16
    });
    Index.board = tm;
    var tile = new _node_class({
        interfaces:[{
            type:"empty",
            direction:"N"
        },{
            type:"empty",
            direction:"E"
        },{
            type:"empty",
            direction:"S"
        },{
            type:"empty",
            direction:"W"
        }]
    });
    tile.board = tm;
    tile.layer = ltm;
    tile.onclick(function(){
        if(Index.selected_tile != null && this.occupied != true && this.status == "legal"){
            tm.tile(this.row, this.col, {
                img:'images/'+Index.selected_tile.image
                
            }).interfaces=Index.selected_tile.interfaces;
            tm.draw();
            Index.selected_tile = null;
            Director.current_player.pop_resource();
            draw_player_cards();
            this.occupied = true;
        }
    });

    var a = [[1,1,8],[2,1,10],[3,1,11],[4,2,12],[5,2,13],[6,4,15],[7,5,15],[8,6,15],[9,6,14],[10,7,14],[11,8,14],[12,9,14],[13,9,14],[14,9,13]]

    for(var i=0;i<a.length;i++){
        var b=a[i];
        for(var j=b[1];j<=b[2];j++){
            tm.place(b[0],j,tile);
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
    //Index.library.add_resource(town_card, 3)
    //Index.library.add_resource(tree_card, 3)
    //Index.library.add_resource(farmer_card, 3)
    //Index.library.add_resource(water_card, 3)
    //Index.library.add_resource(observatory_card, 1)
    Index.library.add_resource(grass_card, 25)
    Index.library.add_resource(road_card, 26)
    Index.library.add_resource(road_up_card, 20)
    Index.library.add_resource(road_corner_card, 20)
    Index.library.add_resource(road_cross_card, 20)
    Index.library.add_resource(town_south_card, 15)

    // Preloading Images
    Preload('images/canplacehere.png');
    Preload('images/cannotplacehere.png')

    _load(Index.screen);
    Director.start_game();
};

// Build Tileset


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
    //        alert(Director.current_player.name + ' drew ' + card.name);
    }
    Index.selected_tile = null;
    draw_cards();
    draw_player_cards();
}

function _end_of_turn(){

}


function draw_cards(){
    //    var html = ""
    //    for(var i=0;i<Index.library.length();i++){
    //        html = html + '<img src="images/' +Index.library.item(i).image + '" >' + '<br>';
    //    }
    //
    //    $('#cards').html(html)
    $('#cards').html(Index.library.length())
}

function calculate_places(){
    var canPlaceTileHere = true;
    var u;
    var ump;
    for(var i=0;i<Index.board.backgrounds.length;i++){
        for(var j=0;j<Index.board.backgrounds[i].length;j++){
            if(Index.board.backgrounds[i][j] != null){
                canPlaceTileHere = true;
                var tile = Index.board.backgrounds[i][j];
                if (tile.occupied != true){
                    for(var ii=0;ii<tile.interfaces.length;ii++){
                        var a = tile.interfaces[ii];
                        u = a.link();
                        if ( u != null ){
                            if ( u.type != Index.selected_tile.intf(getDirBasedOnDirection(u.direction)).type){
                                canPlaceTileHere = false; 
                            }
                        }
                    }

                    if ( canPlaceTileHere == true ){
                        var img = new Image();
                        img.src = 'images/canplacehere.png'

                        Index.board.backgrounds[i][j].image = img
                        Index.board.backgrounds[i][j].status = "legal"
                    } else {
                        var img = new Image();
                        img.src = 'images/cannotplacehere.png'
                        
                        Index.board.backgrounds[i][j].image = img
                        Index.board.backgrounds[i][j].status = "illegal"

                    }

                }
            }
        }
    }
    Index.board.draw();
//alert(u);
    
}

function draw_player_cards(){
    var html = ""
    var player_cards = Director.current_player.get_resources("card");
    for(var i=0;i<player_cards.length;i++){
        var card = player_cards[i];
        html = html + '<img src="images/' + card.image + '" onclick="Index.selected_tile = Director.current_player.get_resources(\'card\')['+i+'];calculate_places();">' + '<br>';
    }

    $('#player_cards').html(html)
}



