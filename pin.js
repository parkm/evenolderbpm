var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    // TODO: Implement base shooting speed, add additional 25% with charge.
    // preCharge is convenient percentage scale for chargeSpeed
    var preCharge = .3;
    var charge = 0;
    var chargeSpeed = 1 + (preCharge * 10);
    var chargeBox;
    var pinSpeed = 0.06;
    return {
        x: _x, y: _y,
        angle: 0,
        img: Graphic(PinAssets.arrow),
        pins: (options && options.pins) || 1,

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
        speedMod: 0.056,
        life: 6,
        lifeTimer: 0,
        angle: _angle,
        speedX: 0, speedY: 0,
        wallBounce: true, //Enables bouncing from wall collisions.

        onDeath: function(pins) {
            pins.splice(pins.indexOf(this), 1);
        },
        
        /* args = delta, state */
        onCollision: function(args) {
            args.pin = this;
            args.bubble.onCollision(args);
        },

        init: function() {
            this.speedX = Math.cos(this.angle * (Math.PI / 180));
            this.speedY = -Math.sin(this.angle * (Math.PI / 180));
        },
        
        /* args = delta, state */
        update: function(args) {
            var state = args.state;

            this.lifeTimer += args.delta;

            if (this.lifeTimer >= this.life * 1000) {
                this.onDeath(state.pins);
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

            var speed = args.delta * (this.speed * this.speedMod); 
            this.x += this.speedX * speed;
            this.y += this.speedY * speed;

            var isCol = false;
            for (i in state.walls) {
                var w = state.walls[i];

                if (w.isColliding(this.x, this.y, this.width, this.height)) {
                    isCol = true;
                    w.onCollision(this, state.pins);
                    var colSide = w.getCollisionSide(this.x, this.y, this.width, this.height);

                    if (colSide === "left" || colSide === "right") {
                        if (colSide === "left") {
                            this.x = w.x - this.width;
                        } else {
                            this.x = w.x + w.width;
                        }

                        if (this.wallBounce) {
                            this.speedX = -this.speedX; 
                            this.wallBounce = false;
                        }
                    }

                    if (colSide === "top" || colSide === "bottom") {
                        if (colSide === "top") {
                            this.y = w.y - this.height;
                        } else {
                            this.y = w.y + w.height;
                        }

                        if (this.wallBounce) {
                            this.speedY = -this.speedY; 
                            this.wallBounce = false;
                        }
                    }
                }
            }

            if (!isCol) {
                this.wallBounce = true;
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

        // equal to function, y = 1 - x^3 where y = alpha, x = % of pin life
        // Makes the pin die slower
        gc.globalAlpha = 1 - Math.pow(this.lifeTimer / (this.life * 1000), 2.5);

        base.img.render(gc);

        gc.globalAlpha = 1;
    };

    return base;
};
