BubbleAssets = {};

function Bubble(x, y, type, options) {
    var base = Bubble.Base(x, y, type, options);

    // Capitalize first letter of type
    type = type.slice(0, 1).toUpperCase() + type.slice(1);

    // Get bubble of given type
    if (Bubble[type]) {
        base = Bubble[type](base);
    }

    return base;
}

Bubble.Base = function(_x, _y, _type, options) {
    var iron = options && options.iron;
    var action = options && options.action;
    var ghost = options && options.ghost;
    return {
        x: _x, y: _y,
        width: 32, height: 32,
        angle: (options && options.angle) || Math.random() * 360,
        speedX: (options && options.speedX) || 0,
        speedY: (options && options.speedY) || 0,
        speed: (options && options.speed) || 0.75,
        color: "rgba(0, 0, 0, .25)",
        img: BubbleAssets.score,

        /* args = bubbles */
        onPop: function(args) {
            if (!iron) {
                args.bubbles.splice(args.bubbles.indexOf(this), 1);
            }
        },
        
        /* args = bubbles, pin, pins */
        onCollision: function(args) {
            if (action) {
                action();
            }
            if (iron) {
                args.pin.onDeath(args.pins);
            }
            this.onPop(args);
        },

        init: function() {
            this.speedX = Math.cos(this.angle * (Math.PI / 180));
            this.speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        update: function(delta) {
            //Standard bubble movement.
            if (this.x < 0) {
                this.speedX = -this.speedX;
            }
            if (this.y < 0) {
                this.speedY = -this.speedY;
            }
            if (this.x > BPM.canvas.getWidth()) {
                this.speedX = -this.speedX;
            }
            if (this.y > BPM.canvas.getHeight()) {
                this.speedY = -this.speedY;
            }

            this.x += this.speedX * this.speed;
            this.y += this.speedY * this.speed;

        },

        render: function(gc) {
            gc.fillStyle = this.color;
            gc.fillRect(this.x, this.y, this.img.width, this.img.height);
            gc.drawImage(this.img, this.x, this.y);
        }
    };
};

/* Bubble Types */

Bubble.Score = function(base) {
    base.img = BubbleAssets.score;
    base.color = "rgba(0, 0, 255, .25)";
    base.worth = (options && options.worth) || 10;
    
    var s_onPop = base.onPop;
    base.onPop = function(bubbles, pin) {
        s_onPop.call(base, bubbles, pin);
        BPM.cash += base.worth;
    };

    return base;
};

Bubble.Bad = function(base) {
    base = Bubble.Score(base);

    base.img = BubbleAssets.bad;
    base.color = "rgba(255, 0, 0, .25)";
    base.worth = (options && options.worth) || -10;

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

};

Bubble.Combo = function(base) {

};

Bubble.Reflect = function(base) {

};

Bubble.Bomb = function(base) {

};
