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

        onCollision: function(pin) {
            this.onPop();
        },

        onPop: function() {

        },

        update: function(delta) {

        },

        render: function(gc) {

        },
    }
}

function BubbleScore(base) {
    base.worth = 10;

    base.render = function(gc) {
        var img = Assets.get("bubble");
        gc.fillStyle = "rgba(0, 0, 255, .25)";
        gc.fillRect(base.x, base.y, img.width, img.height);
        gc.drawImage(img, base.x, base.y);
    }

    base.onPop = function() {
        BPM.cash += base.worth;
    }
    return base;
}