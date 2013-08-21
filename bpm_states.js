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

        var randX = Math.random() * BPM.canvas.getWidth();
        var randY = Math.random() * BPM.canvas.getHeight();
        var pushBubble = function(bub) { bubbles.push(bub); };

        
        for (var i=0;i<4000;i+=1){
            bubbles.push(Bubble(randX, randY, "bad", {speed: 2, action: function() { pushBubble(Bubble(randX, randY, "bad", {action: function() { randomBubble("score"); }}));}}));
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

        selectStage = RoundSelectButton("Select Stage", "#000000");
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

        // Constraint object for scrolling
        // Scrolls down when mouse is at bottom of the screen, up when at the top.
        var scrollBox = {left: selectStage.x, right: selectStage.x + selectStage.width, top: BPM.canvas.getHeight() - 60, bottom: 60, collision: function(testObj) {
            if (testObj.x >= this.left && testObj.x <= this.right) {
                if (testObj.y >= this.top) {
                    return "bottom";
                } else if (testObj.y <= this.bottom) {
                    return "top";
                }
            }
            return false;
        }};
        
        var col = scrollBox.collision(BPM.mouse);
        var scrollSpeed = 2;
        if (col === "bottom") {
            if (stages[0].button.y < (selectStage.y + selectStage.height) + stageChunkDistance) {
                stageScroll += scrollSpeed;
            }
        } else if (col === "top") {
            // TODO: Add constraints to prevent scrolling unless necessary.
            // Not adding now in order to test scrolling
            stageScroll -= scrollSpeed;
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

    };

    return base;
});

State.create("upgrades", function() {
    var base = State();

    var backButton, purchaseButton;

    var dividers = [];

    var activeUpgrade = null;

    var addDivider = function(_id, _name, _parent) {
        dividers.push({
            id: _id,
            name: _name,
            parent: _parent,
            upgrades: [],
        });
    };

    var addUpgrade = function(dividerID, upgrade) {
        for (i in dividers) {
            if (dividers[i].id === dividerID) {
                var button = RoundSelectButton(upgrade.name, "#000000");
                button.x = 32;
                button.y = 24;
                button.width = 345;

                upgrade.button = button;
                dividers[i].upgrades.push(upgrade);
            }
        }
    };

    base.init = function() {
        backButton = GUIButton("Back", {
            onClick: function() {
                State.set("roundSelect");
            }
        });

        purchaseButton = GUIButton("Purchase", {
            onClick: function() {
                if (!activeUpgrade.isMaxed()) {
                    if (BPM.cash >= activeUpgrade.price) {
                        activeUpgrade.onPurchase();
                    }
                }
            }
        });

        addDivider(0, "Upgrades");
        addUpgrade(0, testUpgrade);

        for (i in dividers[0].upgrades) {
            dividers[0].upgrades[i].button.onClick = function() {
                activeUpgrade = dividers[0].upgrades[i];
            };
        }
    };

    base.update = function(delta) {
        backButton.y = BPM.canvas.getHeight() - backButton.postHeight;
        backButton.update(BPM.mouse);

        purchaseButton.update(BPM.mouse);
        purchaseButton.x = BPM.canvas.getWidth() - purchaseButton.postWidth;
        purchaseButton.y = BPM.canvas.getHeight() - purchaseButton.postHeight;

        for (i in dividers[0].upgrades) {
            var u = dividers[0].upgrades[i];

            u.button.update(BPM.mouse);
        }
    };

    base.render = function(gc) {
        backButton.render(gc);

        purchaseButton.render(gc);

        for (i in dividers[0].upgrades) {
            var u = dividers[0].upgrades[i];

            u.button.render(gc);
        }

        if (activeUpgrade) {
            var x = BPM.canvas.getWidth() / 4 + BPM.canvas.getWidth()/2;
            var y = 24;

            var formatting = {
                fillStyle: "#FFFFFF",
                strokeStyle: "#000000",
                textAlign: "center",
                font: "32px Arial",
                lineWidth: 4,
                stroke: true,
            }

            Utils.drawText(gc, activeUpgrade.name, x, y, formatting);
            Utils.drawText(gc, "LVL " + activeUpgrade.level + " / " + activeUpgrade.levels, x, y + 37, formatting);
            Utils.drawText(gc, "$" + activeUpgrade.price, x, y + 37*2, formatting);
            Utils.drawText(gc, activeUpgrade.description, x, y + 37*3, formatting);
        }
    };

    return base;
});
