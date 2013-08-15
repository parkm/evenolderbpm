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
 * The state ready to be switched. */
State.prepped = undefined;

/* Private - Should only be used by the main loop.
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
        console.log("Prepping state " + id);
    }

    if (State.list[id]) {
        State.prepped = State.list[id];
    } else {
        console.error("Error: No State '" + id + "'");
    }   
};

/* Private - Should only be used by the main loop.
 * Checks if a prepped state exists, then switches to it.*/
State.switchToPrepped = function() {
    if (State.prepped) {
        if (State.debug) {
            console.log("Switching to prepped state...");
        }

        if (State.prepped) {
            State.current = State.prepped();
            State.prepped = null;
            State.current.init();
        } else {
            console.error("Error: Prepped state no longer exists");
        }    
    }
};