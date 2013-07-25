function bpm(canvasID) {
    'use strict;'
    $(document).ready(function() {
        bpm.canvas = Canvas(canvasID, false);
        bpm.context = bpm.canvas.getContext();
        bpm.canvas.render = bpm.render;

        Loop.init(60);
        Loop.add(bpm.canvas);
        Loop.update = bpm.update;

        bpm.init();

        Loop.run();
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