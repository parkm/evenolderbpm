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

        BPM.addAssets();

        Assets.loader.load(BPM.init);
    });
}

BPM.mouse = Mouse();
BPM.keyboard = Keyboard();

BPM.cash = 100000;

BPM.addAssets = function() {
    // Pin Assets
    PinAssets.arrow = Assets.add("arrow", "assets/arrow.png");
    PinAssets.pin = Assets.add("pin", "assets/pin.png");

    // Bubble Assets
    BubbleAssets.score = Assets.add("bubbleScore", "assets/bubbles/bubble.png");
    BubbleAssets.bad = Assets.add("bubbleBad", "assets/bubbles/bubble.png");
    BubbleAssets.goal = Assets.add("bubbleGoal", "assets/bubbles/bubble.png");

    // State Assets
    StateAssets.background = Assets.add("background", "assets/blue-background.jpg");
    StateAssets.wall = Assets.add("wall", "assets/wall.png");

    // GUI Assets
    GUIAssets.buttonUp = Assets.add("buttonUp", "assets/button-up.png");
    GUIAssets.buttonHover = Assets.add("buttonHover", "assets/button-hover.png");
    GUIAssets.buttonDown = Assets.add("buttonDown", "assets/button-down.png");

};

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
