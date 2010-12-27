
// Namespace
var Index = {
    scene: null,
    scene2: null
};

// Init
window.onload = function () {
    Index.scene = _scene("exampel_canvas");
    Index.scene._layer("background");
    _node({img:'background.png'});

    Index.scene._layer("trees");
    _node({img:'tree.gif', y:110, x:20});
    _node({img:'tree.gif', y:110, x:60});
    _node({img:'tree.gif', y:110, x:80});
   
    Index.scene._layer("boxes");
    _node({x:20,color:'silver',width:10,height:10});
    _node({color:'pink',width:10,height:10});
    _node({y:40,width:5,height:20,x:20});
    _node({x:100,y:50,img:'logo.gif'});
    _node({x:100,y:100,img:'logo.gif',width:30,height:30});

    Index.scene2 = _scene("exampel_canvas");
    Index.scene2._layer("menu");
    _node({img:'menu.png'});

    Index.scene2.draw();
};

// Custom Event Handlers