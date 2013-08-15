BubbleAssets = {};

function Bubble(x, y, type, options) {
    var base = Bubble.Base(x, y, type, options);
    
    switch(type) {
        case "score":
            return Bubble.Score(base);
            break;
    }
}

Bubble.Base = function(_x, _y, _type, options) {
    return {
        x: _x, y: _y,
        width: 32, height: 32,
        angle: Math.random() * 360,
        speedX: 0,
        speedY: 0,
        speed: 0.75,

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

        }
    };
}

Bubble.Score = function(base) {
    base.worth = 10;

    base.render = function(gc) {
        var img = BubbleAssets.bubble;
        gc.fillStyle = "rgba(0, 0, 255, .25)";
        gc.fillRect(base.x, base.y, img.width, img.height);
        gc.drawImage(img, base.x, base.y);
    }

    base.onPop = function(bubbles, pin) {
        BPM.cash += base.worth;
    }
    return base;
}
