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
                if ( timer.getTimeSinceLastTickSec() > 1 ) {;
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
    var colorsHex = [ 
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
        // '#463C59',
        // '#545259',
        // '#42593C',
        // '#574B3D',
        // '#573F1C',
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
    // Convert the colours into `[r,g,b]`
    var colorsRgb = [];
    for ( var i=0; i<colorsHex.length-1; ++i ) {
        var originalColor = colorsHex[i];
        colorsRgb.push( W.hexStringToColorArray( originalColor.replace( '#', '' ) ) );
    }
    function getRandomHexColor() {
        var randomIndex = Math.floor( W.randomBetween( 0, colorsHex.length-1 ) );
        return colorsHex[ randomIndex ];
    }
    function getRandomRgbColor() {
        var randomIndex = Math.floor( W.randomBetween( 0, colorsRgb.length-1 ) );
        return colorsRgb[ randomIndex ];
    }
    function setContextToRandomColor ( i, petal, petals ) {
        var grd=ctx.createLinearGradient( petal[0][0],petal[0][1],petal[1][0],petal[1][1] );
        var rgba1 = getRandomRgbColor();
        rgba1.push(0);
        var rgba4 = getRandomRgbColor();
        rgba4.push(0);

        var startMid = 0.00;
        var finishMid = 0.8;

        var rgba2 = [ 
            W.lerp( rgba1[0], rgba4[0], startMid ),
            W.lerp( rgba1[1], rgba4[1], startMid ),
            W.lerp( rgba1[2], rgba4[2], startMid ),
            1
        ];

        var rgba3 = [ 
            W.lerp( rgba1[0], rgba4[0], finishMid ),
            W.lerp( rgba1[1], rgba4[1], finishMid ),
            W.lerp( rgba1[2], rgba4[2], finishMid ),
            1
        ];

        // console.log( rgba2, rgba3 );

        grd.addColorStop( 0, rgbaArrayToCssRrgba( rgba1 ) );
        grd.addColorStop( startMid, rgbaArrayToCssRrgba( rgba2 ) );
        grd.addColorStop( finishMid, rgbaArrayToCssRrgba( rgba3 ) );
        grd.addColorStop( 1, rgbaArrayToCssRrgba( rgba4 ) );
        ctx.fillStyle( grd );
    }
    function rgbaArrayToCssRrgba( arr ) {
        var a = arr[3];
        a = a * 10;
        a = Math.floor( a );
        a = a / 10;
        return 'rgba('+Math.floor(arr[0])+','+Math.floor(arr[1])+','+Math.floor(arr[2])+','+a+')';
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
        var offset = degreesToRadians( 5.4 );
        var spacing = [
            [ 20, 382 ],
            [ 92, 352 ],
            [ 162, 352 ],
            [ 226, 312 ]
        ];

        var min =17;
        var max = 28;

        p = PetalLayer
            .create({
                matrixStack: m,
                numberOfPetals: W.randomBetween(min, max),
                innerRadius: spacing[0][0],
                outerRadius: spacing[0][1],
            })
            .on( 'will draw petal', setContextToRandomColor )
            .draw( ctx );

        m.rotateZ( offset );
        PetalLayer
            .create({
                matrixStack: m,
                numberOfPetals: W.randomBetween(min, max),
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
                numberOfPetals:W.randomBetween(min, max),
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
                numberOfPetals: W.randomBetween(min, max),
                innerRadius: spacing[3][0],
                outerRadius: spacing[3][1],
                innerRadiusRotationOffset: -0.02
            })
            .on( 'will draw petal', setContextToRandomColor )
            .draw( ctx );

        // Add the overlay using the last gradient which gives a nice effect
        var grd=ctx.createLinearGradient( 0,0,width,height );
        grd.addColorStop(0,getRandomHexColor());
        grd.addColorStop(1,getRandomHexColor());
        ctx.fillStyle( grd );
        ctx
            .fillRect( 0, 0, width, height );
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
            var p3 = vec2.create();
            // Create and apply the matrix
            m.push();
            {
                // General petal rotation
                m.rotateZ( i );
                // Outer point
                m.push().translate( 0, -options.outerRadius ).applyTo( p1 ).pop();
                // Inner point
                m.push().rotateZ( options.innerRadiusRotationOffset || 0 ).translate( 0, -options.innerRadius ).applyTo( p2 ).pop();
                // Stick out bit
                m.push().translate( W.randomBetween( 0, 200 ), -W.randomBetween( -options.innerRadius, options.outerRadius ) ).applyTo( p3 ).pop();
            }
            m.pop();
            // Store the petal
            this.petals.push([ p1, p2, p3 ]);
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