// # Gobal



// # Start
$( function () {

	var canvasEl;
	var ctx;
	var width = 2600;
	var height = 2600;
	var animate = true;
    
    // ## Set up the canvas size
    canvasEl = document.createElement( 'canvas' );
    canvasEl.width = width;
    canvasEl.height = height;
    $( "#canvas" ).append( canvasEl );

    // ## Context
    ctx = W.wrappedContext( canvasEl.getContext( '2d' ) );

    console.log( ctx );

    draw( canvasEl, ctx, width, height, animate );

});

