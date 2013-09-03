/*
### BPM ###
*/

function BPM(canvasID) {
    'use strict;'
    $(document).ready(function() {
        BPM.canvas = Canvas(canvasID, false);
        BPM.context = BPM.canvas.getContext();
        BPM.canvas.render = BPM.render;

        Loop.init(60);
        Loop.add(BPM.canvas);
        Loop.update = BPM.update;

        BPM.mouse.attach(BPM.canvas.getElement());
        BPM.keyboard.attach(BPM.canvas.getElement());

        Assets().load(BPM.init);
    });
}

BPM.mouse = Mouse();
BPM.keyboard = Keyboard();

BPM.cash = 100000;

BPM.init = function() {
    State.set("roundSelect");
    Loop.run();
};

BPM.update = function() {
    State.update(Time.delta);

    BPM.mouse.update();
    BPM.keyboard.update();
};

BPM.render = function() {
    BPM.context.fillStyle = "#AAAAAA";
    BPM.canvas.clear();
    
    State.render(BPM.context);

    Utils.drawText(BPM.context, Time.delta, 0, BPM.canvas.getHeight()-18, {
        font: "16px Arial",
        textAlign: "left",
        stroke: true,
        lineWidth: 3
    });
};



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

    Assets.loader.json(filepath, function(data) {
        assetHolder[name] = data;
    });
};

