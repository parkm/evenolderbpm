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

// Convenient wrapper to load JSON level data (from XML file)
// and assign to an assetHolder object with given name
Assets.addLevel = function(assetHolder, name, filepath) {
    // Type checking
    if (typeof name !== "string") {
        console.error("Error adding level. Name of level data must be a string.");
        return 0;
    }
    if (typeof assetHolder !== "object") {
        console.error("Error adding level. Please specify an object to store level data.");
        return 0;
    }

    Assets.loader.json(filepath, function(data) {
        assetHolder[name] = data;
    });
};
