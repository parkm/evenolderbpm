/*
### State ###
*/

/* Private
 * Base class for states. If you don't inherit from this class, make sure you structure it the same way.
 * Also base for Static State object.
 */
function State() {
    return {
        paused: false,
        init: function() {

        },

        update: function(delta) {

        },

        render: function(gc) {

        },
    }
}

/* Private
 * List of all state constructors. */
State.list = {};

/* Private
 * Turns debug info on/off for this module.
 * All debug info is sent to console. */
State.debug = true;

/* Public
 * Tracks current state.
 * Current state set by State.set */
State.current = undefined;

/* Public
 * Adds a given state to State.list */
State.create = function(id, callback) {
    if (State.debug) {
        console.log("creating state " + id);
    }

    if (State.list[id]) {
        console.error("Error: State " + id + " already exists.");
    } else {
        State.list[id] = callback;
    }
};

/* Public
 * Sets given state as State.current */
State.set = function(id) {
    if (State.debug) {
        console.log("setting state " + id);
    }

    if (State.list[id]) {
        State.current = State.list[id]();
        State.current.init();
    } else {
        console.error("Error: No State '" + id + "'");
    }
};
