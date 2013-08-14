var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    return {
        x: _x, y: _y,

        shoot: function() {

        },

        onMouse: function() {

        },

        init: function() {

        },

        update: function(delta) {

        },

        render: function(gc) {
            var img = PinAssets.arrow;
            gc.drawImage(img, this.x, this.y);
        }
    };

}

/* ### Pins
 *
 * Pins init() on creation.
 */

function Pin(x, y, options) {
    var base = Pin.Base(x, y, options);
    
    var type = (options && options.type) || "standard";

    var result;

    switch(type) {
        case "standard":
            result = Pin.Standard(base);
            break;

    }
    
    result.init && result.init();   // Only attempt to init if it exists.
    return result;
}

Pin.Standard = function(base) {

    base.render = function(gc) {
        var img = PinAssets.pin;
        gc.drawImage(img, base.x, base.y);
    };

    return base;

};

Pin.Base = function(_x, _y, options) {
    return {
        x: _x, y: _y,
        speedX: 0, speedY: 0,
        speed: 0,
        angle: 0,
        life: 100,


        onDeath: function() {

        },

        onCollision: function() {

        },

        init: function() {

        },

        update: function(delta) {

        },

        render: function(gc) {

        }
    };

};

