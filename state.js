/*
### State ###
*/

/* Public
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
        console.log("Prepping state " + id);
    }

    if (State.list[id]) {
        State.prepped = State.list[id];
        State.currentID = id;
    } else {
        console.error("Error: No State '" + id + "'");
    }   
};

/* Public
 * Switches to prepped state, updates current state.
 * Use this method to update the current state.
 */
State.update = function(delta) {
    /* Private - Should only be used by State.update()
     * Checks if a prepped state exists, then switches to it.*/
    var switchToPrepped = function() {
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


    switchToPrepped();
    if (State.current) {
        State.current.update(delta);
    }
};

/* Public
        Created to maintain normality with State.update.
        Add any necessary pre-render code here.
*/
State.render = function(gc) {

    if (State.current) {
        State.current.render(gc);
    }
};

/* Public
        List of all state constructors.
        Use this to inherit from previously created states.
*/
State.list = {};

/* Private
        Turns debug info on/off for this module.
        All debug info is sent to console.
*/
State.debug = false;

/* Private
        Tracks current state.
        Current state set by State.set
*/
State.current = undefined;

/* Private
        Tracks current state's ID
        Useful for resetting current state
*/
State.currentID = "";

/* Private
        The state ready to be switched.
        Should only be used by the main loop.
*/
State.prepped = undefined;
