

var wall = _tile({
	image : 'cave_wall.gif',
	walkable : false,
});

// Heart
var heart = _tile({
	image : 'heart.gif',
});
heart.state = "FULL";
heart.space = function(actor){
	if ( this.state == "FULL" ) {
		actor.hp = actor.maxhp;
		say("You ate the bellpepper. Your health is full.");
		this.set_image('heart_empty.gif');
		this.state = "EMPTY";
	} else {
		say("This is only the shell of a bellpepper.");
	}
}

var tree = _tile({
	image : 'tree.gif',
});

tree.text = "this is a tree";
tree.state = "NEW";
tree.space = function(actor){
	switch(this.state)
	{
	case "NEW":
		actor.food = actor.food + 20;
		say("You ate the forbidden fruit. You are slightly less hungry.");
		this.set_image('tree_empty.gif');
		this.state = "EMPTY";
		break;
	case "EMPTY":
		actor.wood++;
		say("You chopped down the tree with your mighty sword, which is slight less sharp now.");
		this.set_image('tree_chopped.gif');
		this.state = "CHOPPED";
		actor.moved = true;
		break;
	default:
		say("What once was a mighty beautiful tree is now just a stubb. A sad old stubb. There is nothing for you here.");
		break;
	}
};
var water = _tile({
	image : 'water.gif',
});
water.text = "this is a pond",
water.space = function(actor){
	actor.water = 70;
	say("You drank water from the pond. You are thirsty no more.");
}

var stairs = _tile({
	image : 'cave_stairs.gif',
});
stairs.text = "down we go";

var zombie = _tile({
	image:'zombie.gif',
	walkable:false,
});
zombie.defense = 5;
zombie.attack = 5;
zombie.hp = 10;
zombie.object = "monster";
zombie.name = "Zombie";
zombie.move = function(){
	var direction = null;

	switch(Math.floor(Math.random() * 4))
	{
	case 0:
	  direction = _up;
	  break;
	case 1:
	  direction = _down;
	  break;
	case 2:
	  direction = _left;
	  break;
	case 3:
	  direction = _right;
	  break;
	}

	var pos = this.get_position_from_direction(direction);
	var dest_bg = Index.tilemap.background(pos.row, pos.col);
	var dest_tile = Index.tilemap.get_tile(pos.row, pos.col);

	if ( dest_tile != null ) {
		if ( dest_tile.object == "hero" ) {
			fight(this, dest_tile);
		}
	} else if ( dest_bg.walkable != false ) {
		Index.tilemap.move_tile(pos.row, pos.col, this);
	}
}
zombie.death = function(){
	Index.tilemap.remove(this.row, this.col);
}

var player = _tile({
	image : 'man.gif'
});
player.maxhp = 20;
player.hp = player.maxhp;
player.food = 70;
player.water = 70;
player.level = 1;
player.xp = 0;
player.nextlevel = 100;
player.moved = false;
player.attack = 5;
player.defense = 5;
player.wood = 0;
player.name = "You, the Noble Lord Zedrik";
player.object = "hero";
player.death = function(){
	Index.tilemap.remove(this.row, this.col);
	player.status = "DEAD";
}
player.status = "ALIVE";

NODES = {};
NODES.wall = wall;
NODES.heart = heart;
NODES.tree = tree;
NODES.water = water;
NODES.stairs = stairs;
NODES.zombie = zombie;
NODES.player = player;


