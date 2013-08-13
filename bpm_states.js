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
