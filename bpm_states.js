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
        gc.drawImage(StateAssets.background, 0, 0);

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
    var selectStage;

    var stages = [];

    var addStage = function(_name, _color) {
        stages.push({
            name: _name,
            color: _color,
            button: RoundSelectButton(_name, _color),
            rounds: []
        });
    };

    var addRound = function(stageName, roundName, stateName) {
        for (i in stages) {
            var stage = stages[i];

            if (stage.name === stageName) {
                stage.rounds.push({
                    name: roundName,
                    state: stateName,
                    color: stage.color,
                    stage: stage.stageName,
                    button: RoundSelectButton(roundName, stage.color),
                });
                return;
            }
        }
        console.error("Error: Cannot create round, stage '" + stageName + "' does not exist.");
    };

    base.init = function() {
        addStage("Beginner Stage", "rgb(19, 200, 20)");
        addRound("Beginner Stage", "Round 1", "game");
        addRound("Beginner Stage", "Round 2", "game");
        addRound("Beginner Stage", "Round 3", "game");

        addStage("Intermediate Stage", "rgb(19, 20, 200)");
        addRound("Intermediate Stage", "Round 1", "game");
        addRound("Intermediate Stage", "Round 2", "game");

        addStage("Advanced Stage", "rgb(200, 20, 19)");
        addRound("Advanced Stage", "Round 1", "game");
        addRound("Advanced Stage", "Round 2", "game");

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

        selectStage = RoundSelectButton("Select Stage", "#000000", true);
        selectStage.y = 16;

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

        //Round Selection

        var hOffset = 64; //Offset from the end of the canvas.
        var roundButtonDistance = 5; //The distance between each round button.
        var stageChunkDistance = 15; //The distance between each stage chunk.
        var stageToRoundButtonDistance = 10; //The distance between the stage and the round buttons.

        selectStage.x = BPM.canvas.getWidth() - selectStage.width - hOffset;

        var totalHeight = 0; //Used to measure the height of the stage chunks.
        for (i in stages) {
            var stage = stages[i];

            for (j in stage.rounds) {
                var round = stage.rounds[j];

                round.button.x = stage.button.x;
                round.button.y = (stage.button.y + stage.button.height) + (j * (round.button.height + roundButtonDistance) + stageToRoundButtonDistance);
                
                round.button.state = round.state;

                round.button.update(BPM.mouse);
            }

            if (stages[i-1]) {
                totalHeight += ((stages[i-1].rounds.length) * (round.button.height + roundButtonDistance)) + stageChunkDistance;
            }

            stage.button.x = BPM.canvas.getWidth() - stage.button.width - hOffset;
            stage.button.y = (selectStage.y + selectStage.height) + ((stage.button.height) * i) + totalHeight + stageChunkDistance;
        }
    };

    base.render = function(gc) {
        gc.drawImage(StateAssets.background, 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }
        
        selectStage.render(gc);
 
        for (i in stages) {
            var stage = stages[i];

            stage.button.render(gc);

            for (j in stage.rounds) {
                var round = stage.rounds[j];
                round.button.render(gc);
            }
        }
    };

    return base;
});
