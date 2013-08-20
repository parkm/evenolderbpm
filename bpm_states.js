// Holds references to all State assets
StateAssets = {};

/* GAME LEVELS */

State.create("game", function() {
    var base = State(); 

    var shooter = PinShooter(BPM.canvas.getWidth() / 2, BPM.canvas.getHeight() / 2);

    var pins = [];

    var bubbles = [];

    var backButton;

    var randomBubble = function(type) {
        type = type || "score";
        bubbles.push(Bubble(Math.random() * BPM.canvas.getWidth(), Math.random() * BPM.canvas.getHeight(), type));
    };

    base.init = function() {
        shooter.init();

        backButton = GUIButton("Back");
        backButton.onClick = function() {
            State.set("roundSelect");
        };
        
        for (var i=0;i<4000;i+=1){
            bubbles.push(Bubble(Math.random() * BPM.canvas.getWidth(), Math.random() * BPM.canvas.getHeight(), "bad", {action: function() { randomBubble("score"); randomBubble("score"); }}));
        }

    };

    base.update = function(delta) {
        for (i in bubbles) {
            bubbles[i].update(delta);
        }

        shooter.update(BPM.mouse, pins);

        for (i in pins) {
            pins[i].update({bubbles: bubbles, pins: pins});
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


/* MENUS */

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

    var stageScroll = 0;

    var addStage = function(_id, _name, _color) {
        stages.push({
            id: _id,
            name: _name,
            color: _color,
            showRounds: false,
            button: RoundSelectButton(_name, _color),
            rounds: []
        });
    };

    var addRound = function(id, roundName, stateName) {
        for (i in stages) {
            var stage = stages[i];

            if (stage.id === id) {
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
        addStage(0, "Beginner Stage", "rgb(19, 200, 20)");
        addRound(0, "Round 1", "game");
        addRound(0, "Round 2", "game");
        addRound(0, "Round 3", "game");
        addRound(0, "Round 4", "game");

        addStage(1, "Intermediate Stage", "rgb(19, 20, 200)");
        addRound(1, "Round 1", "game");
        addRound(1, "Round 2", "game");

        addStage(2, "Advanced Stage", "rgb(200, 20, 19)");
        addRound(2, "Round 1", "game");
        addRound(2, "Round 2", "game");

        addStage(3, "Goto State...", "rgb(19, 200, 200)");
        for (i in State.list) {
            addRound(3, "Goto state '" + i + "'", i);
        }

        achieveButton = GUIButton("Achievements", {dynamic: false});

        menuButton = GUIButton("Main Menu", {
            dynamic: false, 

            onClick: function() {
                State.set("mainMenu");
            }
        });

        saveButton = GUIButton("Save Game", {dynamic: false});
        resetButton = GUIButton("Reset Data", {dynamic: false});

        upgradeButton = GUIButton("Upgrades", {
            dynamic: false,

            onClick: function() {
                State.set("upgrades");
            }
        });

        selectStage = RoundSelectButton("Select Stage", "#000000", true);
        selectStage.y = 16;

        buttons.push(achieveButton);
        buttons.push(menuButton);
        buttons.push(saveButton);
        buttons.push(resetButton);
        buttons.push(upgradeButton);

        for (i in stages) {
            stages[i].button.onClick = function() {
                stages[i].showRounds = !stages[i].showRounds; //Use stages[i] here because there's already a value called stage in the object literal.
                for (j in stages) {
                    if (j !== i) {
                        stages[j].showRounds = false;
                    }
                }
            };
        }
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

                if (stage.showRounds) {                    
                    round.button.state = round.state;

                    round.button.update(BPM.mouse);
                }
            }

            if (stages[i-1]) {
                if (stages[i-1].showRounds) {
                    totalHeight += ((stages[i-1].rounds.length) * (round.button.height + roundButtonDistance)) + stageChunkDistance;
                } else {
                    totalHeight += stageChunkDistance;
                }
            }

            stage.button.x = BPM.canvas.getWidth() - stage.button.width - hOffset;
            stage.button.y = (selectStage.y + selectStage.height) + ((stage.button.height) * i) + totalHeight + stageChunkDistance + stageScroll;

            stage.button.update(BPM.mouse);
        }

        //38 = Up arrow, 40 = Down arrow. Sets the scroll value.
        if (BPM.keyboard.isDown(38)) {
            stageScroll--;
        } else if (BPM.keyboard.isDown(40)) {
            stageScroll++;
        }

        if (BPM.mouse.x > selectStage.x + selectStage.width) {
            stageScroll = -BPM.mouse.y;
        }
    };

    base.render = function(gc) {
        gc.drawImage(StateAssets.background, 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }
        
        selectStage.render(gc);

        gc.save();
    
        //Start a clipping path for the stages.
        gc.beginPath();
        gc.rect(0, selectStage.y + selectStage.height, BPM.canvas.getWidth(), BPM.canvas.getHeight());
        gc.clip();

        for (i in stages) {
            var stage = stages[i];

            stage.button.render(gc);

            if (stage.showRounds) {
                for (j in stage.rounds) {
                    var round = stage.rounds[j];
                    round.button.render(gc);
                }
            }
        }

        gc.restore();

        gc.fillRect(selectStage.x + selectStage.width + 24, 0, 16, BPM.canvas.getHeight());
        gc.fillRect(selectStage.x + selectStage.width + 16, -stageScroll, 32, 32);
    };

    return base;
});

State.create("upgrades", function() {
    var base = State();

    var backButton;

    base.init = function() {
        backButton = GUIButton("Back", {
            onClick: function() {
                State.set("roundSelect");
            }
        });
    };

    base.update = function(delta) {
        backButton.update(BPM.mouse);
    };

    base.render = function(gc) {
        backButton.render(gc);
    };

    return base;
});
