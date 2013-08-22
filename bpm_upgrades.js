Upgrade.create("test", function() {
    var base = Upgrade("Test Upgrade", "Just a test", 10);

    base.update = function() {
        base.price = (base.level+1) * 2;
        base.value = (base.level+1) * 5;
    };

    return base;
});

Upgrade.create("poop", function() {
    var base = Upgrade("Poop Upgrade", "Just a poop", 4);

    base.update = function() {
        base.price = (base.level+1) * 25;
        base.value = (base.level+1) * 3;
    };

    return base;
});