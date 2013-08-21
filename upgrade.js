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

var testUpgrade = Upgrade("Test Upgrade", "Just a test", 10);

testUpgrade.update = function() {
    testUpgrade.price = (level+1) * 2;
    testUpgrade.value = (level+1) * 5;
};