/*
### Assets ###

Global object that handles the process of loading and obtaining assets.

*/

Assets = {};

Assets.list = [];
Assets.loader = Loader();

Assets.add = function(_id, assetName) {
    Assets.list.push({
        id: _id,
        image: Assets.loader.image(assetName),
    });
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

BPM.cash = 0;
BPM.state = State.mainMenu();
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

BPM.setState = function(state) {
    BPM.state = state;
    BPM.state.init();
};

BPM.addAssets = function() {
    Assets.add("bubble", "assets/bubbles/bubble.png");
    Assets.add("buttonUp", "assets/button-up.png");
    Assets.add("buttonHover", "assets/button-hover.png");
    Assets.add("buttonDown", "assets/button-down.png");
    Assets.add("background", "assets/blue-background.jpg");
};

BPM.init = function() {
    if (BPM.state)
        BPM.state.init(); //Load the initial state.
    Loop.run();
};

BPM.update = function() {
    if (BPM.state) {
        BPM.state.update(Time.delta);
    }

    BPM.mouse.update();
};

BPM.render = function() {
    BPM.context.fillStyle = "#AAAAAA";
    BPM.canvas.clear();

    if (BPM.state) {
        BPM.state.render(BPM.context);
    }
};
