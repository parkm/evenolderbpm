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
    Assets.addLevels(StateAssets, path.levels, {
        "testLevelJSON": "test-level.json",
        "testLevelXML": "test-level.oel"
    });

    // Returning self to cascade.
    return Assets;
}


Assets.list = [];
Assets.loader = Loader();

// Add to asset list, return added image
// Images Only
Assets.add = function(_id, assetName) {
    Assets.list.push({
        id: _id,
        image: Assets.loader.image(assetName),
    });

    var len = Assets.list.length - 1;
    return Assets.list[len].image;
};

// Images Only
Assets.get = function(id) {
    for (i in Assets.list) {
        if (Assets.list[i].id === id) {
            return Assets.list[i].image;
        }
    }
};

/*  Assets.load
    Wrapper to initiate loading sequence.

    callback:
            callback function to call when complete
*/
Assets.load = function(callback) {
    Assets.loader.load(callback);
};

/*  Assets.addLevels
    Wrapper to load level data

    holder:
            object to hold loaded files. Stores data in holder[id],
            where id is the matching key in files object
    path:
            base file path, gets added to file name.
            pass an empty string if file is in working directory
    files:
            object containing all files to load.
            format: "levelID": "filename.extension"
*/
Assets.addLevels = function(holder, path, files) {
    for (var id in files) {
        Assets.loader.file(id, path + files[id], function(cid, cpath, cdata) {
            // Prefix c to params to differentiate vars in callback
            cdata = Assets.level.parse(cdata, cpath);
            holder[cid] = cdata;
        });
    }
};

/*  Assets.level
    Provides useful functions for level assets. Use as a static object.

    getType:
            returns an object with file type and editor
            supported:
                xml: ogmo, (tiled not yet tested)
                json: tiled
    parse:
            parses level data to a consistent state. Must be hand-wired for each new format.
            must be called on a loaded callback.
            returns parsed data
*/
Assets.level = {
    getEditor: function(filepath) {
        // Get type and editor from filepath
        filepath = filepath.toLowerCase();
        var editor = {
            "oel": "ogmo",
            "xml": "tiled",
            "json": "tiled"
        };

        for (var type in editor) {
            var ext = filepath.slice(-type.length);
            if (type === ext) {
                return editor[type];
            }
        }
    },
    
    parse: function(data, filepath) {
        // Get editor from filepath
        var editor = this.getEditor(filepath);

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


