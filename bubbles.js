BubbleAssets = {};

function Bubble(x, y, type, options) {
    var base = Bubble.Base(x, y, type, options);

    // Modify bubble via attributes
    if (options) {
        Bubble.AttributeFactory(base, options);
    }
    
    // Capitalize first letter of type
    type = type.slice(0, 1).toUpperCase() + type.slice(1);

    // Get bubble of given type
    if (Bubble[type]) {
        base = Bubble[type](base);
    }
    

    return base;
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


        onPop: function(bubbles, pin) {
            bubbles.splice(bubbles.indexOf(this), 1);
        },

        onCollision: function(bubbles, pin) {
            this.onPop(bubbles, pin);
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
    
    var s_onPop = base.onPop;
    base.onPop = function(bubbles, pin) {
        s_onPop.apply(base, [bubbles, pin]);
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

Bubble.AttributeFactory = function(base, options) {
    var s_onCollision = base.onCollision;
    base.onCollision = function(bubbles, pin, pins) {
        s_onCollision.call(base, bubbles, pin, pins);
        if (options.iron) {
            pin.onDeath(pins);
        }
        
        if (options.action) {
            options.action();
        }

        if (options.ghost) {

        }
    };

    var s_update = base.update;
    base.update = function(delta) {
        if (!options.iron) {
            s_onUpdate.call(base, delta);
        }
    };

    var s_onPop = base.onPop;
    base.onPop = function(bubbles, pin) {
        if (!options.iron) {
            s_onPop.call(base, bubbles, pin);
        }
    };

    console.log(base);

    return base;
};
