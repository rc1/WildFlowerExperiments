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

    function setContextToRandomAlpha ( i, petal, petals ) {
        ctx.fillStyle( 'rgba(255,255,255,'+W.randomBetween(0.2, 0.5)+')' );
    }

    // ## Drawing

    function render() {
        // Style the context
        ctx
            .lineWidth( 9 )
            .lineCap( 'round' );

        // Draw a background 
        ctx
            .fillStyle( '#ab8ccb' )
            .fillRect( 0, 0, width, height );

        // ### Create petal layers
        // #### Matrix
        var m = new W.MatrixStack();
        // Move it to the center of the canvas
        m.translate( width/2, height/2 );


        // #### Layers
        var offset = degreesToRadians( 5.4 );
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
            .on( 'will draw petal', setContextToRandomAlpha )
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
            .on( 'will draw petal', setContextToRandomAlpha )
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
            .on( 'will draw petal', setContextToRandomAlpha )
            .draw( ctx );

        m.rotateZ( offset );
        PetalLayer
            .create({
                matrixStack: m,
                numberOfPetals: 9,
                innerRadius: spacing[3][0],
                outerRadius: spacing[3][1],
                innerRadiusRotationOffset: -0.02
            })
            .on( 'will draw petal', setContextToRandomAlpha )
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