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

/* Public
 * Tracks current state.
 * Current state set by State.set */
State.current = undefined;

/* Public
 * Adds a given state to State.list */
State.create = function(id, callback) {
    State.list[id] = callback;
};

/* Public
 * Sets given state as State.current */
State.set = function(id) {
    State.current = State.list[id]();
};
