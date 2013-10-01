GUIAssets = {};

function GUIButton(_text, options) {
    var upImg = GUIAssets.buttonUp;
    var hoverImg = GUIAssets.buttonHover;
    var downImg = GUIAssets.buttonDown;

    var topLeft = Rect(0, 0, 23, 27);
    var top = Rect(23, 0, 128, 27);
    var topRight = Rect(151, 0, 23, 27);
    var right = Rect(151, 27, 23, 18);
    var bottomRight = Rect(151, 45, 23, 20);
    var bottom = Rect(23, 45, 128, 20);
    var bottomLeft = Rect(0, 45, 23, 20);
    var left = Rect(0, 27, 23, 18);
    var center = Rect(23, 27, 128, 18);

    var dynamic = options && options.dynamic !== undefined ? options.dynamic : true;
    var onClick = options && options.onClick !== undefined ? options.onClick : null;

    var up = NineSlice(upImg);
    up.topLeft = topLeft;
    up.top = top;
    up.topRight = topRight;
    up.right = right;
    up.bottomRight = bottomRight;
    up.bottom = bottom;
    up.bottomLeft = bottomLeft;
    up.left = left;
    up.center = center;

    var hover = NineSlice(hoverImg);
    hover.topLeft = topLeft;
    hover.top = top;
    hover.topRight = topRight;
    hover.right = right;
    hover.bottomRight = bottomRight;
    hover.bottom = bottom;
    hover.bottomLeft = bottomLeft;
    hover.left = left;
    hover.center = center;

    var down = NineSlice(downImg);
    down.topLeft = topLeft;
    down.top = top;
    down.topRight = topRight;
    down.right = right;
    down.bottomRight = bottomRight;
    down.bottom = bottom;
    down.bottomLeft = bottomLeft;
    down.left = left;
    down.center = center;

    return {
        text: _text,

        x: options.x === undefined ? 0 : options.x,
        y: options.y === undefined ? 0 : options.y,
        width: 0,
        height: 0,
        postWidth: 0,
        postHeight: 0,

        onClick: onClick, //Setting the private var public

        position: "up",

        update: function(mouse) {
            if (mouse.isColliding(this.x, this.y, this.x + this.postWidth, this.y + this.postHeight)) {
                if (mouse.isDown(Mouse.LEFT)) {
                    this.position = "down";
                    held = true;
                } else {
                    this.position = "hover";
                }

                if (mouse.isReleased(Mouse.LEFT)) {
                    if (this.onClick) {
                        this.onClick();
                    }
                }
            } else {
                this.position = "up";
            }
        },

        render: function(gc) {
            gc.fillStyle = "#FFFFFF";
            gc.strokeStyle = "#000000";
            gc.textBaseline = "top";
            gc.font = options.font || "32px Arial";
            gc.textAlign = "center"
            gc.lineWidth = 3;

            var metrics = gc.measureText(this.text);

            var width, height;

            if (dynamic) {
                width = metrics.width;
                height = gc.measureText("M").width + 16;
            } else {
                width = this.width;
                height = this.height;
            }

            switch(this.position) {
                case "up":
                    up.render(gc, this.x, this.y, width, height); 
                    break;

                case "hover":
                    hover.render(gc, this.x, this.y, width, height);
                    break;

                case "down":
                    down.render(gc, this.x, this.y, width, height);
                    break;
            }


            var x = this.x + width/2 + left.width/2;
            var y = this.y + height/2 - bottom.height/2;

            gc.strokeText(this.text, x, y);
            gc.fillText(this.text, x, y);

            this.postWidth = width + topRight.width;
            this.postHeight = height + bottomRight.height;
        },
    }
}

function RoundSelectButton(text, color) {
    return {
        x: 0, y: 0,
        postX: 0, postY: 0,
        width: 400, height: 32,
        text: text, 
        color: color,
        position: "up",
        onClick: null,
        state: null,

        update: function(mouse) {
            if (mouse.isColliding(this.x, this.y, this.x+this.width, this.y+this.height)) {
                this.position = "hover";

                if (mouse.isDown(Mouse.LEFT)) {
                    this.position = "down";
                }

                if (mouse.isReleased(Mouse.LEFT)) {
                    if (this.onClick) {
                        this.onClick();
                    } else if (this.state) {
                        State.set(this.state);
                    }
                }
            } else {
                this.position = "up";
            }
        },

        render: function(gc) {
            var x = this.x;
            var y = this.y;

            gc.fillStyle = this.color;
            gc.strokeStyle = "#000000";
            gc.fillRect(x, y, this.width, this.height);

            gc.fillStyle = "rgba(255, 255, 255, 0.5)";
            gc.fillRect(x, y, this.width, this.height/2);

            gc.lineWidth = 4;
            gc.strokeRect(x, y,  this.width, this.height);

            Utils.drawText(gc, this.text, this.width/2+x, y+5, {
                fillStyle: "#FFFFFF",
                strokeStyle: "#000000",
                stroke: true,
                lineWidth: 5,
                font: "16px Arial"
            });

            switch(this.position) {
                case "hover":
                    gc.fillStyle = "rgba(255, 255, 255, 0.5)";
                    gc.fillRect(x, y, this.width, this.height);
                    break;

                case "down":
                    gc.fillStyle = "rgba(0, 0, 0, 0.5)";
                    gc.fillRect(x, y, this.width, this.height);
                    break;
            }
        },
    }
}

function FloatText(_text, _x, _y, _formatting) {
    return {
        text: _text,
        x: _x,
        y: _y,
        formatting: _formatting,
        time: 2,
        timer: 0,
        scrolls: true,

        onDeath: function(args) {

        },

        update: function(args) {
            if (this.scrolls) {
                this.y--;
            }
            this.timer += args.delta;

            if (this.timer >= this.time * 1000) {
                this.onDeath(args);
            }
        },

        render: function(gc) {
            gc.globalAlpha = 1 - (this.timer / (this.time * 1000));

            Utils.drawText(gc, this.text, this.x, this.y, this.formatting);

            gc.globalAlpha = 1;
        },
    }
}

function ScrollField() {
    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,

        left: 0, 
        right: 0, 
        top: 0, 
        bottom: 0, 

        scroll: 0,
        scrollSpeed: 0,
        invert: false,

        update: function() {
            var col = this.collision(BPM.mouse);

            if (col === (this.invert ? "top" : "bottom")) {
                if (this.getBottomConstraint()) {
                    this.scroll += this.scrollSpeed;
                }
            } else if (col === (this.invert ? "bottom" : "top")) {
                if (this.getTopConstraint()) {
                    this.scroll -= this.scrollSpeed;
                }
            }
        },

        collision: function(testObj) {
            if (testObj.x >= this.left && testObj.x <= this.right) {
                if (testObj.y >= this.top) {
                    return "bottom";
                } else if (testObj.y <= this.bottom) {
                    return "top";
                }
            }
            return false;
        },

        getTopConstraint: function() {
            return true;
        },

        getBottomConstraint: function() {
            return true;
        },

        startClipping: function(gc) {
            gc.save();
            gc.beginPath();
            gc.rect(this.x, this.y, this.width, this.height);
            gc.clip();
        },

        stopClipping: function(gc) {
            gc.restore();
        },
    }
}

function Interval(_duration, _onComplete) {
    return {
        //Is the interval on?
        active: false,
        completed: false,
        onComplete: _onComplete,

        ease: undefined,
        t: 0, //Percent completed with easing.

        // Timing information.
        time: 0, //Current time
        duration: _duration,

        update: function(delta) {
            if (!this.completed && this.active) {
                this.time += delta;
                this.t = this.time / (this.duration * 1000);

                if (this.ease && this.t > 0 && this.t < 1) {
                    this.t = this.ease(this.t);
                }

                if (this.time >= this.duration * 1000) {
                    this.t = 1;
                    this.completed = true;
                    if (this.onComplete) {
                        this.onComplete();
                    }
                }
            }
        },

        start: function() {
            this.time = 0;
            if (this.duration === 0) {
                this.active = false;
                return;
            }
            this.active = true;
            this.completed = false;
        },

        //Resets the interval back to 0 but doesn't start.
        stop: function() {
            this.time = this.duration;
            this.active = false;
            this.completed = false;
        },

        getPercent: function() {
            return this.time / (this.duration * 1000);
        },

        setPercent: function(value) {
            this.time = (this.duration * value) * 1000;
        },

        getScale: function() {
            return this.t;
        },
    };
}

function ValueInterval(initial, to, duration, onComplete) {
    var base = Interval(duration, onComplete);

    base.initial = initial;
    base.to = to;
    base.value = initial;

    var superUpdate = base.update;
    base.update = function(delta) {
        superUpdate.call(base, delta);

        base.value = base.initial + (base.to - base.initial) * base.getScale();
    };

    return base;
}

var Ease = {};

Ease.PI2 = Math.PI / 2;

Ease.sineIn = function(t) {
    return -Math.cos(Ease.PI2 * t) + 1;
};

Ease.sineOut = function(t) {
    return Math.sin(Ease.PI2 * t);
};

Ease.sineInOut = function(t) {
    return -Math.cos(Math.PI * t) / 2 + 0.5;
};
