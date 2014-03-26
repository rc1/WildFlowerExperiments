// # Gobal

var canvasEl;
var ctx;
var width = 800;
var height = 800;
var p;

// # Start
$( function () {
    
    // ## Set up the canvas size
    canvasEl = document.createElement( 'canvas' );
    canvasEl.width = width;
    canvasEl.height = height;
    $( "#canvas" ).append( canvasEl );

    // ## Context
    ctx = W.wrappedContext( canvasEl.getContext( '2d' ) );

    draw();
});

// ## Effects
var colors = [ 
    '#EDEBEB','#E8E6EB','#E7EBE6','#E87B3C','#3DE05D','#763BDB','#D4BB94','#91CF94','#AC8DCC','#445C20','#2C205C','#595653','#525952','#463C59','#545259','#42593C','#574B3D','#573F1C','#262423','#202420','#140921','#0E2108','#211209','#131F13','#1F1613','#19131F','#121212'
];
function setContextToRandomColor () {
    var randomIndex = Math.floor( W.randomBetween( 0, colors.length ) );
    var color = colors[ randomIndex ];
    console.log( color );
    ctx.strokeStyle( color );
}

// ## Drawing

function draw() {
    // Style the context
    ctx
        .lineWidth( 9 )
        .lineCap( 'round' );

    // ### Create petal layers
    // #### Matrix
    var m = new W.MatrixStack();
    // Move it to the center of the canvas
    m.translate( width/2, height/2 );

    // #### Layers
    var offset = degreesToRadians( 5.4 )
    var spacing = [
        [ 36, 382 ],
        [ 92, 352 ],
        [ 162, 352 ],
        [ 226, 312 ]
    ];

    p = PetalLayer
        .create({
            matrixStack: m,
            numberOfPetals: 18,
            innerRadius: spacing[0][0],
            outerRadius: spacing[0][1],
        })
        .on( 'will draw petal', setContextToRandomColor )
        .draw( ctx );

    m.rotateZ( offset );
    PetalLayer
        .create({
            matrixStack: m,
            numberOfPetals: 18,
            innerRadius: spacing[1][0],
            outerRadius: spacing[1][1],
            innerRadiusRotationOffset: degreesToRadians( 3 )
        })
        .on( 'will draw petal', setContextToRandomColor )
        .draw( ctx );

    m.rotateZ( offset );
    PetalLayer
        .create({
            matrixStack: m,
            numberOfPetals: 18,
            innerRadius: spacing[2][0],
            outerRadius: spacing[2][1],
            innerRadiusRotationOffset: degreesToRadians( 1 )
        })
        .on( 'will draw petal', setContextToRandomColor )
        .draw( ctx );

    m.rotateZ( offset );
    PetalLayer
        .create({
            matrixStack: m,
            numberOfPetals: 18,
            innerRadius: spacing[3][0],
            outerRadius: spacing[3][1],
            innerRadiusRotationOffset: -0.02
        })
        .on( 'will draw petal', setContextToRandomColor )
        .draw( ctx );
}

// # Utils

function degreesToRadians( deg ) {
    return W.map( deg, 0, 360, 0, (W.PI * 2) );
}

// # Petal Layer
// Options:
// * matrixStack <MatrixStack>
// * numberOfPetals <Number>
// * innerRadius <Number>
// * outerRadius <Number>
// Events
// * 'will draw petal' – called with `fn( i<Number>, petal<Arr>, petals<Arr> )`
function PetalLayer ( options ) {

    W.extend( this, W.eventMixin );

    // Create the matrix stack
    var m = options.matrixStack;

    var radiansPerPetal = (W.PI * 2)/options.numberOfPetals;
    this.petals = [];

    // Create each petal
    for ( var i = 0; i < (W.PI * 2); i += radiansPerPetal ) {
        // Create the two points
        var p1 = vec2.create();
        var p2 = vec2.create();
        // Create and apply the matrix
        m.push();
        {
            // General petal rotation
            m.rotateZ( i );
            // Outer point
            m.push().translate( 0, -options.outerRadius ).applyTo( p1 ).pop();
            // Inner point
            m.push().rotateZ( options.innerRadiusRotationOffset || 0 ).translate( 0, -options.innerRadius ).applyTo( p2 ).pop();
        }
        m.pop();
        // Store the petal
        this.petals.push([ p1, p2 ]);
    }
}

PetalLayer.create = function ( options ) {
    return new PetalLayer( options );
}

PetalLayer.prototype.draw = function ( ctx ) {
    for ( var i = 0; i < this.petals.length; ++i ) {
        this.trigger( 'will draw petal', i, this.petals[i], this.petals );
        ctx
            .beginPath()
            .moveTo( Math.floor( this.petals[i][0][0] ), Math.floor( this.petals[i][0][1] ) )
            .lineTo( Math.floor( this.petals[i][1][0] ), Math.floor( this.petals[i][1][1] ) )
            .stroke();
    }
    return this;
}
