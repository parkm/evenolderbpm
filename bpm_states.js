// Holds references to all State assets
StateAssets = {};

State.create("game", function() {
    var base = State(); 

    var shooter = PinShooter(BPM.canvas.getWidth() / 2, BPM.canvas.getHeight() / 2);

    var pins = [];

    var bubbles = [];

    var backButton;

    base.init = function() {
        shooter.init();

        backButton = GUIButton("Back");
        backButton.onClick = function() {
            State.set("roundSelect");
        };

        for (var i=0; i<50; ++i) {
            bubbles.push(Bubble(Math.random() * BPM.canvas.getWidth(), Math.random() * BPM.canvas.getHeight(), "score", null));

            if (i % 2 == 0) {
                bubbles.push(Bubble(Math.random() * BPM.canvas.getWidth(), Math.random() * BPM.canvas.getHeight(), "bad"));
            }
            if (i % 3 == 0) {
                bubbles.push(Bubble(Math.random() * BPM.canvas.getWidth(), Math.random() * BPM.canvas.getHeight(), "goal"));
            }
        }


        for (i in bubbles) {
            bubbles[i].init();
        }
    };

    base.update = function(delta) {
        for (i in bubbles) {
            bubbles[i].update(delta);
        }

        shooter.update(BPM.mouse, pins);

        for (i in pins) {
            pins[i].update(bubbles);
        }

        backButton.update(BPM.mouse);
    };

    base.render = function(gc) {
        shooter.render(gc);

        for (i in bubbles) {
            bubbles[i].render(gc);
        }

        for (i in pins) {
            pins[i].render(gc);
        }

        backButton.render(gc);

        Utils.drawText(gc, "$" + BPM.cash, 200, 0);
    };

    return base;
});

State.create("mainMenu", function() {
    var base = State();

    var buttons = [];

    var startGameButton, timeTrialButton, quickButton;

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

        quickButton = GUIButton("This button will quickly take you to the game state.");
        quickButton.onClick = function() {
            State.set("game");
        };
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

        quickButton.update(BPM.mouse);
    };

    base.render = function(gc) {
        gc.drawImage(StateAssets.background, 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }

        quickButton.render(gc);

        Utils.drawText(gc, "BPM", BPM.canvas.getWidth()/2, BPM.canvas.getHeight()/4 - 100, {stroke: true});
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
        gc.drawImage(StateAssets.background, 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }

        TEMP_roundButton.render(gc);
    };

    return base;
});
