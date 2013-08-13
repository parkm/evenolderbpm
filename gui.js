GUIAssets = {};

function GUIButton(_text, options) {
    var upImg = Assets.get("buttonUp");
    var hoverImg = Assets.get("buttonHover");
    var downImg = Assets.get("buttonDown");

    var topLeft = Rect(0, 0, 23, 27);
    var top = Rect(23, 0, 128, 27);
    var topRight = Rect(151, 0, 23, 27);
    var right = Rect(151, 27, 23, 18);
    var bottomRight = Rect(151, 45, 23, 20);
    var bottom = Rect(23, 45, 128, 20);
    var bottomLeft = Rect(0, 45, 23, 20);
    var left = Rect(0, 27, 23, 18);
    var center = Rect(23, 27, 128, 18);

    var dynamic = options && options.dynamic != null ? options.dynamic : true;
    var onClick = options && options.onClick ? options.onClick : null;

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

        x: 0,
        y: 0,
        width: 0,
        height: 0,
        postWidth: 0,
        postHeight: 0,

        onClick: onClick, //Setting the private var public

        state: "up",

        update: function(mouse) {
            if (mouse.isColliding(this.x, this.y, this.x + this.postWidth, this.y + this.postHeight)) {
                if (mouse.isDown(Mouse.LEFT)) {
                    this.state = "down";
                    held = true;
                } else {
                    this.state = "hover";
                }

                if (mouse.isReleased(Mouse.LEFT)) {
                    if (this.onClick) {
                        this.onClick();
                    }
                }
            } else {
                this.state = "up";
            }
        },

        render: function(gc) {
            gc.fillStyle = "#FFFFFF";
            gc.strokeStyle = "#000000";
            gc.textBaseline = "top";
            gc.font = "32px Arial";
            gc.textAlign = "center"
            gc.lineWidth = 3;

            var metrics = gc.measureText(this.text);

            var width, height;

            if (dynamic) {
                width = metrics.width;
                height = 48;
            } else {
                width = this.width;
                height = this.height;
            }

            switch(this.state) {
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
