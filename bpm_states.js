// Holds references to all State assets
StateAssets = {};

/* GAME LEVELS */

function BPMStates() {
    // Main Game state from which all other game states will inherit.
    State.create("game", function(data) {
        var base = State();

        base.data = data;

        base.bubbles = [];
        base.pins = [];
        base.walls = [];
        base.objects = [];

        base.width = 800;
        base.height = 608;

        base.comboScore = 0;
        base.comboBar = StatusBar();
        base.comboBar.width = base.width - 12;
        base.comboBar.height = 16;
        base.comboBar.y = base.height - base.comboBar.height - 7;

        var shooter = {
            defaultPins: 4,
            // Use offset to center shooter
            // Required with Tiled
            offsetX: 16,
            offsetY: -16
        };

        // Load shooter data from level data
        if (data && data.shooter) {
            shooter.x = data.shooter.x + shooter.offsetX;
            shooter.y = data.shooter.y + shooter.offsetY;
            shooter.pins = data.shooter.pins || shooter.defaultPins;
        } else {
            shooter.x = base.width / 2;
            shooter.y = base.height / 2;
            shooter.pins = shooter.defaultPins;
        }


        base.shooter = PinShooter(shooter.x, shooter.y, {pins: shooter.pins});

        base.multiplier = 1;
        base.combo = 0; 
        base.comboGoal = 4; //The amount of bubbles needed to pop in order to increase the multiplier.

        base.roundComplete = false;
        base.completeState = "roundSelect"; //The state to go to after round has been completed.

        base.addFloatText = function(floatText) {
            floatText.onDeath = function(args) {
                base.objects.splice(base.objects.indexOf(floatText), 1);
            };

            base.objects.push(floatText);
        };

        base.reset = function() {
            State.set(State.currentID);
        };

        base.getWall = function(id) {
            for (var w in base.walls) {
                if (id === base.walls[w].id) {
                    return base.walls[w];
                }
            }
        };

        base.init = function() {
            base.shooter.init();

            base.backButton = GUIButton("Back", {
                font: "24px Arial",
                y: base.height
            });

            base.backButton.onClick = function() {
                State.set("roundSelect");
            };

            base.resetButton = GUIButton("Reset", {
                x: 100,
                y: base.height,
                font: "24px Arial"
            });

            base.resetButton.onClick = function() {
                State.set(State.currentID);
            };

            /* Load all game objects from JSON state data if it exists. */
            if (base.data) {
                var d = base.data;
                // Walls
                if (d.walls) {
                    var walls = d.walls;
                    for (var i = 0; i < walls.length; i += 1) {
                        var wall = walls[i];
                        base.walls.push(Wall({
                            id: wall.id,
                            x: wall.x,
                            y: wall.y,
                            width: wall.width,
                            height: wall.height,
                            moveLine: wall.moveLine,
                            moveSpeed: wall.moveSpeed,
                            moveAuto: wall.moveAuto,
                            moveLoop: wall.moveLoop
                        }));
                    }
                }

                // Bubbles
                if (d.bubbles) {
                    var bubbles = d.bubbles;
                    for (var i = 0; i < bubbles.length; i += 1) {
                        var b = bubbles[i];
                        for (var j = 0; j < b.count; j += 1) {
                            // Create bubbles in range constraints
                            if (b.name === "random" && b.constraints) {
                                b.x = Utils.getRandom(b.constraints.x, b.constraints.width);
                                b.y = Utils.getRandom(b.constraints.y, b.constraints.height);
                            }
                            // Set up actions for action bubbles
                            if (b.type === "action" && d.actions) {
                                for (var name in d.actions) {
                                    if (b.name === name) {
                                        b.action = d.actions[name];
                                    }
                                }
                            }
                            var bInstance = Bubble(b.x, b.y, b.type, {speed: b.speed, angle: b.angle, iron: b.iron, constraints: b.constraints, action: b.action});

                            if (b.randomPosition) {
                                var isColliding;

                                //Checks if the newest random position is colliding with any of the walls. If so continue the loop until that is false.
                                do {
                                    isColliding = false;

                                    bInstance.x = Math.random() * BPM.canvas.getWidth();
                                    bInstance.y = Math.random() * BPM.canvas.getHeight();

                                    for (k in base.walls) {
                                        if (base.walls[k].isColliding(bInstance.x, bInstance.y, bInstance.width, bInstance.height)) {
                                            isColliding = true;
                                        }
                                    }
                                } while (isColliding);
                            }
                            base.bubbles.push(bInstance);
                        }
                    }
                }
            }
        };

        base.update = function(delta) {
            var i;
            if (BPM.keyboard.isPressed(82)) base.reset();

            for (i in base.bubbles) {
                base.bubbles[i].update({delta: delta, state: base});
            }

            for (i in base.walls) {
                base.walls[i].update({delta: delta, state: base});
            }

            base.shooter.update(BPM.mouse, base.pins);

            base.comboBar.ratio = base.combo / base.comboGoal;

            for (i in base.pins) {
                base.pins[i].update({
                    delta: delta, 
                    state: base,
                });
            }

            base.backButton.update(BPM.mouse);
            base.resetButton.update(BPM.mouse);

            //Sort objects based on depth.
            base.objects.sort(function(a, b) {
                return b.depth - a.depth;
            });

            for (i in base.objects) {
                if (base.objects[i].update) {
                    base.objects[i].update({delta: delta, state: base});
                }
            } 

            if (base.combo >= base.comboGoal) {
                base.multiplier++;
                base.combo = 0;
                base.comboGoal = Math.round(base.comboGoal * 1.5);
            }

            if (base.pins.length === 0) {
                base.combo = 0;
                base.comboGoal = 4;
                base.multiplier = 1;
                base.comboScore = 0;
            }

            if (!base.roundComplete) {
                if ((base.pins.length <= 0 && base.shooter.pins === 0) || base.bubbles.length <= 0) {
                    //Do a check to see if the goal bubble count is 0. If so then cue the round success code.
                    base.goalBubbleCount = 0;
                    for (i in base.bubbles) {
                        if (base.bubbles[i].type === "goal") {
                            base.goalBubbleCount++;
                        }
                    }

                    if (base.goalBubbleCount <= 0) {
                        base.roundStatus = "win"; 
                    } else {
                        base.roundStatus = "fail";
                    }

                    base.roundComplete = true;
                    base.onRoundComplete();
                }
            } else {
                if (BPM.mouse.isReleased(Mouse.LEFT)) {
                    if (base.roundStatus === "win") {
                        State.set(base.completeState);
                    } else {
                        base.reset();
                    }
                }
            }
        };

        base.render = function(gc) {
            gc.drawImage(StateAssets.background, 0, 0);

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

            base.shooter.render(gc);

            // UI Bottom Bar
            var formatting = {
                fillStyle: "#FFFFFF",
                strokeStyle: "#000000",
                font: "16px Arial",
                stroke: true,
                lineWidth: 4,
                textAlign: "left",
            };

            // Background
            gc.fillStyle = "rgb(80, 72, 212)";
            gc.strokeStyle = "#000000";
            gc.lineWidth = 2;
            gc.fillRect(0, base.height, BPM.canvas.getWidth(), BPM.canvas.getHeight() - base.height);
            gc.strokeRect(gc.lineWidth, base.height + gc.lineWidth, BPM.canvas.getWidth() - gc.lineWidth*2, BPM.canvas.getHeight() - base.height - gc.lineWidth*2);

            base.backButton.render(gc);
            base.resetButton.render(gc);

            // Text stats - cash, combo, multiplier
            Utils.drawText(gc, "$" + BPM.cash, 400, base.height + 32, formatting);
            Utils.drawText(gc, base.combo + " / " + base.comboGoal, 300, base.height + 5, formatting);
            formatting.font = (16 + (1.1 * base.multiplier)).toString() + "px Arial";
            Utils.drawText(gc, "x" + base.multiplier, 400, base.height + 5, formatting);

            // Pin count
            formatting.font = "24px Arial"; // bigger font for pin count and combo count
            Utils.drawText(gc, "Pins: " + base.shooter.pins, 500, base.height + 16, formatting);

            // Combo Bubbles
            if (base.combo > 0 || base.multiplier > 1) {
                Utils.drawText(gc, base.comboScore, 620, base.height + 16, formatting);
                base.comboBar.render(gc);
            }

            // Round complete splash
            if (base.roundComplete) {
                gc.fillStyle = "rgba(0, 0, 0, .25)";
                gc.fillRect(0, 0, BPM.canvas.getWidth(), BPM.canvas.getHeight());

                var text;
                if (base.roundStatus === "win") {
                    text = "Round Complete";
                } else {
                    text = "Round Failed";
                }

                Utils.drawText(gc, text, BPM.canvas.getWidth()/2, BPM.canvas.getHeight()/2 - 64, {
                    stroke: true
                });
            }
        };

        base.onRoundComplete = function() {

        };

        return base;
    });

    /* ROUNDS */
    // Creates rounds by inheriting from Game state.
    // name - name of round
    // data - optional; level data. Defaults to StateAssets[name]
    State.addRound = function(name, actions) {
        var data = StateAssets[name];

        // Error checking
        if (typeof name !== "string") {
            console.error("Error @ State.addRound: param 'name' must be a string.");
            return;
        }
        if (!data) {
            console.error("Error @ State.addRound: data is undefined for " + name);
            return;
        }

        State.create(name, function() {
            // In order to do actions, we need to pass them through the level data.
            data.actions = actions;
            var base = State.list["game"](data);

            return base;
        });
    };

    //Add auto levels
    for (var i in StateAssets.autoLevels) {
        var file = StateAssets.autoLevels[i];

        State.addRound(file);
    }

    State.addRound("tutorial_5", {
        "action0": function(state) {
            var wallleft = state.getWall("wL");
            var wallright = state.getWall("wR");
            var wallcenter = state.getWall("wC");
            wallleft.movesettings.auto = true;
            wallright.movesettings.auto = true;
            wallcenter.movesettings.auto = true;

            // Need to make a bubble that only exists to keep the round from completing
            // otherwise the round will end before the wall finishes creating the goals
            // Delete when wall is finished moving
            state.bubbles.push(Bubble(-200, -200, "goal", {roundHold: true}));
            // spawn goal bubbles at the bottom of the wall as the wall moves up
            var superMove = wallCenter.move;
            var origY = wallCenter.y;
            var count = 0;
            var flag = true;
            var fillCount = 100; // amt to fill space between L and R walls
            wallCenter.move = function(delta) {
                superMove.call(wallCenter, delta);
                if (this.y + this.height < 1 && flag) {
                    flag = false;
                    state.getWall("wA").moveSettings.auto = true;
                    // Delete place holder bubble
                    for (var b in state.bubbles) {
                        if (state.bubbles[b].options && state.bubbles[b].options.roundHold) {
                            state.bubbles[b].onPop({state: state});
                        }
                    }
                    // fill between L and R walls with score bubbles
                    var constraints = {
                        x: wallLeft.x + wallLeft.width,
                        y: wallLeft.y,
                        width: wallRight.x,
                        height: wallLeft.y + wallLeft.height - 32
                    }, i;
                    for (i = 0; i < fillCount; i++) {
                        state.bubbles.push(Bubble(
                                    Utils.getRandom(constraints.x, constraints.width),
                                    Utils.getRandom(constraints.y, constraints.height),
                                    "score",
                                    { speed: 1.5, constraints: constraints }
                                    ));
                    }
                    // Throw some bombs in there
                    for (i = 0; i < 4; i++) {
                        state.bubbles.push(Bubble(
                                    Utils.getRandom(constraints.x, constraints.width),
                                    Utils.getRandom(constraints.y, constraints.height),
                                    "bomb",
                                    { speed: 0.6, constraints: constraints }
                                    ));
                    }
                }
                // Make the wall poop goal bubbles
                if (this.y < origY - this.height - (32 * count) && flag) {
                    state.bubbles.push(Bubble(this.x, origY - (32 * count), "goal"));
                    count++;
                }
            };
        }
    });

    // Toggles movement for given wall
    // need to call in action object function in State.addRound
    var wallToggle = function(wall, state) {
        // wall can either be a string of the wall's ID, or an instance of a wall.
        wall = typeof wall === "string" ? state.getWall(wall) : wall;
        var m = wall.moveSettings;
        console.log(m);

        if (!m.auto) {
            m.auto = true;
            m.done = false;
        }
        if (!m.loop) m.loop = true;

        var superMove = wall.move;
        wall.move = function(delta) {
            var m = this.moveSettings;
            superMove.call(wall, delta);
            if (m.done) {
                m.auto = false;
            }
        };
    };

    State.addRound("tutorial_6", {
        "actionL": function(state) {
            var t = state.getWall("wLT");
            var b = state.getWall("wLB");
            if (t.moveSettings.done && b.moveSettings.done) {
                wallToggle(t, state);
                wallToggle(b, state);
            }
        },
        "actionR": function(state) {
            var t = state.getWall("wRT");
            var b = state.getWall("wRB");
            if (t.moveSettings.done && b.moveSettings.done) {
                wallToggle("wRT", state);
                wallToggle("wRB", state);
            }
        }
    });

    /* MENUS */

    function BaseMenu() {
        var base = State();

        base.floatText = [];

        base.addFloatText = function(text, x, y) {
            var ft = FloatText(text, x, y, {
                fillStyle: "#FFFFFF",
                strokeStyle: "#000000",
                stroke: true,
                lineWidth: 4,
                font: "24px Arial",
            });

            ft.onDeath = function(args) {
                base.floatText.splice(base.floatText.indexOf(ft), 1);
            };

            base.floatText.push(ft);
        };

        return base;
    }

    State.create("mainMenu", function() {
        var base = BaseMenu();

        var buttons = [];

        var startGameButton, timeTrialButton;

        base.init = function() {
            startGameButton = GUIButton("New Game", 
            {dynamic: false, 

            onClick: function() {
                State.set("roundSelect");
            }});

            timeTrialButton = GUIButton("Time Trial", {dynamic: false});

            classicButton = GUIButton("Classic", {
                dynamic: false,

                onClick: function() {
                    State.set("classicRoundSelect");
                }    
            });

            buttons.push(startGameButton);
            buttons.push(timeTrialButton);
            buttons.push(classicButton);
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

    function BaseRoundSelection() {
        var base = BaseMenu();

        base.buttons = [];

        base.createButtons = function() {
            base.achieveButton = GUIButton("Achievements", {dynamic: false});

            base.menuButton = GUIButton("Main Menu", {
                dynamic: false, 

                onClick: function() {
                    State.set("mainMenu");
                }
            });

            base.saveButton = GUIButton("Save Game", {
                dynamic: false,
                onClick: function() {
                    Utils.saveData();
                    base.addFloatText("Game saved", base.saveButton.x + base.saveButton.width, base.saveButton.y);
                }
            });

            base.resetButton = GUIButton("Reset Data", {
                dynamic: false,
                onClick: function() {
                    Utils.clearData();
                    base.addFloatText("Game data has reset", base.resetButton.x + base.resetButton.width, base.resetButton.y);
                }
            });

            base.buttons.push(base.achieveButton);
            base.buttons.push(base.menuButton);
            base.buttons.push(base.saveButton);
            base.buttons.push(base.resetButton);
        };

        base.updateButtons = function() {
            for (i in base.buttons) {
                var b = base.buttons[i];

                b.width = 200;
                b.height = 40;

                b.y = i * (b.postHeight + 5);

                b.update(BPM.mouse);
            }
        };

        base.renderButtons = function(gc) {
            for (i in base.buttons) {
                base.buttons[i].render(gc);
            }
        };

        return base;
    }

    State.create("roundSelect", function() {
        var base = BaseRoundSelection();

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

        /*  Adds a state to a stage round button.

            id:
                    The id of the stage.
            roundName:
                    The name of the round to display on the button.
            stateName:
                    The name of the state you want the button to go to.
            roundIndex: OPTIONAL
                    Places the round at a certain index rather than pushing it.
        */
        var addRound = function(id, roundName, stateName, roundIndex) {
            for (var i in stages) {
                var stage = stages[i];

                if (stage.id === id) {
                    var roundObj = {
                        name: roundName,
                        state: stateName,
                        color: stage.color,
                        stage: stage.stageName,
                        button: RoundSelectButton(roundName, stage.color)
                    };

                    if (roundIndex !== undefined) {
                        stage.rounds[roundIndex] = roundObj;
                    } else {
                        stage.rounds.push(roundObj);
                    }

                    return;
                }
            }
            console.error("Error: Cannot create round, stage '" + stageName + "' does not exist.");
        };

        base.init = function() {
            addStage(-1, "Goto State...", "rgb(19, 200, 200)");
            for (var i in State.list) {
                addRound(-1, "Goto state '" + i + "'", i);
            }
            stages[0].showRounds = true;

            addStage(0, "Beginner Stage", "rgb(19, 200, 20)");

            addStage(1, "Intermediate Stage", "rgb(19, 20, 200)");
            for (var j=0; j<20; ++j) {
                addRound(1, "Round " + (j+1), "game");
            }

            addStage(2, "Advanced Stage", "rgb(200, 20, 19)");
            addRound(2, "Round 1", "game");
            addRound(2, "Round 2", "game");

            for (var i in StateAssets) {
                var regExp = /s[0-9]+r[0-9]+/;
                var results = regExp.exec(i);

                if (results) {
                    var file = results.input;
                    var stage = parseInt(file.slice(file.indexOf('s') + 1, file.indexOf('r')), 10);
                    var round = parseInt(file.slice(file.indexOf('r') + 1, file.length), 10);

                    addRound(stage, "Round " + round, file, round - 1);
                }
            }

            base.createButtons();

            stageScrollField.width = BPM.canvas.getWidth();
            stageScrollField.height = BPM.canvas.getHeight();
            stageScrollField.invert = true;

            selectStage = RoundSelectButton("Select Stage", "#000000");
            selectStage.y = 16;

            for (var i in stages) {
                (function(index) {
                    stages[index].button.onClick = function() {
                        stages[index].showRounds = !stages[index].showRounds;
                    };
                })(i);
            }
        };

        base.update = function(delta) {
            base.updateButtons();

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
                return (stages[0].button.y < (selectStage.y + selectStage.height) + stageChunkDistance);
            };

            stageScrollField.getTopConstraint = function() {
                return (totalHeight + 100 + stageScrollField.scroll >= BPM.canvas.getHeight());
            };

            stageScrollField.update();

            for (i in base.floatText) {
                base.floatText[i].update({delta: delta, state: base});
            }
        };

        base.render = function(gc) {
            gc.drawImage(StateAssets.background, 0, 0);

            base.renderButtons(gc);

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

            for (i in base.floatText) {
                base.floatText[i].render(gc);
            }
        };

        return base;
    });

    State.create("upgrades", function() {
        var base = BaseMenu();

        var backButton, purchaseButton;

        var dividers = [];

        var activeUpgrade = null;

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

        base.init = function() {
            backButton = GUIButton("Back", {
                onClick: function() {
                    State.set("classicRoundSelect");
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
                                base.addFloatText("Insufficient funds", purchaseButton.x, purchaseButton.y);
                            }
                        } else {
                            base.addFloatText("Max level reached", purchaseButton.x, purchaseButton.y);
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

            for (i in base.floatText) {
                base.floatText[i].update({delta: delta, state: base});
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

            for (i in base.floatText) {
                base.floatText[i].render(gc);
            }
        };

        return base;
    });

    State.create("classicRoundSelect", function() {
        var base = BaseRoundSelection();

        var gotoRoundButton;

        base.init = function() {
            base.createButtons();

            gotoRoundButton = GUIButton("Next Round", {
                onClick: function() {
                    State.set("classicRound");
                }
            });
            
            base.upgradeButton = GUIButton("Upgrades", {
                dynamic: false
            });

            base.upgradeButton.onClick = function() {
                State.set("upgrades");
            };

            base.buttons.push(base.upgradeButton);
        };

        base.update = function(delta) {
            base.updateButtons();
            gotoRoundButton.update(BPM.mouse);

            gotoRoundButton.x = BPM.canvas.getWidth()/2 - gotoRoundButton.postWidth/2;
            gotoRoundButton.y = BPM.canvas.getHeight() - gotoRoundButton.postHeight;

            for (i in base.floatText) {
                base.floatText[i].update({delta: delta, state: base});
            }
        };

        base.render = function(gc) {
            gc.drawImage(StateAssets.background, 0, 0);

            base.renderButtons(gc);

            gotoRoundButton.render(gc);

            for (i in base.floatText) {
                base.floatText[i].render(gc);
            }
        };

        return base;
    });

    State.create("classicRound", function() {
        var base = State.list["game"]();
        
        var bubbleExclusions = [];

        var superInit = base.init;
        base.init = function() {
            superInit.call(base);

            bubbleExclusions.push("Base");
            bubbleExclusions.push("Goal");
            bubbleExclusions.push("Reflect");
            bubbleExclusions.push("Bomb");
            bubbleExclusions.push("Ammo");
            bubbleExclusions.push("Action");
            
            for (i in Bubble) {
                if (bubbleExclusions.indexOf(i) === -1) {
                    for (j=0; j<10; ++j) {
                        base.bubbles.push(Bubble(Math.random() * base.width, Math.random() * base.height - 32, i, {speed: 0}));
                    }
                }
            }

            base.backButton.onClick = function() {
                State.set("classicRoundSelect");
            };

            base.completeState = "classicRoundSelect";
        };

        return base;
    });
}
