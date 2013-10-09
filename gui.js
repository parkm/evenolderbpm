GUIAssets = {};

function StaticText(text, options) {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');

    ctx.font = options && options.font;
    var metrics = ctx.measureText(text);

    var centered = options && options.textAlign;
    var xOffset = 0;
    if (!centered) {
        xOffset = metrics.width;
    }

    c.width = metrics.width + xOffset;
    Utils.drawText(ctx, text, xOffset, 0, options);

    return {
        cache: c,
        x: 0, y: 0,
        text: text,
        width: metrics.width,

        render: function(gc) {
            gc.drawImage(this.cache, this.x - xOffset, this.y);
        }
    }
}

function GUIButton(_text, options) {
    var upImg = GUIAssets.buttonUp;
    var hoverImg = GUIAssets.buttonHover;
    var downImg = GUIAssets.buttonDown;

    var textField = StaticText(_text, {
        fillStyle: "#FFFFFF",
        strokeStyle: "#000000",
        stroke: true,
        lineWidth: 3,
        font: options.font || "32px Arial"
    });

    var dynamic = options && options.dynamic !== undefined ? options.dynamic : true;
    var onClick = options && options.onClick !== undefined ? options.onClick : null;

    var up = NineSlice(upImg);
    up.setDimensions(Rect(23, 27, 128, 18));

    var hover = NineSlice(hoverImg);
    hover.copyDimensions(up);

    var down = NineSlice(downImg);
    down.copyDimensions(up);

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
            var width, height;

            if (dynamic) {
                width = textField.width;
                height = gc.measureText("M").width + 16;
            } else {
                width = this.width;
                height = this.height;
            }

            switch(this.position) {
                case "up":
                    up.renderCache(gc, this.x, this.y, width, height);
                    break;

                case "hover":
                    hover.renderCache(gc, this.x, this.y, width, height);
                    break;

                case "down":
                    down.renderCache(gc, this.x, this.y, width, height);
                    break;
            }

            var x = this.x + width/2 + up.left.width/2;
            var y = this.y + height/2 - up.bottom.height/2;

            textField.x = x;
            textField.y = y;
            textField.render(gc);

            this.postWidth = width + up.topRight.width;
            this.postHeight = height + up.bottomRight.height;
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
        textField: StaticText(text, {
            fillStyle: "#FFFFFF",
            strokeStyle: "#000000",
            stroke: true,
            lineWidth: 5,
            font: "16px Arial"
        }),

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

            this.textField.x = x+this.width/2;
            this.textField.y = y+5;
            this.textField.render(gc);

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
        textField: StaticText(_text, _formatting),

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

            this.textField.x = this.x;
            this.textField.y = this.y;
            this.textField.render(gc);

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

function StatusBar() {
    var back = GUIAssets.barBack;
    var front = GUIAssets.barFront;

    var backSlice = NineSlice(back);
    var frontSlice = NineSlice(front);

    backSlice.setDimensions(Rect(12, 12, 25, 4));
    frontSlice.copyDimensions(backSlice);

    return {
        x: 0, y: 0,
        width: 0, height: 0,
        ratio: 0,

        render: function(gc) {
            gc.globalAlpha = 0.75;
            backSlice.render(gc, this.x, this.y, this.width, this.height);

            gc.globalAlpha = 1;
            if (this.ratio > 0) {
                frontSlice.render(gc, this.x, this.y, this.width * this.ratio, this.height);
            }
        }
    }
}
