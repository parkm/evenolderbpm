/*
### Assets ###

Global object that handles the process of loading and obtaining assets.

*/
function Assets() {
    path = {
        levels: "include/levels/",
        assets: "assets/",
        bubbles: "assets/bubbles/"
    };

    // Pin Assets
    PinAssets.arrow = Assets.add("arrow", path.assets + "arrow.png");
    PinAssets.pin = Assets.add("pin", path.assets + "pin.png");

    // Bubble Assets
    BubbleAssets.explode = Assets.add("explosion", path.assets + "explode-124x150-strip23.png");
    BubbleAssets.pop = Assets.add("pop", path.bubbles + "pop-90x100-strip7.png");
    BubbleAssets.glare = Assets.add("bubbleGlare", path.bubbles + "bubble-glare.png");

    BubbleAssets.score = Assets.add("bubbleScore", path.bubbles + "bubble.png");
    BubbleAssets.bad = Assets.add("bubbleBad", path.bubbles + "bubble.png");
    BubbleAssets.goal = Assets.add("bubbleGoal", path.bubbles + "bubble.png");
    BubbleAssets.double = Assets.add("bubbleDouble", path.bubbles + "bubble.png");
    BubbleAssets.reflect = Assets.add("bubbleReflect", path.bubbles + "bubble.png");
    BubbleAssets.combo = Assets.add("bubbleCombo", path.bubbles + "bubble.png");
    BubbleAssets.ammo = Assets.add("bubbleAmmo", path.bubbles + "bubble.png");
    BubbleAssets.bomb = Assets.add("bubbleBomb", path.bubbles + "bubble.png");

    // State Assets
    StateAssets.background = Assets.add("background", path.assets + "blue-background.jpg");
    StateAssets.wall = Assets.add("wall", path.assets + "wall.png");

    // GUI Assets
    GUIAssets.buttonUp = Assets.add("buttonUp", path.assets + "button-up.png");
    GUIAssets.buttonHover = Assets.add("buttonHover", path.assets + "button-hover.png");
    GUIAssets.buttonDown = Assets.add("buttonDown", path.assets + "button-down.png");

    // Levels
    Assets.loader.addFile("testLevel", path.levels + "test-level.json");

    // Returning self to cascade.
    return Assets;
}


Assets.list = [];
Assets.loader = Loader();

// Add to asset list, return added image
Assets.add = function(_id, assetName) {
    Assets.list.push({
        id: _id,
        image: Assets.loader.image(assetName),
    });

    var len = Assets.list.length - 1;
    return Assets.list[len].image;
};

Assets.get = function(id) {
    for (i in Assets.list) {
        if (Assets.list[i].id === id) {
            return Assets.list[i].image;
        }
    }
};

// Convenience wrapper to keep things simple.
Assets.load = function(callback) {
    Assets.loader.load(callback);
};

/* 
    Provides useful functions for level assets.
 */
Assets.level = {
    getType: function(filepath) {
        // Get type and editor from filepath
        var type;
        var editor;
        if (filepath.slice(-4) === "json") {
            type = "json";
            editor = "tiled";
        } else if (filepath.slice(-3) === "oel") {
            type = "xml";
            editor = "ogmo";
        } else if (filepath.slice(-3) === "xml") {
            type = "xml";
            editor = "tiled";
        } else {
            console.error("Error loading level data. Unsupported filetype.");
            return;
        }
        return {type: type, editor: editor};
    },
    
    parse: function(data, editor) {
        // Parse data per editor
        // Needs to be custom wired for different methods of data organization
        var result = {
            bubbles: [],
            walls: []
        };

        var walls;
        var bubbles;
        switch(editor) {
            case "ogmo":
                bubbles = data.bubbles.Bubble;
                walls = data.walls.Wall;
                break;

            case "tiled":
                // Loop through layers, assign references
                for (var i in data.layers) {
                    switch(data.layers[i].name) {
                        case "walls":
                            walls = data.layers[i].objects;
                            break;

                        case "bubbles":
                            bubbles = data.layers[i].objects;
                            break;
                    }
                }

                break;
        }

        // Assign values and convert
        // Walls
        for (var i in walls) {
            var w = walls[i];
            var rw = result.walls[i] = {};
            rw.x = +w.x;
            rw.y = +w.y;
            rw.height = +w.height;
            rw.width = +w.width;
        }
        
        // Bubbles
        for (var i in bubbles) {
            var b = bubbles[i];
            var rb = result.bubbles[i] = {};
            // Merge properties to bubble object if using tiled.
            // Do this here to avoid having to loop through all bubbles again.
            if (editor === "tiled") {
                $.extend(b, b.properties);
            }
            rb.x = +b.x;
            rb.y = +b.y;
            rb.speed = +b.speed;
            // b.moveAngle for ogmo
            rb.angle = +(b.moveAngle || b.angle);
            rb.type = b.type;
            rb.count = +b.count || 1;
            rb.randomPosition = b.randomPosition && Utils.stringToBool(b.randomPosition);
            rb.iron = b.iron && Utils.stringToBool(b.iron);
        }
        return result;
    }
};


