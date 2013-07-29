/*
### Assets ###

Global object that handles the process of loading and obtaining assets.

*/

Assets = {};

Assets.list = new Array();
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
    Assets.add("bubble", "temp-assets/bubbles/bubble.png");
};

BPM.init = function() {
    Loop.run();
};

BPM.update = function() {

};

var TEST_bub = Bubble(64, 64, "score", null);
BPM.render = function() {
    var gc = BPM.context;

    gc.fillStyle = "#AAAAAA";
    gc.fillRect(0, 0, 640, 480);
    gc.fillStyle = "#FF0000";
    gc.fillRect(0, 0, 32, 32);
    TEST_bub.render(gc);
};