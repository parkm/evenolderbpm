var Utils = {};

Utils.drawText = function(gc, text, x, y, options) {
    if (options) {
        gc.fillStyle = options.fillStyle || "#FFFFFF";
        gc.strokeStyle = options.strokeStyle || "#000000";
        gc.textBaseline = options.textBaseline || "top";
        gc.font = options.font || "64px Arial";
        gc.textAlign = options.textAlign || "center";
        gc.lineWidth = options.lineWidth || 6;

        if (options.stroke) {
            gc.strokeText(text, x, y);
        }
    }

    gc.fillText(text, x, y);
};

// Converts given string to Boolean
Utils.stringToBool = function(string) {
    if (typeof string === "string") {
        switch (string.toLowerCase()) {
            case "false": case "no": case "0": case "": return false;
            default: return true;
        }
    } else {
        console.error("Error: stringToBool conversion: typeof " + string + " !== \"string\"");
        return string;
    }
};


Utils.saveData = function() {
    $.cookie("cash", BPM.cash, {expires: 365});
};

Utils.loadData = function() {
    var cash = parseInt($.cookie("cash"));
    if (cash) {
        BPM.cash = cash;
    }
};

Utils.clearData = function() {
    BPM.cash = 10000;
};

/* JS Extensions */

// Returns Object size by counting its keys.
// Ignores any keys from prototypes.
if (!Object.size) {
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
}
