BubbleAssets = {};

function Bubble(x, y, type, options) {
    var base = Bubble.Base(x, y, type, options);

    if (type) {
        // Capitalize first letter of type
        type = type.slice(0, 1).toUpperCase() + type.slice(1);

        // Get bubble of given type
        if (Bubble[type]) {
            base = Bubble[type](base);
        }
    }

    base.init();

    return base;
}

Bubble.Base = function(_x, _y, _type, options) {
    var iron = options && options.iron;
    var action = options && options.action;

    var ghost = options && options.ghost;
    var ghostTimer = 0;
    var ghostIndex = 0;
    if (ghost) {
        var ghostPositions = options.ghostPositions || console.error("Ghost positions not set for a ghost bubble!");
        var ghostInterval = options.ghostInterval || 1;
    }

    var speedX, speedY;
    return {
        type: "bubble",
        x: _x, y: _y,
        width: 32, height: 32,
        type: _type,
        angle: (options && options.angle) || Math.random() * 360,
        speed: options && (typeof options.speed === "number") ? options.speed : 0.75,
        color: "rgba(0, 0, 0, .25)",
        img: BubbleAssets.score,
        options: options,

        /* args = delta, state */
        onPop: function(args) {
            if (!iron) {
                var pop = PopEffect(this.x, this.y);
                pop.init();
                args.state.objects.push(pop);
                args.state.bubbles.splice(args.state.bubbles.indexOf(this), 1);
            }
            args.state.combo++;
        },
        
        /* args = delta, state */
        onCollision: function(args) {
            if (action) {
                action();
            }

            if (iron) {
                args.pin.onDeath(args.state.pins);
            }

            this.onPop(args);
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

        init: function() {
            speedX = Math.cos(this.angle * (Math.PI / 180));
            speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        /* args = delta, state */
        update: function(args) {
            if (ghost) {
                ghostTimer += args.delta;

                if (ghostTimer >= ghostInterval * 1000) {
                    ghostIndex++;

                    if (ghostIndex >= ghostPositions.length) {
                        ghostIndex = 0;
                    }

                    this.x = ghostPositions[ghostIndex].x;
                    this.y = ghostPositions[ghostIndex].y;
                    ghostTimer = 0;
                }
            }

            //Standard bubble movement.
            if (this.x < 0) {
                speedX = -speedX;
            }
            if (this.y < 0) {
                speedY = -speedY;
            }
            if (this.x > BPM.canvas.getWidth()) {
                speedX = -speedX;
            }
            if (this.y > BPM.canvas.getHeight()) {
                speedY = -speedY;
            }

            this.x += speedX * this.speed;
            this.y += speedY * this.speed;

            for (i in args.state.pins) {
                var pin = args.state.pins[i];

                if (this.isColliding(pin.x, pin.y, pin.width, pin.height)) {
                    args.pin = pin;
                    this.onCollision(args);
                }           
            }
        },

        render: function(gc) {
            if (ghost) {
                gc.globalAlpha = 1 - (ghostTimer / (ghostInterval * 1000));
            }

            gc.fillStyle = this.color;
            gc.fillRect(this.x, this.y, this.img.width, this.img.height);
            gc.drawImage(this.img, this.x, this.y);

            gc.drawImage(BubbleAssets.glare, this.x, this.y);

            if (ghost) {
                gc.globalAlpha = 1;
            }
        }
    };
};

function PopEffect(x, y) {     
    var complete = false;
    return {
        x: x, y: y,

        init: function() {
            this.anim = Animation(BubbleAssets.pop, 90, 100);
            this.anim.onComplete = function() {
                complete = true;
            };
        },

        update: function(args) {
            this.anim.x = this.x - 32;
            this.anim.y = this.y - 32;
            this.anim.update(args.delta);

            if (complete) {
                args.state.objects.splice(args.state.objects.indexOf(this), 1);
                complete = false;
            }
        },

        render: function(gc) {
            this.anim.render(gc);
        },
    };
}

function Explosion(x, y, pin) {
    var complete = false;
    return {
        x: x, y: y,
        width: 124, height: 150,
        pin: pin,

        init: function() {
            this.anim = Animation(BubbleAssets.explode, this.width, this.height);
            this.anim.onComplete = function() {
                complete = true;
            };
        },

        update: function(args) {
            this.anim.x = this.x - this.width/2;
            this.anim.y = this.y - this.height/2;

            this.anim.update(args.delta);

            if (complete) {
                args.state.objects.splice(args.state.objects.indexOf(this), 1);
                complete = false;
            }

            for (i in args.state.bubbles) {
                var bubble = args.state.bubbles[i];

                if (bubble.isColliding(this.anim.x, this.anim.y, this.width, this.height)) {
                    args.pin = this.pin;
                    bubble.onPop(args);
                }
            }
        },

        render: function(gc) {
            this.anim.render(gc);
        },

    }
}

/* Bubble Types */

Bubble.Score = function(base) {
    base.img = BubbleAssets.score;
    base.color = "rgba(0, 0, 255, .25)";
    base.worth = (base.options && base.options.worth) || 10;
    
    var s_onPop = base.onPop;
    base.onPop = function(args) {
        var value;
        var ftColor;

        s_onPop.call(base, args);

        if (base.worth > 0) {
            value = base.worth * args.state.multiplier;
            ftColor = "#FFFFFF";
        } else {
            value = base.worth;
            ftColor = "#FF0000";
        }

        args.state.addFloatText(FloatText(value, this.x, this.y, {
            stroke: true,
            fillStyle: ftColor,
            font: "16px Arial",
            lineWidth: 3,
        }));

        BPM.cash += value;
    };

    return base;
};

Bubble.Bad = function(base) {
    base = Bubble.Score(base);

    base.img = BubbleAssets.bad;
    base.color = "rgba(255, 0, 0, .25)";
    base.worth = (base.options && base.options.worth) || -10;

    return base;
};

Bubble.Goal = function(base) {
    base.img = BubbleAssets.goal;
    base.color = "rgba(224, 185, 90, .25)";

    return base;
};

Bubble.Ammo = function(base) {
    base.img = BubbleAssets.ammo;
    base.color = "rgba(30, 170, 200, .25)";

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        args.state.shooter.pins++;

        args.state.addFloatText(FloatText("Pin +1", this.x, this.y, {
            stroke: true,
            font: "16px Arial",
            lineWidth: 3,         
        }));

        superOnPop.call(base, args);
    };

    return base;
};

Bubble.Double = function(base) {
    base.img = BubbleAssets.double;
    base.color = "rgba(0, 255, 0, .25)";

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        args.state.pins.push(Pin(base.x, base.y, args.pin.angle-45, {speed: args.pin.speed, type: "standard"}));

        superOnPop.call(base, args);
    };

    return base;
};

Bubble.Combo = function(base) {
    base.img = BubbleAssets.combo;
    base.color = "rgba(180, 58, 186, .25)";

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        var val = args.state.multiplier + 1

        args.state.combo += val;

        args.state.addFloatText(FloatText(val + " pops!", this.x, this.y, {
            stroke: true,
            fillStyle: "#FFEE00",
            font: "18px Arial",
            lineWidth: 3,            
        }));

        superOnPop.call(base, args);
    };

    return base;
};

Bubble.Reflect = function(base) {
    base.img = BubbleAssets.reflect;
    base.color = "rgba(255, 100, 0, .25)";

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        args.pin.speedX = -args.pin.speedX;
        args.pin.speedY = -args.pin.speedY;

        superOnPop.call(base, args);
    }; 

    return base;
};

Bubble.Bomb = function(base) {
    base.img = BubbleAssets.bomb;
    base.color = "rgba(0, 0, 0, .25)";

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        var expl = Explosion(this.x, this.y, args.pin);
        expl.init();

        args.state.objects.push(expl);

        superOnPop.call(base, args);
    }; 

    return base;
};
