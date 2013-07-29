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

        update: function(delta) {

        },

        render: function(gc) {

        },
    }
}

function BubbleScore(base) {
    base.render = function(gc) {
        gc.drawImage(Assets.get("bubble"), base.x, base.y);
    }

    return base;
}