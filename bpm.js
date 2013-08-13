/*
### Assets ###

Global object that handles the process of loading and obtaining assets.

*/

Assets = {};

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

/*
### BPM ###
*/

BPM.mouse = Mouse();

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

        BPM.addAssets();

        Assets.loader.load(BPM.init);
    });
}

BPM.cash = 0;

BPM.addAssets = function() {
    Assets.add("bubble", "assets/bubbles/bubble.png");
    Assets.add("background", "assets/blue-background.jpg");

    // Add graphics
    GUIAssets.buttonUp = Assets.add("buttonUp", "assets/button-up.png");
    GUIAssets.buttonHover = Assets.add("buttonHover", "assets/button-hover.png");
    GUIAssets.buttonDown = Assets.add("buttonDown", "assets/button-down.png");

};

BPM.init = function() {
    State.set("mainMenu");
    Loop.run();
};

BPM.update = function() {
    if (State.current) {
        State.current.update(Time.delta);
    }

    BPM.mouse.update();
};

BPM.render = function() {
    BPM.context.fillStyle = "#AAAAAA";
    BPM.canvas.clear();

    if (State.current) {
        State.current.render(BPM.context);
    }
};
