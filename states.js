/*
### State ###
*/
function State() {
    return {
        init: function() {

        },

        update: function(delta) {

        },

        render: function(gc) {

        },
    }
}

State.game = function() {
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
};

State.mainMenu = function() {
    var base = State();

    var buttons = new Array();

    var startGameButton, timeTrialButton;

    base.init = function() {
        startGameButton = GUIButton("New Game", 
        {dynamic: false, 

        onClick: function() {
            BPM.setState(State.roundSelect());
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
};

State.roundSelect = function() {
    var base = State();

    var buttons = new Array();

    var achieveButton;

    base.init = function() {
        achieveButton = GUIButton("Achievements", {dyanmic: false});

        buttons.push(achieveButton);
    };

    base.update = function(delta) {
        for (i in buttons) {
            var b = buttons[i];

            b.update(BPM.mouse);
        }
    };

    base.render = function(gc) {
        for (i in buttons) {
            buttons[i].render(gc);
        }
    };

    return base;
};