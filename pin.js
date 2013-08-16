var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    return {
        x: _x, y: _y,
        angle: 0,
        img: Graphic(PinAssets.arrow),
        pins: (options && options.pins) || 10,

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
                pins.push(Pin(this.x, this.y, -this.angle, {type: "standard"}));
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

function Pin(x, y, angle, options) {
    var base = Pin.Base(x, y, angle, options);
    
    var type = (options && options.type) || "standard";

    var result;

    switch(type) {
        case "standard":
            result = Pin.Standard(base);
            break;

        case "test":
            result = Pin.Test(Pin.Standard(base));
            break;
    }
    
    result.init && result.init();   // Only attempt to init if it exists.
    return result;
}

Pin.Base = function(_x, _y, _angle, options) {
    return {
        x: _x, y: _y,
        width: 0, height: 0,
        speedX: 0,
        speedY: 0,
        speed: options.speed || 4,
        life: 100,
        angle: _angle,

        onDeath: function(pins) {
            pins.splice(pins.indexOf(this), 1);
        },

        onCollision: function(bubbles, bubble, pins) {
            bubble.onCollision(bubbles, this, pins);
        },

        init: function() {
            this.speedX = Math.cos(this.angle * (Math.PI / 180));
            this.speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        update: function(bubbles, pins) {
            if (this.x < 0) 
                this.speedX = -this.speedX;
            if (this.y < 0)
                this.speedY = -this.speedY;
            if (this.x > BPM.canvas.getWidth() - this.width)
                this.speedX = -this.speedX;
            if (this.y > BPM.canvas.getHeight() - this.height)
                this.speedY = -this.speedY;

            this.angle = -(180 / Math.PI * Math.atan2(this.speedY, this.speedX));

            this.x += this.speedX * this.speed;
            this.y += this.speedY * this.speed;

            for (i in bubbles) {
                var b = bubbles[i];
                var x2 = this.x + this.width;
                var y2 = this.y + this.height;
                var bx2 = b.x + b.width;
                var by2 = b.y + b.height;

                if (x2 > b.x && this.x < bx2 && y2 > b.y && this.y < by2) {
                    this.onCollision(bubbles, b, pins);
                }           
            }
        },

        render: function(gc) {

        }
    };

};


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

Pin.Test = function(base) {
    console.log("Test created.");

    var superRender = base.render;
    
    base.render = function(gc) {
        superRender.call(base, gc); // How to call a super class function.
    };

    return base;
};

