// Holds references to all State assets
StateAssets = {};

/* GAME LEVELS */

State.create("game", function() {
    var base = State(); 

    base.bubbles = [];
    base.pins = [];
    base.walls = [];
    base.objects = [];

    base.shooter = PinShooter(BPM.canvas.getWidth() / 2, BPM.canvas.getHeight() / 2);

    base.multiplier = 1;
    base.combo = 0; 
    base.comboGoal = 4; //The amount of bubbles needed to pop in order to increase the multiplier.

    base.init = function() {
        base.shooter.init();

        base.backButton = GUIButton("Back");
        base.backButton.onClick = function() {
            State.set("roundSelect");
        };
    };

    base.update = function(delta) {
        for (i in base.bubbles) {
            base.bubbles[i].update(delta);
        }

        base.shooter.update(BPM.mouse, base.pins);

        for (i in base.pins) {
            base.pins[i].update({
                delta: delta, 
                state: base,
            });
        }

        base.backButton.update(BPM.mouse);

        //Sort objects based on depth.
        base.objects.sort(function(a, b) {
            return b.depth - a.depth;
        });

        for (i in base.objects) {
            if (base.objects[i].update) {
                base.objects[i].update({delta: delta, objects: base.objects});
            }
        } 

        if (base.combo >= base.comboGoal) {
            base.multiplier++;
            base.combo = 0;
            base.comboGoal = Math.round(base.comboGoal * 1.5);
        }

        if (base.pins.length == 0) {
            base.combo = 0;
            base.comboGoal = 4;
            base.multiplier = 1;
        }
    };

    base.render = function(gc) {
        gc.drawImage(StateAssets.background, 0, 0);

        base.shooter.render(gc);

        for (i in base.walls) {
            base.walls[i].render(gc);
        }

        for (i in base.bubbles) {
            base.bubbles[i].render(gc);
        }

        for (i in base.pins) {
            base.pins[i].render(gc);
        }

        for (i in base.objects) {
            if (base.objects[i].render) {
                base.objects[i].render(gc);
            }
        }

        base.backButton.render(gc);

        var formatting = {
            fillStyle: "#FFFFFF",
            strokeStyle: "#000000",
            font: "16px Arial",
            stroke: true,
            lineWidth: 4,
            textAlign: "left",
        };

        Utils.drawText(gc, "$" + BPM.cash, 0, BPM.canvas.getHeight()-100, formatting);
        Utils.drawText(gc, base.combo + " / " + base.comboGoal, 200, 0, formatting);
        Utils.drawText(gc, "x" + base.multiplier, 300, 0, formatting);
    };

    return base;
});

State.create("dogpantzTest", function() {
    var base = State.list["game"]();

    var superInit = base.init;

    var randomBubble = function(type) {
        type = type || "score";
        base.bubbles.push(Bubble(Math.random() * BPM.canvas.getWidth(), Math.random() * BPM.canvas.getHeight(), type));
    };

    base.init = function() {
        superInit.call(base);

        var randX = Math.random() * BPM.canvas.getWidth();
        var randY = Math.random() * BPM.canvas.getHeight();
        var pushBubble = function(bub) { base.bubbles.push(bub); };
        
        for (var i=0;i<4000;i+=1){
            base.bubbles.push(Bubble(randX, randY, "bad", {speed: 2, action: function() { pushBubble(Bubble(randX, randY, "bad", {action: function() { randomBubble("score"); }}));}}));
        }
    };

    return base;
});

State.create("donkeyTest", function() {
    var base = State.list["game"]();

    var wall = Wall();
    wall.x = 600;
    wall.y = 100;
    wall.width = 32;
    wall.height = 100;

    var superInit = base.init;
    base.init = function() {
        superInit.call(base);

        base.walls.push(wall);

        base.bubbles.push(Bubble(32, 32, "score", {
            ghost: true,
            ghostPositions: [vec2(0, 0), vec2(300, 100), vec2(0, 480), vec2(480, 0)],
            ghostInterval: 3,
        }));

        for (var i=0; i<10; ++i) {
            base.bubbles.push(Bubble(100, 200, "double"));
        }

        for (var i=0; i<10; ++i) {
            base.bubbles.push(Bubble(300, 100, "ammo"));
        }
    };

    var superUpdate = base.update;
    base.update = function(delta) {
        superUpdate.call(base, delta);
    };

    var superRender = base.render;
    base.render = function(gc) {
        superRender.call(base, gc);
    }; 

    return base;
});

/* MENUS */

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
        gc.drawImage(StateAssets.background, 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }

        Utils.drawText(gc, "BPM", BPM.canvas.getWidth()/2, BPM.canvas.getHeight()/4 - 100, {stroke: true});
    };

    return base;
});

State.create("roundSelect", function() {
    var base = State();

    var buttons = [];

    var achieveButton, menuButton, saveButton, resetButton, upgradeButton;

    var selectStage;

    var stages = [];

    var stageScrollField = ScrollField();

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
        addStage(-1, "Goto State...", "rgb(19, 200, 200)");
        for (i in State.list) {
            addRound(-1, "Goto state '" + i + "'", i);
        }
        stages[0].showRounds = true;

        addStage(0, "Beginner Stage", "rgb(19, 200, 20)");
        addRound(0, "Round 1", "game");
        addRound(0, "Round 2", "game");
        addRound(0, "Round 3", "game");
        addRound(0, "Round 4", "game");

        addStage(1, "Intermediate Stage", "rgb(19, 20, 200)");
        for (var j=0; j<20; ++j) {
            addRound(1, "Round " + (j+1), "game");
        }

        addStage(2, "Advanced Stage", "rgb(200, 20, 19)");
        addRound(2, "Round 1", "game");
        addRound(2, "Round 2", "game");

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

        stageScrollField.width = BPM.canvas.getWidth();
        stageScrollField.height = BPM.canvas.getHeight();

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
                /* Hides the rounds for all the other stages.
                for (j in stages) {
                    if (j !== i) {
                        stages[j].showRounds = false;
                    }
                }*/
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

        var aboveHeight = 0; //Tracks the height of the stages and rounds above the current stage or round. 
        var totalHeight = 0; //Tracks the total height of all stages and rounds.

        for (i in stages) {
            var stage = stages[i];

            for (j in stage.rounds) {
                var round = stage.rounds[j];

                round.button.x = stage.button.x;
                round.button.y = (stage.button.y + stage.button.height) + (j * (round.button.height + roundButtonDistance) + stageToRoundButtonDistance);

                if (stage.showRounds) {                    
                    round.button.state = round.state;

                    round.button.update(BPM.mouse);
                    totalHeight += round.button.height + roundButtonDistance;
                }
            }

            if (stages[i-1]) {
                if (stages[i-1].showRounds) {
                    aboveHeight += ((stages[i-1].rounds.length) * (round.button.height + roundButtonDistance)) + stageChunkDistance;
                } else {
                    aboveHeight += stageChunkDistance;
                }
            }

            stage.button.x = BPM.canvas.getWidth() - stage.button.width - hOffset;
            stage.button.y = (selectStage.y + selectStage.height) + ((stage.button.height) * i) + aboveHeight + stageChunkDistance + stageScrollField.scroll;

            stage.button.update(BPM.mouse);
            totalHeight += stage.button.height + stageChunkDistance + stageToRoundButtonDistance;
        }

        //Stage Scroll Field

        stageScrollField.y = selectStage.y + selectStage.height;

        stageScrollField.left = selectStage.x;
        stageScrollField.right = selectStage.x + selectStage.width;
        stageScrollField.top = BPM.canvas.getHeight() - 60;
        stageScrollField.bottom = 30;

        stageScrollField.scrollSpeed = 2;
        
        stageScrollField.getBottomConstraint = function() {
            return (stages[0].button.y < (selectStage.y + selectStage.height) + stageChunkDistance)
        };

        stageScrollField.getTopConstraint = function() {
            return (totalHeight + 100 + stageScrollField.scroll >= BPM.canvas.getHeight())
        };

        stageScrollField.update();
    };

    base.render = function(gc) {
        gc.drawImage(StateAssets.background, 0, 0);

        for (i in buttons) {
            buttons[i].render(gc);
        }
        
        selectStage.render(gc);

        stageScrollField.startClipping(gc);

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

        stageScrollField.stopClipping(gc);

    };

    return base;
});

State.create("upgrades", function() {
    var base = State();

    var backButton, purchaseButton;

    var dividers = [];

    var activeUpgrade = null;

    var floatText = [];

    var addDivider = function(_id, _name, _updates) {
        dividers.push({
            id: _id,
            name: _name,
            updates: _updates,
            upgrades: [],
            button: RoundSelectButton(_name, "#000000"),
        });
    };

    var addUpgrade = function(dividerID, upgrade) {
        for (i in dividers) {
            if (dividers[i].id === dividerID) {
                var upg;

                if (typeof upgrade === "string") {
                    upg = Upgrade.get(upgrade);
                } else {
                    upg = upgrade;
                }

                var button = RoundSelectButton(upg.name, "#000000");
                button.x = 32;
                button.y = 24;
                button.width = 345;

                upg.button = button;

                dividers[i].upgrades.push(upg);
            }
        }
    };

    var addFloatText = function(text, x, y) {
        var ft = FloatText(text, x, y, {
            fillStyle: "#FFFFFF",
            strokeStyle: "#000000",
            stroke: true,
            lineWidth: 4,
            font: "24px Arial",
        });

        ft.onDeath = function() {
            floatText.splice(floatText.indexOf(ft), 1);
        };

        floatText.push(ft);
    };

    base.init = function() {
        backButton = GUIButton("Back", {
            onClick: function() {
                State.set("roundSelect");
            }
        });

        purchaseButton = GUIButton("Purchase", {
            onClick: function() {
                if (activeUpgrade) {
                    if (!activeUpgrade.isMaxed()) {
                        if (BPM.cash >= activeUpgrade.price) {
                            BPM.cash -= activeUpgrade.price;
                            activeUpgrade.onPurchase();
                        } else {
                            addFloatText("Insufficient funds", purchaseButton.x, purchaseButton.y);
                        }
                    } else {
                        addFloatText("Max level reached", purchaseButton.x, purchaseButton.y);
                    }
                }
            }
        });

        addDivider(0, "Upgrades");
        addUpgrade(0, "test");
        addUpgrade(0, "poop");

        for (i in dividers) {
            var divider = dividers[i];

            for (j in divider.upgrades) {
                divider.upgrades[j].button.onClick = function() {
                    activeUpgrade = divider.upgrades[j];
                };
            }
        }
    };

    base.update = function(delta) {
        backButton.y = BPM.canvas.getHeight() - backButton.postHeight;
        backButton.update(BPM.mouse);

        purchaseButton.update(BPM.mouse);
        purchaseButton.x = BPM.canvas.getWidth() / 4 + BPM.canvas.getWidth()/2 - purchaseButton.postWidth/2;
        purchaseButton.y = BPM.canvas.getHeight() - purchaseButton.postHeight - 6;

        for (i in dividers) {
            var divider = dividers[i];

            if (divider.updates) {
                divider.button.update(BPM.mouse);
            }

            for (j in divider.upgrades) {
                var upg = divider.upgrades[j];

                upg.button.update(BPM.mouse);
            }
        }

        for (i in floatText) {
            floatText[i].update(delta);
        }
    };

    base.render = function(gc) {
        gc.drawImage(StateAssets.background, 0, 0);

        var boxPos = Rect(BPM.canvas.getWidth() / 2, 0, BPM.canvas.getWidth() / 2, BPM.canvas.getHeight());
        gc.fillStyle = "#000000";
        gc.globalAlpha = 0.5;
        gc.fillRect(boxPos.x, boxPos.y, boxPos.width, boxPos.height);
        gc.globalAlpha = 1;
        gc.lineWidth = 4;
        gc.strokeRect(boxPos.x, boxPos.y+4, boxPos.width-4, boxPos.height-7);

        backButton.render(gc);

        purchaseButton.render(gc);

        for (i in dividers) {
            var divider = dividers[i];
            divider.button.render(gc);

            for (j in divider.upgrades) {
                var upg = divider.upgrades[j];

                upg.button.y = (divider.button.y + divider.button.height) + (j * upg.button.height);

                upg.button.render(gc);
            }
        }

        var formatting = {
            fillStyle: "#FFFFFF",
            strokeStyle: "#000000",
            textAlign: "center",
            font: "32px Arial",
            lineWidth: 4,
            stroke: true,
        }

        if (activeUpgrade) {
            var x = BPM.canvas.getWidth() / 4 + BPM.canvas.getWidth()/2;
            var y = 24;

            Utils.drawText(gc, activeUpgrade.name, x, y, formatting);
            Utils.drawText(gc, "LVL " + activeUpgrade.level + " / " + activeUpgrade.levels, x, y + 37, formatting);
            Utils.drawText(gc, "$" + activeUpgrade.price, x, y + 37*2, formatting);
            Utils.drawText(gc, activeUpgrade.description, x, y + 37*3, formatting);
        }

        formatting.font = "24px Arial";

        Utils.drawText(gc, "$" + BPM.cash, 150, BPM.canvas.getHeight() - 26, formatting);

        for (i in floatText) {
            floatText[i].render(gc);
        }
    };

    return base;
});
