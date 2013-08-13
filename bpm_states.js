// State data for bpm goes here.

State.create("test", function() {
    var base = State();

    var TEST_bub = Bubble(64, 64, "score", null);

    base.init = function() {
        TEST_bub.init();
    };

    base.update = function(delta) {
        TEST_bub.update(delta);
    };

    base.render = function(gc) {
        gc.fillStyle = "#FF0000";
        gc.fillRect(0, 0, 32, 32);

        TEST_bub.render(gc);
    };

    return base;
});

State.create("game", function() {
    var base = State(); 

    var TEST_bub = Bubble(64, 64, "score", null);

    var backButton;

    base.init = function() {
        TEST_bub.init();

        backButton = GUIButton("Back");
        backButton.onClick = function() {
            State.set("roundSelect");
        };
    };

    base.update = function(delta) {
        TEST_bub.update(delta);

        backButton.update(BPM.mouse);
    };

    base.render = function(gc) {
        gc.fillStyle = "#FF0000";
        gc.fillRect(0, 0, 32, 32);

        TEST_bub.render(gc);

        backButton.render(gc);
    };

    return base;
});

State.create("mainMenu", function() {
    var base = State();

    var buttons = [];

    var startGameButton, timeTrialButton;

    base.init = function() {
        startGameButton = GUIButton("New Game", 
        {dynamic: false, 

        onClick: function() {
            State.set("roundSelect");
        }});

        timeTrialButton = GUIButton("Time Trial", {dynamic: false});
        gambleButton = GUIButton("Gamble", {dynamic: false});

        buttons.push(startGameButton);
        buttons.push(timeTrialButton);
        buttons.push(gambleButton);
    };

    base.update = function(delta) {
        for (i in buttons) {
            var b = buttons[i];

            b.width = 250;
            b.height = 40;
            b.x = BPM.canvas.getWidth()/2 - b.width/2;
            b.y = i * (b.postHeight + 5) + BPM.canvas.getHeight()/4;

            b.update(BPM.mouse);
        }
    };

    base.render = function(gc) {
        gc.drawImage(Assets.get("background"), 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }

        gc.fillStyle = "#FFFFFF";
        gc.strokeStyle = "#000000";
        gc.textBaseline = "top";
        gc.font = "64px Arial";
        gc.textAlign = "center"
        gc.lineWidth = 6;
        Utils.drawText(gc, "BPM", BPM.canvas.getWidth()/2, BPM.canvas.getHeight()/4 - 100, true);
    };

    return base;
});

State.create("roundSelect", function() {
    var base = State();

    var buttons = [];

    var achieveButton, menuButton, saveButton, resetButton, upgradeButton;

    var TEMP_roundButton;

    base.init = function() {
        achieveButton = GUIButton("Achievements", {dynamic: false});

        menuButton = GUIButton("Main Menu", 
        {dynamic: false, 

        onClick: function() {
            State.set("mainMenu");
        }
        });

        saveButton = GUIButton("Save Game", {dynamic: false});
        resetButton = GUIButton("Reset Data", {dynamic: false});
        upgradeButton = GUIButton("Upgrades", {dynamic: false});

        TEMP_roundButton = GUIButton("Go to the game");
        TEMP_roundButton.onClick = function() {
            State.set("game");
        };
        TEMP_roundButton.x = 300;
        TEMP_roundButton.y = 400;

        buttons.push(achieveButton);
        buttons.push(menuButton);
        buttons.push(saveButton);
        buttons.push(resetButton);
        buttons.push(upgradeButton);
    };

    base.update = function(delta) {
        for (i in buttons) {
            var b = buttons[i];

            b.width = 200;
            b.height = 40;

            b.y = i * (b.postHeight + 5);

            b.update(BPM.mouse);
        }

        TEMP_roundButton.update(BPM.mouse);
    };

    base.render = function(gc) {
        gc.drawImage(Assets.get("background"), 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }

        TEMP_roundButton.render(gc);
    };

    return base;
});