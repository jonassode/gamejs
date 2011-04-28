// Namespace
var Index = {
    screen: null,
    menu_screen: null
};

// Init
window.onload = function () {
    // Create screen
    Index.screen = _screen("exampel_canvas", {});
    Index.menu_screen = _screen("exampel_canvas", {});

    // Register Events
    Index.screen.keypress('a', function(){ alert('You pressed key A'); });
    Index.screen.keypress('b', function(){ alert('The B key was pressed'); });
    Index.menu_screen.keypress('a', function(){ Index.screen.draw(); });

    // Create Layers and Objects
    var lb = Index.screen.layer("background");
    lb.node({img:'background.png'});

    var lt = Index.screen.layer("trees");
    lt.node({img:'tree.gif', y:110, x:20});
    lt.node({img:'tree.gif', y:110, x:60});
    lt.node({img:'tree.gif', y:110, x:80});

    var ltext = Index.screen.layer("text");
    ltext.lable({text:'Tff Font', x:150, y:0, font:'30px KulminoituvaRegular'});
    ltext.lable({text:'Css Font', x:150, y:50, font:'30px Arial'});
    ltext.textbox({x:5, y:150, width:40, height:4, padding:8, text:"JONAS:\nNina, Wake up! Something is coming. Hurry, we must leave now! 0123456789;"});
   
    var lbox = Index.screen.layer("boxes");
    lbox.node({x:20,color:'silver',width:10,height:10});
    lbox.node({color:'pink',width:10,height:10});
    lbox.node({y:40,width:5,height:20,x:20});
    lbox.node({x:100,y:50,img:'logo.gif'});
    lbox.node({x:100,y:100,img:'logo.gif',width:30,height:30});

    lmenu = Index.menu_screen.layer("menu");
    lmenu.node({img:'menu.png'});

    _load(Index.menu_screen);

};

// Override Methods
function _log(msg) {
    $('#log').val(msg+"\n"+$('#log').val());
}

