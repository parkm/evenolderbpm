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
BPM.state = State.game();

function BPM(canvasID) {
    'use strict;'
    $(document).ready(function() {
        BPM.canvas = Canvas(canvasID, false);
        BPM.context = BPM.canvas.getContext();
        BPM.canvas.render = BPM.render;

        Loop.init(60);
        Loop.add(BPM.canvas);
        Loop.update = BPM.update;

        BPM.addAssets();

        Assets.loader.load(BPM.init);
    });
}

BPM.addAssets = function() {
    Assets.add("bubble", "assets/bubbles/bubble.png");
};

BPM.init = function() {
    Loop.run();
};

BPM.update = function() {
    if (BPM.state) {
        BPM.state.update(Time.delta);
    }
};

BPM.render = function() {
    BPM.context.fillStyle = "#AAAAAA";
    BPM.canvas.clear();

    if (BPM.state) {
        BPM.state.render(BPM.context);
    }
};
