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
    Assets.addLevels(StateAssets, {
        "testLevel": path.levels + "test-level.oel",
        "testLevelJSON": path.levels + "test-level2.json",
        "testLevelJSON2": path.levels + "test-level3.json"
    });

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
        console.log("Pre-data... editor " + editor);
        console.log(data);
        if (typeof editor === "string") {
            editor = editor.toLowerCase();
            if (editor === "ogmo") {
                data.walls = data.walls.Wall;
                data.bubbles = data.bubbles.Bubble;
                // Convert data
                for (var i = 0; i < data.walls.length; i++) {
                    var wall = data.walls[i];
                    wall.x = +wall.x;
                    wall.y = +wall.y;
                    wall.height = +wall.height;
                    wall.width = +wall.width;
                }
                for (var i = 0; i < data.bubbles.length; i++) {
                    var bubble = data.bubbles[i];
                    bubble.angle = +bubble.moveAngle;
                    bubble.x = +bubble.x;
                    bubble.y = +bubble.y;
                    bubble.count = +bubble.count;
                    bubble.speed = +bubble.speed;
                    bubble.iron = bubble.iron && Utils.stringToBool(bubble.iron);
                    bubble.randomPosition = bubble.randomPosition && Utils.stringToBool(bubble.randomPosition);
                }
            } else if (editor === "tiled") {
                if (!(data.layers && data.layers.length)) return;
                for (var i = 0; i < data.layers.length; i++) {
                    if (data.layers[i].name === "walls") {
                        data.walls = data.layers[i].objects;
                    } else if (data.layers[i].name === "bubbles") {
                        data.bubbles = data.layers[i].objects;
                    }
                }
                
                for (var i = 0; i < data.bubbles.length; i++) {
                    var bubble = data.bubbles[i];
                    bubble.speed = bubble.properties.speed;
                    bubble.angle = bubble.properties.angle;
                }
            }
        }
        console.log("post-data... editor " + editor);
        console.log(data);
        return data;
    };

    var loadType = function(type, editor) {
        if (typeof Assets.loader[type] !== "function") {
            console.error("Error loading level data type '" + type + "': Unsupported type");
            return;
        }
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
*/

/* TODO:
    Queue loading of levels, the callback of Assets.loader[type] should call the next loader in line
*/

Assets.level = {
    levels: {},
    assetHolder: {},
    count: 0,
    levelSize: 0,

    add: function(assetHolder, levels) {
        // Store references for the asset holder and levels object
        this.assetHolder = assetHolder;
        this.levels = levels;
        this.levelSize = Object.size(this.levels);
        
        // Start with the first level
        this.queue(Object.keys(this.levels)[0]);
        console.log("out of queue, count increasing : " + this.count);
        this.count += 1;
        return this;
    },

    load: function(me, data) {
        console.log("Load enter count: " + me.count + "  me.levels size " + Object.size(me.levels));
        var name = function(count) { return Object.keys(me.levels)[count]; };
        me.assetHolder[name(me.count - 1)] = data;
        console.log("StateAssets/Data");
        console.log(StateAssets);
        if (me.count < Object.size(me.levels)) {
            console.log("enqueueing " + name(me.count));
            me.queue(name(me.count));
            me.count += 1;
        }
        console.log("Load exit " + name(me.count - 2));
    },

    queue: function(name) {
        console.log("queue enter name: " + name + " filepath: " + this.levels[name]);
        var filepath = this.levels[name];
        var type;
        var editor;
        if (filepath.slice(-4) === "json") {
            type = "json";
            editor = "tiled";
        } else if (filepath.slice(-3) === "oel") {
            type = "xml";
            editor = "ogmo";
        } else if (filepath.slice(-3) === "xml") {
            type = "xml"
            editor = "tiled";
        } else {
            console.error("Error loading level data. Unsupported filetype.");
            return;
        }
        // need a local reference to load for the callback.
        var me = this;
        console.log("calling loader.");
        Assets.loader[type](filepath, function(data) { console.log(filepath + " loaded"); me.load(me, data); });
        console.log("queue exit");
    },
};

Assets.addLevels = function(assetHolder, levels) {
    var loader = Assets.level.add(assetHolder, levels);
    console.log("after loader " + loader.count);
    
    /*
    var interval = window.setInterval(function() {
        console.log(loader.count + " / " + loader.levelSize);
        if (loader.count >= loader.levelSize) {
            console.log("clearing timeout");
            window.clearInterval(interval);
        }
    }, 500);
    */
};



/* PSEUDO CODE

for each key in object
    load 



if 
Cycle through level queue, assign data to assetHolder[name] */
