var PinAssets = {};

/* ### Pin Shooter
 */

function PinShooter(_x, _y, options) {
    // TODO: Implement base shooting speed, add additional 25% with charge.
    // preCharge is convenient percentage scale for chargeSpeed
    var preCharge = .1;
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
    var getSpeedX = function(angle) {
        return Math.cos(angle * (Math.PI / 180));
    };
    var getSpeedY = function(angle) {
        return -Math.sin(angle * (Math.PI / 180));
    };

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

        setAngle: function(angle) {
            this.speedX = getSpeedX(angle);
            this.speedY = getSpeedY(angle);
            this.angle = -(180 / Math.PI * Math.atan2(this.speedY, this.speedX));
        },

        onDeath: function(pins) {
            pins.splice(pins.indexOf(this), 1);
        },

        /* args = delta, state */
        onCollision: function(args) {
            args.pin = this;
            args.bubble.onCollision(args);
        },

        init: function() {
            console.log("*******************\n*******************\n\t\t\t\t\tPIN CREATED");
            this.speedX = getSpeedX(this.angle);
            this.speedY = getSpeedY(this.angle);
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
            if (this.x > args.state.width - this.width)
                this.speedX = -this.speedX;
            if (this.y > args.state.height - this.height)
                this.speedY = -this.speedY;


            var speed = args.delta * (this.speed * this.speedMod);
            this.x += this.speedX * speed;
            this.y += this.speedY * speed;

            var isCol = false;
            for (i in state.walls) {
                var w = state.walls[i];

                if (w.isColliding(this.x, this.y, this.width, this.height)) {
                    isCol = true;
                    var col = w.onCollision(this, state.pins);
                    console.log("col.side: " + col.side + " col.corner: " + col.corner + " wallBounce: " + this.wallBounce);
                    // Snaps pin to the given side of the colliding wall
                    var snap = function(side) {
                        switch (side) {
                            case "left":
                                this.x = w.x - this.width;
                                break;

                            case "right":
                                this.x = w.x + w.width;
                                break;

                            case "top":
                                this.y = w.y - this.height;
                                break;

                            case "bottom":
                                this.y = w.y + w.height;
                                break;
                        }
                    };
                    // if pin.wallBounce then reverse given pin speed and set wallBounce to false
                    // params: pin - pin instance (usually 'this')
                    //         callback - callback called if wallBounce = true
                    var bounceCheck = function(me, callback) {
                        if (!me && !me.wallBounce) {
                            console.error("Error @ Pin.update collision checking: bounceCheck pin not defined.");
                            return false;
                        }

                        if (me.wallBounce) {
                            callback && callback(me);
                            me.wallBounce = false;
                        }
                    };

                    console.log("Pin angle: " + this.angle);
                    var angle = 0;
                    if (col.corner) {
                        switch (col.corner) {
                            case "bottomright":
                                snap("bottom");
                                snap("right");
                                break;

                            case "bottomleft":
                                snap("bottom");
                                snap("left");
                                break;

                            case "topright":
                                snap("top");
                                snap("right");
                                break;

                            case "topleft":
                                snap("top");
                                snap("left");
                                break;
                        }
                    }

                    switch (col.side) {
                        case "left": case "right":
                            snap(col.side);
                            bounceCheck(this, function(me) {me.speedX = getSpeedX(me.angle + 180);});
                            break;

                        case "top": case "bottom":
                            snap(col.side);
                            bounceCheck(this, function(me) {me.speedY = getSpeedY(me.angle + 180);});
                            break;
                    }
                }
            }

            if (!isCol) {
                this.wallBounce = true;
            }
            // ? move this to above if statement to improve perf ?
            // will have to manually adjust this.angle on collisions
            // but this equation gets called fewer times
            this.angle = -(180 / Math.PI * Math.atan2(this.speedY, this.speedX));
        },

        render: function(gc) {
            Utils.drawText(gc, "Pin angle: " + this.angle, 0, 0, {fillStyle: "#FFFFFF", font: "24px Arial", textAlign: "left"});
        }
    };

};


Pin.Standard = function(base) {
    base.img = Graphic(PinAssets.pin);

    var superRender = base.render;
    base.render = function(gc) {
        superRender.call(this, gc);
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
