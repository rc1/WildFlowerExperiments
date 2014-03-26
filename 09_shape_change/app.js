// To run this app multiple times:
//     for ((n=0;n<100;n++)); do node app.js; done

// # Modules
var W = require( './../js/libs/W' );
var Canvas = require( 'canvas' );
var fs = require( 'fs' );

// # Draw code
var draw = require( './draw' );

// # Config

var width = 800;
var height = 800;

// # Canvas and context
var canvas = new Canvas( width, height );
var ctx = canvas.getContext( '2d' );
ctx = W.wrappedContext( ctx );

// # Draw it

draw( canvas, ctx, width, height, false );

// # Save it to disk

var filename = ''+ Date.now() +'.png';
var out = fs.createWriteStream( __dirname + '/output/' + filename );
var stream = canvas.pngStream();

stream.on( 'data', function ( chunk ) { 
    out.write( chunk );
});

stream.on( 'end', function () {
    console.log( 'Saved:', filename );
});