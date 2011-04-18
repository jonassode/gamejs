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
            this.list[this.list.length] = jQuery.extend(true, {}, resource);;
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

function Resource( attributes ){
    this.type = (attributes.type || "stuff");
    this.image = (attributes.image || "");
    this.name = (attributes.name || "stuff");

    this.onclick = function(onclick_function){

    }

}

var Director = new _director_class();

// Namespace
var Index = {
    screen: null,
    library: null,
    selected_tile: null
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

    tm.background(1,1,{
        img:'images/alien.gif'
    }).onclick(function(){
        if(Index.selected_tile != null){
            tm.tile(this.col, this.row, {
                img:'images/'+Index.selected_tile.image
                });
            tm.draw();
            Index.selected_tile = null;
        }
    });

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
    var town_card = new Resource({
        type:"card",
        image:"town.gif",
        name:"Town"
    })
    var tree_card = new Resource({
        type:"card",
        image:"tree.gif",
        name:"Tree"
    })
    var farmer_card = new Resource({
        type:"card",
        image:"man.gif",
        name:"Farmer"
    })
    var water_card = new Resource({
        type:"card",
        image:"water.gif",
        name:"Water"
    })
    Index.library.add_resource(town_card, 3)
    Index.library.add_resource(tree_card, 3)
    Index.library.add_resource(farmer_card, 3)
    Index.library.add_resource(water_card, 3)

    _load(Index.screen);
    Director.start_game();
};

// Build Tileset


// Override Methods
function _log(msg) {
//    $('#log').val(msg+"\n"+$('#log').val());
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
        alert(Director.current_player.name + ' drew ' + card.name);
    }
    Index.selected_tile = null;
    draw_cards();
    draw_player_cards();
}

function _end_of_turn(){

}

function draw_cards(){
    var html = ""
    for(var i=0;i<Index.library.length();i++){
        html = html + '<img src="images/' +Index.library.item(i).image + '" >' + '<br>';
    }

    $('#cards').html(html)
//    $('#cards').html(Index.library.length())
}

function draw_player_cards(){
    var html = ""
    var player_cards = Director.current_player.get_resources("card");
    for(var i=0;i<player_cards.length;i++){
        var card = player_cards[i];
        html = html + '<img src="images/' + card.image + '" onclick="Index.selected_tile = Director.current_player.get_resources(\'card\')['+i+'];">' + '<br>';
    }

    $('#player_cards').html(html)
}



