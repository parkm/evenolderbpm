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
    var moveSettings = {
        // Original x, y positions
        x: options.x || 0,
        y: options.y || 0,
        line: options.moveLine,
        position: 0,
        speed: (options.moveSpeed || 1) * 0.1,
        auto: options.moveAuto,
        loop: options.moveLoop
    };

    return {
        type: "wall", id: options.id || "",
        x: options.x || 0, y: options.y || 0,
        width: options.width || 0, height: options.height || 0,
        speedX: 0, speedY: 0,

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

        move: function(delta) {
            // Go through line positions, if line has moved to requested position, start next line position
            // otherwise, move by speed
            var m = moveSettings;
            if (m.line) {
                var line = m.line[m.position];
                // wall has moved to or past it's designated X position
                var xdir = line.x < m.x ? -1 : 1;
                var ydir = line.y < m.y ? -1 : 1;
                // if line is to the right of the wall, stop moving at x + width
                // if line is to the left, stop at x
                var xdone = (xdir > 0 && this.x + this.width >= line.x) || (xdir < 0 && this.x <= line.x);
                var ydone = (ydir > 0 && this.y + this.height >= line.y) || (ydir < 0 && this.y <= line.y);
                if (xdone && ydone) {
                    if (m.position < m.line.length - 1) {
                        // Set previous position
                        m.x = this.x;
                        m.y = this.y;
                        m.position++;
                    } else if (m.loop) {
                        m.position = 0;
                    }
                } else {
                    if (!xdone) {
                        this.speedX = m.speed * xdir * delta;
                        this.x += this.speedX;
                    } else {
                        this.speedX = 0;
                    }
                    if (!ydone) {
                        this.speedY = m.speed * ydir * delta;
                        this.y += this.speedY;
                    } else {
                        this.speedY = 0;
                    }
                }
            }
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

        update: function(args) {
            if (moveSettings.auto) {
                this.move(args.delta);
            }
        }
    }
}
