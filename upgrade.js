function Upgrade(_name, _description, _levels) {
    return {
        name: _name,
        description: _description,
        levels: _levels,
        level: 0,
        price: 0,
        value: 0,

        update: function() {

        },

        getCondition: function() {
            return true;
        },

        isMaxed: function() {
            if (this.level >= this.levels) {
                return true;
            } else {
                return false;
            }
        },

        onPurchase: function() {
            this.level++;
            this.update();
        },
    }
}

Upgrade.list = [];

Upgrade.create = function(id, callback) {
    Upgrade.list[id] = callback();
};

Upgrade.get = function(id) {
    return Upgrade.list[id];
};