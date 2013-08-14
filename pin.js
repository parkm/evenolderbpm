var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    return {
        x: _x, y: _y,
        angle: 0,
        img: Graphic(PinAssets.arrow),

        shoot: function() {

        },

        init: function() {

        },

        update: function(mouse, pins) {
            this.angle = (180 / Math.PI * Math.atan2((mouse.getY() - this.y), (mouse.getX() - this.x)));

            this.img.x = this.x;
            this.img.y = this.y;
            this.img.originX = this.img.getWidth()/2;
            this.img.originY = this.img.getHeight()/2;
            this.img.angle = this.angle;

            if (mouse.isPressed(Mouse.LEFT)) {
                pins.push(Pin(this.x, this.y, -this.angle));
            }
        },

        render: function(gc) {
            this.img.render(gc);
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
    base.img = Graphic(PinAssets.pin);

    base.render = function(gc) {
        base.img.x = this.x;
        base.img.y = this.y;
        base.img.originX = base.img.getWidth()/2;
        base.img.originY = base.img.getHeight()/2;
        base.img.angle = -this.angle;

        base.img.render(gc);
    };

    return base;

};

Pin.Base = function(_x, _y, _angle, options) {
    return {
        x: _x, y: _y,
        angle: _angle,
        speedX: 0,
        speedY: 0,
        speed: 4,


        init: function() {
            this.speedX = Math.cos(this.angle * (Math.PI / 180));
            this.speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        update: function(delta) {
            if (this.x < 0) 
                this.speedX = -this.speedX;
            if (this.y < 0)
                this.speedY = -this.speedY;
            if (this.x > BPM.canvas.getWidth() - PinAssets.pin.width)
                this.speedX = -this.speedX;
            if (this.y > BPM.canvas.getHeight() - PinAssets.pin.height)
                this.speedY = -this.speedY;

            this.angle = -(180 / Math.PI * Math.atan2(this.speedY, this.speedX));

            this.x += this.speedX * this.speed;
            this.y += this.speedY * this.speed;
        },

        render: function(gc) {

        }
    };

};

