var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    var charge = 0;
    var chargeSpeed = 1;
    var pinSpeed = 0.06;
    return {
        x: _x, y: _y,
        angle: 0,
        img: Graphic(PinAssets.arrow),
        pins: (options && options.pins) || 10000,

        onShoot: function(pins) {
            pins.push(Pin(this.x, this.y, -this.angle, {speed: pinSpeed * charge, type: "standard"}));
            this.pins -= 1;
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

            if (mouse.isDown(Mouse.LEFT)) {
                if (charge < 100) {
                    charge += chargeSpeed;
                }
            }

            if (mouse.isReleased(Mouse.LEFT)) {
                if (this.pins > 0) {
                    console.log("Charge level: " + charge + "  Pin speed: " + pinSpeed * charge);
                    this.onShoot(pins);
                    charge = 0;
                }
            }

        },

        render: function(gc) {
            if (this.pins > 0) {
                Utils.drawText(gc, "Pins: " + this.pins, this.x, this.y + 24, {
                    fillStyle: "#FFFFFF",
                    strokeStyle: "#000000",
                    textAlign: "center",
                    font: "24px Arial",
                    lineWidth: 4,
                    stroke: true,              
                });

                this.img.render(gc);
            }
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
    }
    
    result.init && result.init();   // Only attempt to init if it exists.
    return result;
}

Pin.Base = function(_x, _y, _angle, options) {
    var speedX, speedY;
    return {
        x: _x, y: _y,
        width: 0, height: 0,
        speed: options.speed || 4,
        life: 10,
        lifeTimer: 0,
        angle: _angle,

        onDeath: function(pins) {
            pins.splice(pins.indexOf(this), 1);
        },
        
        /* args = bubbles, bubble, pins */
        onCollision: function(args) {
            args.pin = this;
            args.bubble.onCollision(args);
        },

        init: function() {
            speedX = Math.cos(this.angle * (Math.PI / 180));
            speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        isColliding: function(x, y, width, height) {
            var thisx2 = this.x + this.width;
            var thisy2 = this.y + this.height;
            var x2 = x + width;
            var y2 = y + height;

            if (thisx2 > x && this.x < x2 && thisy2 > y && this.y < y2) {
                return true;
            } else {
                return false;
            }
        },
        
        /* args = bubbles, pins, delta, walls */
        update: function(args) {
            this.lifeTimer += args.delta;

            if (this.lifeTimer >= this.life * 1000) {
                this.onDeath(args.pins);
            }

            if (this.x < 0) 
                speedX = -speedX;
            if (this.y < 0)
                speedY = -speedY;
            if (this.x > BPM.canvas.getWidth() - this.width)
                speedX = -speedX;
            if (this.y > BPM.canvas.getHeight() - this.height)
                speedY = -speedY;

            this.angle = -(180 / Math.PI * Math.atan2(speedY, speedX));

            this.x += speedX * this.speed;
            this.y += speedY * this.speed;
            
            for (i in args.bubbles) {
                var b = args.bubbles[i];

                if (this.isColliding(b.x, b.y, b.width, b.height)) {
                    args.bubble = b;
                    this.onCollision(args);
                }           
            }

            for (i in args.walls) {
                var w = args.walls[i];

                if (this.isColliding(w.x, w.y, w.width, w.height)) {
                    w.onCollision(this, args.pins);

                    if (this.x <= w.x + w.width && this.x > w.x + w.width - this.speed
                    || this.x + this.width >= w.x && this.x + this.width < w.x + this.speed
                    ) {
                        speedX = -speedX;
                    }

                    if (this.y <= w.y + w.height && this.y > w.y + w.height - this.speed
                    || this.y + this.height >= w.y && this.y + this.height < w.y + this.speed
                    ) {
                        speedY = -speedY;
                    }
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

        gc.globalAlpha = 1 - (this.lifeTimer / (this.life * 1000));

        base.img.render(gc);

        gc.globalAlpha = 1;
    };

    return base;
};
