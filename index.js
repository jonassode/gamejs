
// Namespace
var Index = {
    scene: null,
    scene2: null
};

// Init
window.onload = function () {
    // Create Scenes
    Index.scene = _scene("exampel_canvas", {});
    Index.scene2 = _scene("exampel_canvas", {});

    // Register Events
    Index.scene.keypress('a', function(){ alert('Yes'); });
    Index.scene.keypress('b', function(){ alert('Maybe'); });
    Index.scene2.keypress('a', function(){ alert('No'); });

    // Create Layers and Objects
    var lb = Index.scene._layer("background");
    lb.node({img:'background.png'});

    var lt = Index.scene._layer("trees");
    lt.node({img:'tree.gif', y:110, x:20});
    lt.node({img:'tree.gif', y:110, x:60});
    lt.node({img:'tree.gif', y:110, x:80});
   
    var lbox = Index.scene._layer("boxes");
    lbox.node({x:20,color:'silver',width:10,height:10});
    lbox.node({color:'pink',width:10,height:10});
    lbox.node({y:40,width:5,height:20,x:20});
    lbox.node({x:100,y:50,img:'logo.gif'});
    lbox.node({x:100,y:100,img:'logo.gif',width:30,height:30});

    lmenu = Index.scene2._layer("menu");
    lmenu.node({img:'menu.png'});

    Index.scene2.draw();
};

