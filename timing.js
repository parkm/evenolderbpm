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
    base.pointsD = [];
    base.pointsT = [];

    base.x = 0;
    base.y = 0;

    base.index = 0;

    base.distance = 0;

    base.startTest = function() {
        base.addPoint(0,0);
        base.updatePath();
        base.speed = base.distance / base.duration;
        base.start();
    };

    base.addPoint = function(x, y) {
        var point = {
            x: x,
            y: y
        };

        if (base.last) {
            base.distance += Math.sqrt((base.x - base.last.x) * (base.x - base.last.x) + (base.y - base.last.y) * (base.y - base.last.y));
            base.pointsD.push(base.distance);
        } else {
            base.x = x;
            base.y = y;
        }

        base.last = point;
        base.points.push(point);
    };

    base.updatePath = function() {
        var i=0;
        while (i < base.points.length) {
            base.pointsT[i] = base.pointsD[i++] / base.distance;
        }
    };

    var superUpdate = base.update;
    base.update = function(delta) {
        superUpdate.call(base, delta);
        if (base.points.length === 1)
        {
            base.x = base.points[0].x;
            base.y = base.points[0].y;
            return;
        }

        if (base.index < base.points.length - 1)
        {
            while (base.getScale() > base.pointsT[base.index + 1]) {
                base.index++;
            }
        }

        var td = base.pointsT[base.index];
        var tt = base.pointsT[base.index + 1] - td;

        td = (base.getScale() - td) / tt;
        base.prev = base.points[base.index];
        base.next = base.points[base.index + 1];
        base.x = base.prev.x + (base.next.x - base.prev.x) * td;
        base.y = base.prev.y + (base.next.y - base.prev.y) * td;
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
