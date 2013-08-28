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

        /* args = bubbles, pin, pins */
        onPop: function(args) {
            if (!iron) {
                var pop = PopEffect(this.x, this.y);
                pop.init();
                args.state.objects.push(pop);
                args.state.bubbles.splice(args.state.bubbles.indexOf(this), 1);
            }
        },
        
        /* args = bubbles, pin, pins */
        onCollision: function(args) {
            if (action) {
                action();
            }

            if (iron) {
                args.pin.onDeath(args.state.pins);
            }

            this.onPop(args);
        },

        init: function() {
            speedX = Math.cos(this.angle * (Math.PI / 180));
            speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        update: function(delta) {
            if (ghost) {
                ghostTimer += delta;

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
        },

        render: function(gc) {
            if (ghost) {
                gc.globalAlpha = 1 - (ghostTimer / (ghostInterval * 1000));
            }

            gc.fillStyle = this.color;
            gc.fillRect(this.x, this.y, this.img.width, this.img.height);
            gc.drawImage(this.img, this.x, this.y);

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
                args.objects.splice(args.objects.indexOf(this), 1);
                complete = false;
            }
        },

        render: function(gc) {
            this.anim.render(gc);
        },

        onPop: function(args) {},

        onCollision: function(args) {},
    }
}

/* Bubble Types */

Bubble.Score = function(base) {
    base.img = BubbleAssets.score;
    base.color = "rgba(0, 0, 255, .25)";
    base.worth = (base.options && base.options.worth) || 10;
    
    var s_onPop = base.onPop;
    base.onPop = function(args) {
        s_onPop.call(base, args);
        BPM.cash += base.worth;
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

Bubble.Rainbow = function(base) {

};

Bubble.Ammo = function(base) {

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

};
