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
        constraints: (options && options.constraints) || {},
        type: _type,
        angle: (options && options.angle) || Math.random() * 360,
        speed: options && (typeof options.speed === "number" && !isNaN(options.speed)) ? options.speed : 0,
        img: BubbleAssets.score,
        options: options,

        popped: false,
        popDelayMod: 0.04,
        popDelayTimer: 0,

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
            if (iron && this.type !== "reflect") {
                args.pin.onDeath(args.state.pins);
            }

            if (!this.popped) {
                this.onPop(args);
                this.popped = true;
            }
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
            if (this.popped) {
                var popDelay = args.delta * this.popDelayMod;

                this.popDelayTimer += args.delta;

                if (this.popDelayTimer >= popDelay * 1000) {
                    this.popped = false;
                    this.popDelayTimer = 0;
                }
            }

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
            if (this.x < 0 || this.x < this.constraints.x) {
                speedX = -speedX;
            }
            if (this.y < 0 || this.y < this.constraints.y) {
                speedY = -speedY;
            }
            if (this.x > BPM.canvas.getWidth() || this.x > this.constraints.width) {
                speedX = -speedX;
            }
            if (this.y > BPM.canvas.getHeight() || this.y > this.constraints.height) {
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

            for (i in args.state.walls) {
                var w = args.state.walls[i];

                if (w.isColliding(this.x, this.y, this.width, this.height)) {
                    var colSide = w.getCollisionSide(this.x, this.y, this.width, this.height);

                    if (colSide === "left" || colSide === "right") {
                        if (colSide === "left") {
                            this.x = w.x - this.width;
                        } else {
                            this.x = w.x + w.width;
                        }

                        speedX = -speedX; 
                    }

                    if (colSide === "top" || colSide === "bottom") {
                        if (colSide === "top") {
                            this.y = w.y - this.height;
                        } else {
                            this.y = w.y + w.height;
                        }
 
                        speedY = -speedY; 
                    }
                }
            }
        },

        render: function(gc) {
            if (ghost) {
                gc.globalAlpha = 1 - (ghostTimer / (ghostInterval * 1000));
            }

            if (iron) {
                gc.drawImage(BubbleAssets.iron, this.x, this.y);
            }

            gc.drawImage(this.img, this.x, this.y);
            gc.drawImage(BubbleAssets.glare, this.x, this.y);

            if (ghost) {
                gc.globalAlpha = 1;
            }
        },
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

                    if (!bubble.popped) {
                        bubble.onPop(args);
                        bubble.popped = true;
                    }
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

        args.state.comboScore += value;
        var overallText = FloatText(args.state.comboScore, this.x+32, this.y+32, {
            stroke: true,
            fillStyle: ftColor,
            font: "24px Arial",
            lineWidth: 3,
        });
        overallText.scrolls = false;

        args.state.addFloatText(overallText);

        BPM.cash += value;
    };

    return base;
};

Bubble.Bad = function(base) {
    base = Bubble.Score(base);

    base.img = BubbleAssets.bad;
    base.worth = (base.options && base.options.worth) || -10;

    return base;
};

Bubble.Goal = function(base) {
    base.img = BubbleAssets.goal;

    return base;
};

Bubble.Ammo = function(base) {
    base.img = BubbleAssets.ammo;

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
    base.popped = false;

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        args.state.pins.push(Pin(base.x + (base.width / 2), base.y + (base.height / 2), args.pin.angle-45, {speed: args.pin.speed, type: "standard"}));
        args.state.pins.push(Pin(base.x + (base.width / 2), base.y + (base.height / 2), args.pin.angle+45, {speed: args.pin.speed, type: "standard"}));

        if (!base.popped) {  
            // temp fix for double bubble issues
            superOnPop.call(base, args);
            base.popped = true;
        }
    };

    var superOnCollision = base.onCollision;
    base.onCollision = function(args) {
        // temp fix for double bubble issues
        if (!base.popped) {
            args.pin.onDeath(args.state.pins);
            superOnCollision.call(base, args);
            base.popped = true;
        }
    };

    return base;
};

Bubble.Combo = function(base) {
    base.img = BubbleAssets.combo;

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

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        var expl = Explosion(this.x, this.y, args.pin);
        expl.init();

        args.state.objects.push(expl);

        superOnPop.call(base, args);
    }; 

    var superUpdate = base.update;
    base.update = function(args) {
        superUpdate.call(base, args);
    };

    return base;
};

Bubble.Action = function(base) {
    base.img = BubbleAssets.action;
    base.action = (base.options && base.options.action);

    if (!base.action) {
        console.error("Error: Action bubble action not defined!");
        return base;
    }

    var superOnPop = base.onPop;
    base.onPop = function(args) {
        base.action();
        superOnPop.call(base, args);
    };

    return base;
};
