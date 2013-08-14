var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, _options) {
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
 */

function Pin(x, y, options) {
    var base = BasePin(x, y, options);

    var type = options.type || "standard";

    switch(type) {
        case "standard":
            return Pin.Standard(base);
            break;

    }
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


        init: function() {

        },

        update: function(delta) {

        },

        render: function(gc) {

        }
    };

};

