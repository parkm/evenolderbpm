function Wall() {
    var nineSlice = NineSlice(StateAssets.wall);
    nineSlice.topLeft = Rect(0, 0, 2, 2);
    nineSlice.top = Rect(2, 0, 28, 2);
    nineSlice.topRight = Rect(30, 0, 2, 2);
    nineSlice.right = Rect(30, 2, 2, 28);
    nineSlice.bottomRight = Rect(30, 30, 2, 2);
    nineSlice.bottom = Rect(2, 30, 28, 2);
    nineSlice.bottomLeft = Rect(0, 30, 2, 2);
    nineSlice.left = Rect(0, 2, 2, 28);
    nineSlice.center = Rect(2, 2, 28, 28);

    return {
        x: 0, y: 0,
        width: 0, height: 0,

        onCollision: function(pin, pins) {
            
        },

        render: function(gc) {
            nineSlice.render(gc, this.x, this.y, this.width, this.height);
        },
    }
}