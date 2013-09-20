/*
### Assets ###

Global object that handles the process of loading and obtaining assets.

*/
function Assets() {
    path = {
        levels: "include/levels/",
        assets: "assets/",
        bubbles: "assets/bubbles/"
    };

    // Pin Assets
    PinAssets.arrow = Assets.add("arrow", path.assets + "arrow.png");
    PinAssets.pin = Assets.add("pin", path.assets + "pin.png");

    // Bubble Assets
    BubbleAssets.explode = Assets.add("explosion", path.assets + "explode-124x150-strip23.png");
    BubbleAssets.pop = Assets.add("pop", path.bubbles + "pop-90x100-strip7.png");
    BubbleAssets.glare = Assets.add("bubbleGlare", path.bubbles + "bubble-glare.png");

    BubbleAssets.bubble = Assets.add("bubble", path.bubbles + "bubble.png");
    
    Assets.addTintedBubbles(BubbleAssets, BubbleAssets.bubble, {
        "score": "rgb(0, 0, 255)",
        "bad": "rgb(255, 0, 0)",
        "goal": "rgb(255, 255, 0)",
        "ammo": "rgb(0, 255, 255)",
        "double": "rgb(0, 255, 0)",
        "combo": "rgb(186, 0, 255)",
        "reflect": "rgb(255, 100, 0)",
        "bomb": "rgb(0, 0, 0)"
    });

    // State Assets
    StateAssets.background = Assets.add("background", path.assets + "blue-background.jpg");
    StateAssets.wall = Assets.add("wall", path.assets + "wall.png");

    // GUI Assets
    GUIAssets.buttonUp = Assets.add("buttonUp", path.assets + "button-up.png");
    GUIAssets.buttonHover = Assets.add("buttonHover", path.assets + "button-hover.png");
    GUIAssets.buttonDown = Assets.add("buttonDown", path.assets + "button-down.png");

    // Levels
    Assets.addLevels(StateAssets, path.levels, {
        "testLevelJSON": "test-level.json",
        "tutorial0": "tutorial_0.json",
        "tutorial1": "tutorial_1.json",
        "tutorial2": "tutorial_2.json",
        "tutorial3": "tutorial_3.json",
        "tutorial4": "tutorial_4.json",
        "tutorial5": "tutorial_5.json",
        "issue8": "issue8.json",
        "donk": "donk-level.json"
    });

    // Returning self to cascade.
    return Assets;
}


Assets.list = [];
Assets.loader = Loader();

// Add to asset list, return added image
// Images Only
Assets.add = function(_id, assetName) {
    Assets.list.push({
        id: _id,
        image: Assets.loader.image(assetName),
    });

    var len = Assets.list.length - 1;
    return Assets.list[len].image;
};

Assets.tintedBubbleHolder = 0;
Assets.tintedBubbleImage = 0;
Assets.bubblesToTint = [];

/*  Adds bubbles you want to tint to a list, in order to prepare it for caching.

    holder:
            Object to hold loaded files. Stores data in holder[id],
            where id is the matching key in colors object
    image:
            The base image you want to tint.
    colors:
            Object containing the colors of the bubble. 
            format: "bubbleName": "rgb(redValue, blueValue, greenValue)"
*/
Assets.addTintedBubbles = function(holder, image, colors) {
    Assets.tintedBubbleHolder = holder;
    Assets.tintedBubbleImage = image;
    for (var bubbleName in colors) {
        Assets.bubblesToTint.push({
            name: bubbleName,
            color: colors[bubbleName]
        });    
    } 
};

/*  Generates the tinted images from the bubblesToTint list.  */
Assets.genTintedBubbles = function(gc) {
    for (var i in Assets.bubblesToTint) {
        var img = Assets.bubblesToTint[i];
        
        //Create offscreen buffer
        var buffer = document.createElement('canvas');

        buffer.width = Assets.tintedBubbleImage.width;
        buffer.height = Assets.tintedBubbleImage.height;
        bgc = buffer.getContext('2d');

        // fill offscreen buffer with the tint color
        bgc.fillStyle = img.color;
        bgc.fillRect(0,0,buffer.width,buffer.height);

        bgc.globalCompositeOperation = "destination-atop";
        bgc.drawImage(Assets.tintedBubbleImage,0,0);
        
        gc.canvas.width = gc.canvas.width; //Clear the canvas, otherwise there will be a background to the tinted images.
        gc.drawImage(Assets.tintedBubbleImage,0,0);

        //Set the tinting amount.
        gc.globalAlpha = 1;
        gc.drawImage(buffer,0,0);

        var cachedCanvas = document.createElement('canvas');
        cachedCanvas.width = buffer.width;
        cachedCanvas.height = buffer.height;
        cachedCanvas.getContext('2d').drawImage(gc.canvas,0,0);

        Assets.tintedBubbleHolder[img.name] = cachedCanvas;
    }
};

// Images Only
Assets.get = function(id) {
    for (i in Assets.list) {
        if (Assets.list[i].id === id) {
            return Assets.list[i].image;
        }
    }
};

/*  Assets.load
    Wrapper to initiate loading sequence.

    callback:
            callback function to call when complete
*/
Assets.load = function(callback) {
    Assets.loader.load(function() {
        Assets.genTintedBubbles(BPM.context);
        callback();
    });
};

/*  Assets.addLevels
    Wrapper to load level data

    holder:
            object to hold loaded files. Stores data in holder[id],
            where id is the matching key in files object
    path:
            base file path, gets added to file name.
            pass an empty string if file is in working directory
    files:
            object containing all files to load.
            format: "levelID": "filename.extension"
*/
Assets.addLevels = function(holder, path, files) {
    for (var file in files) {
        Assets.loader.file(file, path + files[file], function(id, data) {
            data = Assets.level.parse(data);
            holder[id] = data;
        });
    }
};

/*  Assets.level
    Provides useful functions for level assets. Use as a static object.

    convert:
            Converts text data to JSON

    parse:
            parses loaded Tiled JSON level data
            must be called on a loaded callback.
*/
Assets.level = {
    bubbleHeight: 32,
    convert: function(data) {
        data = $.parseJSON(data);
        return data;
    },

    parse: function(data) {
        data = this.convert(data);

        var result = {
            bubbles: [],
            walls: []
        };

        var walls = [], moves = [], bubbles = [], shooter;

        var bubbleHeight = data.tileheight;
        var bubbleWidth = data.tilewidth;

        // Loop through layers, assign references
        for (var i in data.layers) {
            switch(data.layers[i].name) {
                case "walls":
                    walls = data.layers[i].objects;
                    break;

                case "bubbles":
                    bubbles = data.layers[i].objects;
                    break;

                case "shooter":
                    // Only get first instance - should only be one shooter.
                    shooter = data.layers[i].objects[0];
                    break;

                case "moves":
                    moves = data.layers[i].objects;
                    break;
            }
        }

        for (var w in walls) {
            // Set up moving walls from moves object layer
            // moving walls must be named "move_wall"
            if (walls[w].name === "move_wall") {
                for (var m in moves) {
                    if (moves[m].type === walls[w].type) {
                        walls[w].moveLine = [];
                        moves[m].polyline.forEach(function(element, index, array) {
                            walls[w].moveLine.push({x: element.x + moves[m].x, y: element.y + moves[m].y})
                        });
                        if (moves[m].properties.speed && !isNaN(+moves[m].properties.speed)) {
                            walls[w].moveSpeed = +moves[m].properties.speed;
                        }
                        if (moves[m].properties.auto) {
                            walls[w].moveAuto = Utils.stringToBool(moves[m].properties.auto);
                        }
                        if (moves[m].properties.loop) {
                            walls[w].moveLoop = Utils.stringToBool(moves[m].properties.loop);
                        }
                        if (moves[m].name) {
                            walls[w].id = moves[m].name;
                        }
                    }
                }
            }
        }

        for (var b in bubbles) {
            // Merge and convert properties
            var properties = bubbles[b].properties;
            for (var prop in properties) {
                var num = +properties[prop];
                // Will have to change this if properites are strings
                if (isNaN(num)) {
                    bubbles[b][prop] = Utils.stringToBool(properties[prop]);
                } else {
                    bubbles[b][prop] = num;
                }
            }

            // Add constraints if random area
            if (bubbles[b].name === "random") {
                bubbles[b].constraints = {
                    x: bubbles[b].x,
                    y: bubbles[b].y,
                    width: (bubbles[b].x + bubbles[b].width) - bubbleWidth,
                    height: (bubbles[b].y + bubbles[b].height) - bubbleHeight
                };
            }

            // Corrections
            // if count is undefined, define it (otherwise no bubbles)
            if (!bubbles[b].count) {
                bubbles[b].count = 1;
            }
            // Adjust y of bubbles by their height - Tiled is dumb
            bubbles[b].y -= bubbleHeight;
        }

        // Assign shooter data
        if (shooter) {
            result.shooter = {
                x: shooter.x,
                y: shooter.y,
                pins: +shooter.properties.pins
            };
        }

        result.bubbles = bubbles;
        result.walls = walls;
        return result;
    }
};


