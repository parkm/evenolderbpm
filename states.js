/*
### State ###
*/
function State() {
    return {
        update: function(delta) {

        },

        render: function(gc) {

        },
    }
}

State.game = function() {
    var base = State();

    var TEST_bub = Bubble(64, 64, "score", null);

    base.update = function(delta) {
        
    };

    base.render = function(gc) {
        gc.fillStyle = "#FF0000";
        gc.fillRect(0, 0, 32, 32);

        TEST_bub.render(gc);
    };

    return base;
};