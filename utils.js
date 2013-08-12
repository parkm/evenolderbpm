function Utils() {}
Utils.drawText = function(gc, text, x, y, stroke) {
    if (stroke) {
        gc.strokeText(text, x, y);
    }
    gc.fillText(text, x, y);
};
