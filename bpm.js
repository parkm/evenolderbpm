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

// For debugging
BPM.dbg = true;

BPM.mouse = Mouse();
BPM.keyboard = Keyboard();

BPM.cash = 100000;

BPM.init = function() {
    if (BPM.dbg) {
        console.log("BPM Initialized");
        console.log(StateAssets);
    }
    BPMStates();
    BPM.loadData();
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

BPM.saveData = function() {
    $.cookie("cash", BPM.cash, {expires: 365});
};

BPM.loadData = function() {
    console.log($.cookie("cash"));
    BPM.cash = parseInt($.cookie("cash"));
};

BPM.clearData = function() {
    BPM.cash = 10000;
};
