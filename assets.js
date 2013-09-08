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

Assets.level = {
    levels: {},
    assetHolder: {},
    count: 0,
    levelSize: 0,
    queue: [],

    add: function(assetHolder, levels) {
        // create deferred object for each level, store in array
        // .done = callback
        //  callback = load()
        this.assetHolder = assetHolder;
        this.levels = levels;
        for (lvl in levels) {
            var filepath = levels[lvl];
            var type;
            if (filepath.slice(-4) === "json") {
                //loadType("json", "tiled");
                type = "json";
            } else if (filepath.slice(-3) === "oel") {
                //loadType("xml", "ogmo");
                type = "xml";
            } else if (filepath.slice(-3) === "xml") {
                //loadType("xml", "tiled");
                type = "xml";
            } else {
                console.error("Error loading level data. Unsupported filetype.");
                return;
            }
            console.log("adding level>");
            console.log(lvl);
            var me = this;
            // must call resolveWith(this, data) for it to work
            var defer = $.Deferred(function(defer) {
                Assets.loader[type](filepath, function(data) {
                    console.log("Defer state for " + lvl + " = " + defer.state());
                    defer.resolveWith(me, [lvl, data]);
                });
            }).done(function(lvl, data) {
                console.log("defer done " + lvl);
                console.log(data);
                this.load(lvl, data);
            });
            this.queue.push(defer);
            console.log(this.queue);
        }
    },

    load: function(lvl, data) {
        // assign to assetholder
        // enqueue next level
        // call .resolve of next deferred object in array
        console.log("Load enter " + lvl);
        console.log(data);
        this.assetHolder[lvl] = data;
        this.count += 1;
        //this.queue.shift();
        if (this.queue.length) {
            //this.queue[0].resolveWith(this, data);
        }
    },


};

Assets.addLevels = function(assetHolder, levels) {
    Assets.level.add(assetHolder, levels);
    console.log("after loader ");
};

