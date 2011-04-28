
// Namespace
var Index = {
    screen: null
};

// Init
window.onload = function () {
    // Create screen
    Index.screen = _screen("mapmaker_canvas", {});

    // Get Cols and Rows from Page
    var input_cols = $('#input_cols').val();
    var input_rows = $('#input_rows').val();

    // Register Events

    // Create Layer
    var lb = Index.screen.layer("background");

    var tm = lb.tilemap({
        tilesize:32,
        cols:20,
        rows:20
    });

    for (var i=0;i<input_rows;i++)
    {
        for (var j=0;j<input_cols;j++)
        {
            tm.background(i,j, {img:'bg.gif'}).onclick(function(){ alert(this.row + ',' + this.col)});
        }
    }

    _load(Index.screen);

};

// Build Tileset


// Override Methods
function _log(msg) {
//    $('#log').val(msg+"\n"+$('#log').val());
}
