var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    // TODO: Implement base shooting speed, add additional 25% with charge.
    // preCharge is convenient percentage scale for chargeSpeed
    var preCharge = .8;
    var charge = 0;
    var chargeSpeed = 1 + (preCharge * 10);
    var chargeBox;
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
            // Create a charge box based off PinShooter's x, y (by default)
            // Provide option to not use chargeBox.
            if (options ? options.chargeBox !== false : true) {
                chargeBox = {
                    x: this.x + 24,
                    y: this.y - 10,
                    width: 7,
                    height: 20,
                    border: 2,
                    render: function(gc) {
                        if (charge > 100) charge = 100;
                        // Invisible if charge = 0
                        // Outer Rect
                        gc.fillStyle = "rgba(255, 255, 255, " + charge * 0.01 + ")";
                        gc.fillRect(this.x - this.border, this.y - this.border, this.width + this.border * 2, this.height + this.border * 2);
                        // Inner Rect
                        var dif = this.height * (charge * 0.01);
                        gc.fillStyle = "rgba(255, 0, 0, " + charge * 0.01 + ")";
                        gc.fillRect(this.x, this.y - dif + this.height, this.width, dif);
                    }
                };
            }

        },

        update: function(mouse, pins) {
            if (charge > 100) charge = 100;
            this.angle = (180 / Math.PI * Math.atan2((mouse.getY() - this.y), (mouse.getX() - this.x)));

            this.img.x = this.x;
            this.img.y = this.y;
            this.img.originX = this.img.getWidth()/2;
            this.img.originY = this.img.getHeight()/2;
            this.img.angle = this.angle;

            // show chargeBox under mouse
            chargeBox && (chargeBox.x = mouse.getX() + 25);
            chargeBox && (chargeBox.y = mouse.getY() + 15);

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
                
                chargeBox && chargeBox.render(gc);

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
    return {
        type: "pin",
        x: _x, y: _y,
        width: 0, height: 0,
        speed: options.speed || 4,
        life: 10,
        lifeTimer: 0,
        angle: _angle,
        speedX: 0, speedY: 0,

        onDeath: function(pins) {
            pins.splice(pins.indexOf(this), 1);
        },
        
        /* args = bubbles, bubble, pins */
        onCollision: function(args) {
            args.pin = this;
            args.bubble.onCollision(args);
        },

        init: function() {
            this.speedX = Math.cos(this.angle * (Math.PI / 180));
            this.speedY = -Math.sin(this.angle * (Math.PI / 180));
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
                        this.speedX = -this.speedX;
                    }

                    if (this.y <= w.y + w.height && this.y > w.y + w.height - this.speed
                    || this.y + this.height >= w.y && this.y + this.height < w.y + this.speed
                    ) {
                        this.speedY = -this.speedY;
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
