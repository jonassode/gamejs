
// Namespace
var Index = {
    scene: null,
    menu_scene: null
};

// Init
window.onload = function () {
    // Create Scenes
    Index.scene = _scene("exampel_canvas", {});
    Index.menu_scene = _scene("exampel_canvas", {});

    // Register Events
    Index.scene.keypress('a', function(){ alert('You pressed key A'); });
    Index.scene.keypress('b', function(){ alert('The B key was pressed'); });
    Index.menu_scene.keypress('a', function(){ Index.scene.draw(); });

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

    lmenu = Index.menu_scene._layer("menu");
    lmenu.node({img:'menu.png'});

    Index.menu_scene.draw();
};

