var W = W || require( './../js/libs/W' );

(function () {

    if ( typeof module !== 'undefined' && module.exports ) {
        W.extend( this, require( 'gl-matrix' ) );
    }

    // Duplicating here so they exits
    var ctx;
    var width;
    var animate;
    var canvasEl;

    function draw( canvas, context, w, h, a  ) {

        canvasEl = canvas;
        ctx = context;
        width = w;
        height = h;
        animate = a;
        
        ctx.globalCompositeOperation( "screen" );

        var timer = new W.TickTimer();
        timer.start();

        if ( animate ) {
            (function drawLoop() {
                if ( timer.getTimeSinceLastTickSec() > 1 ) {
                    W.clearContext( ctx, canvasEl );
                    timer.tick();
                    render();
                }
                window.requestAnimationFrame( drawLoop );
            }());
        } else {
            render();
        }
    }

    // ## Effects
    var colors = [ 
        // '#EDEBEB',
        // '#E8E6EB',
        // '#E7EBE6',
        '#E87B3C',
        '#3DE05D',
        '#763BDB',
        '#D4BB94',
        '#91CF94',
        '#AC8DCC',
        '#445C20',
        '#2C205C',
        '#595653',
        '#525952',
        '#463C59',
        '#545259',
        '#42593C',
        '#574B3D',
        '#573F1C',
        // '#262423',
        // '#202420',
        // '#140921',
        // '#0E2108',
        // '#211209',
        // '#131F13',
        // '#1F1613',
        // '#19131F',
        // '#121212'
    ];
    function getRandomColor() {
        var randomIndex = Math.floor( W.randomBetween( 0, colors.length ) );
        return colors[ randomIndex ];
    }
    function setContextToRandomColor ( i, petal, petals ) {
        var grd=ctx.createLinearGradient( petal[0][0],petal[0][1],petal[1][0],petal[1][1] );
        grd.addColorStop(0,getRandomColor());
        grd.addColorStop(1,getRandomColor());
        ctx.fillStyle( grd );
    }

    // ## Drawing

    function render() {
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

        var numberOfLayers = 9;

        for ( var i = numberOfLayers; i >= 0; --i ) {
            
            PetalLayer
                .create({
                    matrixStack: m,
                    numberOfPetals: W.map( i, 0, numberOfLayers, 9, 50 ),
                    innerRadius: W.map( i, 0, numberOfLayers, 0, 300 ),
                    length: W.map( i, 0, numberOfLayers, 80, 100, true ),
                })
                .on( 'will draw petal', setContextToRandomColor )
                .draw( ctx );
        }


        // var offset = degreesToRadians( 5.4 );
        // var spacing = [
        //     [ 36, 200 ],
        //     [ 92, 352 ],
        //     [ 162, 352 ],
        //     [ 226, 312 ]
        // ];

        // PetalLayer
        //     .create({
        //         matrixStack: m,
        //         numberOfPetals: 8,
        //         innerRadius: spacing[0][0],
        //         length: spacing[0][1],
        //     })
        //     .on( 'will draw petal', setContextToRandomColor )
        //     .draw( ctx );



        drawPalette();
    }

    // # Palette

    function drawPalette ( ) {
        var paletteWidth = 10;
        for ( var i = 0; i < colors.length; ++i ) {
            ctx 
                .fillStyle( colors[ i ] ) 
                .fillRect( width - paletteWidth, W.map( i, 0, colors.length, 0, height ), paletteWidth, height / colors.length );
        }
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
    // * length <Number>
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
            var p3 = vec2.create();
            var p4 = vec2.create();
            // Create and apply the matrix
            m.push();
            {
                var innerRadius = options.innerRadius;
                var length = options.length;
                length = W.randomBetween( length, length-30 )
                //W.map( 0,options.length * Math.random();

                m
                    .rotateZ( i ).translate( 0, innerRadius )
                        .push().applyTo( p1 ).pop()
                        .push().translate( -30, length-20 ).applyTo( p2 ).pop()
                        .push().translate( 0, length ).applyTo( p3 ).pop()
                        .push().translate( 30, length-20 ).applyTo( p4 ).pop();
            }
            m.pop();
            // Store the petal
            this.petals.push([ p1, p2, p3, p4 ]);
        }
    }

    PetalLayer.create = function ( options ) {
        return new PetalLayer( options );
    };

    PetalLayer.prototype.draw = function ( ctx ) {
        for ( var i = 0; i < this.petals.length; ++i ) {
            this.trigger( 'will draw petal', i, this.petals[i], this.petals );
            ctx
                .beginPath()
                .moveTo( Math.floor( this.petals[i][0][0] ), Math.floor( this.petals[i][0][1] ) )
                .lineTo( Math.floor( this.petals[i][1][0] ), Math.floor( this.petals[i][1][1] ) )
                .lineTo( Math.floor( this.petals[i][2][0] ), Math.floor( this.petals[i][2][1] ) )
                .lineTo( Math.floor( this.petals[i][3][0] ), Math.floor( this.petals[i][3][1] ) )
                .fill()
                .closePath();
        }
        return this;
    };

    // # Node export

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = draw;
    } else {
        window.draw = draw;
    }

}());