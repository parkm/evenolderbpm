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

    var TEST_button;

    base.init = function() {
        TEST_bub.init();
        TEST_button = GUIButton("Start Game");
    };

    base.update = function(delta) {
        TEST_bub.update(delta);
        TEST_button.update(BPM.mouse);
    };

    base.render = function(gc) {
        gc.fillStyle = "#FF0000";
        gc.fillRect(0, 0, 32, 32);

        TEST_bub.render(gc);

        TEST_button.render(gc);
    };

    return base;
};