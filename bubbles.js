BubbleAssets = {};

function Bubble(x, y, type, options) {
    var base = Bubble.Base(x, y, type, options);

    var result;
    
    // Get bubble of certain type
    switch(type) {
        case "score":
            result = Bubble.Score(base);
            break;

        case "bad":
            result = Bubble.Bad(base);
            break;

        case "goal":
            result = Bubble.Goal(base);
            break;

        case "rainbow":
            result = Bubble.Rainbow(base);
            break;

        case "ammo":
            result = Bubble.Ammo(base);
            break;

        case "double":
            result = Bubble.Double(base);
            break;

        case "combo":
            result = Bubble.Combo(base);
            break;

        case "reflect":
            result = Bubble.Reflect(base);
            break;

        case "bomb":
            result = Bubble.Bomb(base);
            break;

        default:
            result = Bubble.Score(base);
            break;
    }
    
    // Modify bubble via attributes
    if (options && options.attribute) {
        switch(options.attribute) {
            case "iron":
                result = Bubble.Iron(result);
                break;

            case "ghost":
                result = Bubble.Ghost(result);
                break;

            case "event":
                result = Bubble.Ghost(result);
                break;

            case "big":
                result = Bubble.Big(result);
                break;

            default:
                break;
        }
    }

    return result;

}

Bubble.Base = function(_x, _y, _type, options) {

    return {
        x: _x, y: _y,
        width: 32, height: 32,
        angle: (options && options.angle) || Math.random() * 360,
        speedX: (options && options.speedX) || 0,
        speedY: (options && options.speedY) || 0,
        speed: (options && options.speed) || 0.75,
        color: "rgba(0, 0, 0, .25)",
        img: BubbleAssets.score,

        onCollision: function(bubbles, pin) {
            this.onPop(bubbles, pin);
            bubbles.splice(bubbles.indexOf(this), 1);
        },

        onPop: function(bubbles, pin) {

        },

        init: function() {
            this.speedX = Math.cos(this.angle * (Math.PI / 180));
            this.speedY = -Math.sin(this.angle * (Math.PI / 180));
        },

        update: function(delta) {
            //Standard bubble movement.
            if (this.x < 0) 
                this.speedX = -this.speedX;
            if (this.y < 0)
                this.speedY = -this.speedY;
            if (this.x > BPM.canvas.getWidth())
                this.speedX = -this.speedX;
            if (this.y > BPM.canvas.getHeight())
                this.speedY = -this.speedY;

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
    base.worth = 10;

    base.onPop = function(bubbles, pin) {
        BPM.cash += base.worth;
    };

    return base;
};

Bubble.Bad = function(base) {
    base = Bubble.Score(base);

    base.img = BubbleAssets.bad;
    base.color = "rgba(255, 0, 0, .25)";
    base.worth = -10;

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


/* Bubble Attributes */
/* These are passed a complete bubble object,
 * these functions just modify that object. */

Bubble.Iron = function(base) {
    base.color = "rgba(0, 0, 0, 1)";

    base.onCollision = function(bubbles, pin, pins) {
        pin.onDeath(pins);
    };

    base.update = function(delta) {
        // No movement.
    };

    return base;

};

Bubble.Ghost = function(base) {

};

Bubble.Event = function(base) {

};

Bubble.Big = function(base) {

};
