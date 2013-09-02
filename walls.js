function Wall(options) {
    options = options || {};
    var nineSlice = NineSlice(StateAssets.wall);
    nineSlice.topLeft = Rect(0, 0, 2, 2);
    nineSlice.top = Rect(2, 0, 28, 2);
    nineSlice.topRight = Rect(30, 0, 2, 2);
    nineSlice.right = Rect(30, 2, 2, 28);
    nineSlice.bottomRight = Rect(30, 30, 2, 2);
    nineSlice.bottom = Rect(2, 30, 28, 2);
    nineSlice.bottomLeft = Rect(0, 30, 2, 2);
    nineSlice.left = Rect(0, 2, 2, 28);

    var center = Rect(2, 2, 28, 28);

    return {
        type: "wall",
        x: options.x || 0, y: options.y || 0,
        width: options.width || 0, height: options.height || 0,

        onCollision: function(pin, pins) {
            
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

        isCollidingDirection: function(direction, pos, length, speed) {
            var thisPos;
            var thisLength;

            if (direction === "horizontal") {
                thisLength = this.width;
                thisPos = this.x;
            } else if (direction === "vertical") {
                thisLength = this.height;
                thisPos = this.y;
            }

            if (pos <= thisPos + thisLength && pos > thisPos + thisLength - speed
            || pos + length >= thisPos && pos + length < thisPos + speed
            ) {
                return true;
            }

            return false;
        },

        render: function(gc) {
            gc.save();
            gc.beginPath();
            gc.rect(this.x, this.y, this.width, this.height);
            gc.clip();

            for (var i=0; i<this.width/center.width; ++i) {
                for (var j=0; j<this.height/center.height; ++j) {
                    gc.drawImage(StateAssets.wall, center.x, center.y, center.width, center.height, this.x + i*center.width, this.y + j*center.height, center.width, center.height);
                }
            }

            gc.restore();

            nineSlice.render(gc, this.x, this.y, this.width, this.height);
        },
    }
}
