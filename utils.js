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
    switch (string.toLowerCase()) {
        case "false": case "no": case "0": case "": return false;
        default: return true;
    }
};

/*
### Assets ###

Global object that handles the process of loading and obtaining assets.

*/

Assets = {};

Assets.list = [];
Assets.loader = Loader();

// Add to asset list, return added image
Assets.add = function(_id, assetName) {
    Assets.list.push({
        id: _id,
        image: Assets.loader.image(assetName),
    });

    var len = Assets.list.length - 1;
    return Assets.list[len].image;
};

Assets.get = function(id) {
    for (i in Assets.list) {
        if (Assets.list[i].id === id) {
            return Assets.list[i].image;
        }
    }
};

