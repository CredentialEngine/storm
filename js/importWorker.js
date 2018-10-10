var saveAs = {};
var window = {};
var document = {};
var localStorage = {};
self.importScripts('cass.js');

function collapse(f) {
    if (EcArray.isArray(f)) {
        postMessage(f.length);
        if (f.length == 1) {
            postMessage(null);
            return collapse(f[0]);
        }
        if (f.length == 0)
            return null;
        for (var i = 0; i < f.length; i++) {
            f[i] = collapse(f[i]);
            postMessage(null);
        }
        return f;
    } else if (EcObject.isObject(f)) {
        var keys = EcObject.keys(f);
        postMessage(keys.length);
        for (var i = 0; i < keys.length; i++) {
            f[keys[i]] = collapse(f[keys[i]]);
            postMessage(null);
        }
        return f;
    } else {
        return f;
    }
}
self.addEventListener('message', function (e) {
    self.postMessage(JSON.stringify(collapse(e.data)));
}, false);
