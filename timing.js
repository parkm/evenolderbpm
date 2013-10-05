function Interval(_duration, options) {
    return {
        //Is the interval on?
        active: false,
        completed: false,
        onComplete: options.onComplete || undefined,

        ease: options.ease || undefined,
        t: 0, //Percent completed with easing.

        // Timing information.
        time: 0, //Current time
        duration: _duration,

        update: function(delta) {
            if (!this.completed && this.active) {
                this.time += delta;
                this.t = this.time / (this.duration * 1000);

                if (this.ease && this.t > 0 && this.t < 1) {
                    this.t = this.ease(this.t);
                }

                if (this.time >= this.duration * 1000) {
                    this.t = 1;
                    this.completed = true;
                    if (this.onComplete) {
                        this.onComplete();
                    }
                }
            }
        },

        start: function() {
            this.time = 0;
            if (this.duration === 0) {
                this.active = false;
                return;
            }
            this.active = true;
            this.completed = false;
        },

        //Resets the interval back to 0 but doesn't start.
        stop: function() {
            this.time = 0;
            this.active = false;
            this.completed = false;
        },

        getPercent: function() {
            return this.time / (this.duration * 1000);
        },

        setPercent: function(value) {
            this.time = (this.duration * value) * 1000;
        },

        getScale: function() {
            return this.t;
        },
    };
}

function ValueInterval(initial, to, duration, options) {
    var base = Interval(duration, options);

    base.initial = initial;
    base.to = to;
    base.value = initial;

    var superUpdate = base.update;
    base.update = function(delta) {
        superUpdate.call(base, delta);

        base.value = base.initial + (base.to - base.initial) * base.getScale();
    };

    return base;
}

function PathInterval(duration, options) {
    var base = Interval(duration, options);

    base.points = [];

    base.x = 0;
    base.y = 0;

    base.index = 0;

    base.addPoint = function(x, y) {
        base.points.push({
            x: x,
            y: y
        });
    };

    var superUpdate = base.update;
    base.update = function(delta) {
        var prev = base.points[base.index];
        var next = base.points[base.index+1];

        base.x = prev.x + (next.x - prev.x) * base.getScale();
        base.y = prev.y + (next.y - prev.y) * base.getScale();

        superUpdate.call(base, delta);
    };

    return base;
}

var Ease = {};

Ease.PI2 = Math.PI / 2;

Ease.sineIn = function(t) {
    return -Math.cos(Ease.PI2 * t) + 1;
};

Ease.sineOut = function(t) {
    return Math.sin(Ease.PI2 * t);
};

Ease.sineInOut = function(t) {
    return -Math.cos(Math.PI * t) / 2 + 0.5;
};
