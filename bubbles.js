BubbleAssets = {};

function Bubble(x, y, type, options) {
    var base = BaseBubble(x, y, type, options);
    
    switch(type) {
        case "score":
            return BubbleScore(base);
            break;
    }
}

function BaseBubble(_x, _y, _type, options) {
    return {
        x: _x, y: _y,
        angle: Math.random() * 360,
        speedX: 0,
        speedY: 0,
        speed: 0.75,

        onCollision: function(pin) {
            this.onPop();
        },

        onPop: function() {

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

        },
    }
}

function BubbleScore(base) {
    base.worth = 10;

    base.render = function(gc) {
        var img = BubbleAssets.bubble;
        gc.fillStyle = "rgba(0, 0, 255, .25)";
        gc.fillRect(base.x, base.y, img.width, img.height);
        gc.drawImage(img, base.x, base.y);
    }

    base.onPop = function() {
        BPM.cash += base.worth;
    }
    return base;
}
