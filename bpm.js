function bpm(canvasID) {
    'use strict;'
    $(document).ready(function() {
        bpm.canvas = Canvas(canvasID, false);
        bpm.context = bpm.canvas.getContext();
        bpm.canvas.render = bpm.render;

        Engine.init(60);
        Engine.add(bpm.canvas);
        Engine.update = bpm.update;

        bpm.init();

        Engine.run();
    });
}

bpm.init = function() {

};

bpm.update = function() {

};

bpm.render = function() {
    bpm.context.fillStyle = "#FF0000";
    bpm.context.fillRect(0, 0, 32, 32);
};