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
    BubbleAssets.explode = Assets.add("explosion", "assets/explode-124x150-strip23.png");
    BubbleAssets.pop = Assets.add("pop", "assets/bubbles/pop-90x100-strip7.png");
    BubbleAssets.glare = Assets.add("bubbleGlare", "assets/bubbles/bubble-glare.png");

    BubbleAssets.score = Assets.add("bubbleScore", "assets/bubbles/bubble.png");
    BubbleAssets.bad = Assets.add("bubbleBad", "assets/bubbles/bubble.png");
    BubbleAssets.goal = Assets.add("bubbleGoal", "assets/bubbles/bubble.png");
    BubbleAssets.double = Assets.add("bubbleDouble", "assets/bubbles/bubble.png");
    BubbleAssets.reflect = Assets.add("bubbleReflect", "assets/bubbles/bubble.png");
    BubbleAssets.combo = Assets.add("bubbleCombo", "assets/bubbles/bubble.png");
    BubbleAssets.ammo = Assets.add("bubbleAmmo", "assets/bubbles/bubble.png");
    BubbleAssets.bomb = Assets.add("bubbleBomb", "assets/bubbles/bubble.png");

    // State Assets
    StateAssets.background = Assets.add("background", "assets/blue-background.jpg");
    StateAssets.wall = Assets.add("wall", "assets/wall.png");

    // GUI Assets
    GUIAssets.buttonUp = Assets.add("buttonUp", "assets/button-up.png");
    GUIAssets.buttonHover = Assets.add("buttonHover", "assets/button-hover.png");
    GUIAssets.buttonDown = Assets.add("buttonDown", "assets/button-down.png");

    // Levels
    var path = "include/levels/";
    Assets.addLevel(StateAssets, "testLevel", path + "test-level.oel");
};

BPM.init = function() {
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
    var cash = parseInt($.cookie("cash"));
    if (cash) {
        BPM.cash = cash;
    }
};

BPM.clearData = function() {
    BPM.cash = 10000;
};