'use strict';

function extend() {
    var target = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }

    return target;
}

module.exports = extend;
