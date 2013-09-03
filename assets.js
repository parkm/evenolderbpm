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
    Assets.addLevel(StateAssets, "testLevel", path.levels + "test-level.oel");
    //Assets.addLevel(StateAssets, "testLevelJSON", path.levels + "test-level.json");
    
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

// Convenient wrapper to load JSON level data (from XML file)
// and assign to an assetHolder object with given name
Assets.addLevel = function(assetHolder, name, filepath) {
    // Type checking
    if (typeof name !== "string") {
        console.error("Error @ Assets.addLevel: Name of level data must be a string.");
        return;
    }
    if (typeof assetHolder !== "object") {
        console.error("Error @ Assets.addLevel: Please specify an object to store level data.");
        return;
    }
    
    var parseData = function(data, editor) {
        if (typeof editor === "string") {
            editor = editor.toLowerCase();
            switch(editor) {
                case "ogmo":
                    data.walls = data.walls.Wall;
                    for (var i = 0; i < data.walls.length; i++) {
                        var wall = data.walls[i];
                        wall.x = +wall.x;
                        wall.y = +wall.y;
                        wall.height = +wall.height;
                        wall.width = +wall.width;
                    }
                    data.bubbles = data.bubbles.Bubble;
                    for (var i = 0; i < data.bubbles.length; i++) {
                        var bubble = data.bubbles[i];
                        bubble.angle = +bubble.moveAngle;
                        bubble.x = +bubble.x;
                        bubble.y = +bubble.y;
                        bubble.count = +bubble.count;
                        bubble.speed = +bubble.speed;
                        bubble.iron = Utils.stringToBool(bubble.iron);
                        bubble.randomPosition = Utils.stringToBool(bubble.randomPosition);
                    }

                    break;

                case "tiled":

                    break;
            }

        }
        return data;
    };

    var loadType = function(type, editor) {
        Assets.loader[type](filepath, function(data) {
            assetHolder[name] = parseData(data, editor);
        });
    };


    if (filepath.slice(-4) === "json") {
        loadType("json", "tiled");
    } else if (filepath.slice(-3) === "oel") {
        loadType("xml", "ogmo");
    } else if (filepath.slice(-3) === "xml") {
        loadType("xml", "tiled");
    } else {
        console.error("Error loading level data. Unsupported filetype.");
        return;
    }
};


