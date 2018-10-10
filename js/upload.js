var upload = function (data) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    var pks = {};

    var namespace = "http://www.geia_STD_0007.com/2006/schema";

    var types = EcObject.keys(data);
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var instances = data[type];
        if (!EcArray.isArray(instances)) {
            data[type] = [data[type]];
            instances = data[type];
        }
        for (var j = 0; j < instances.length; j++) {
            var fields = EcObject.keys(instances[j]);
            if (pks[type] == null)
                pks[type] = fields;
            else {
                for (var k = 0; k < fields.length; k++) {
                    if (pks[type].indexOf(fields[k]) == -1)
                        pks[type].push(fields[k]);
                }
            }
        }
        for (var j = 0; j < instances.length; j++) {
            var fields = EcObject.keys(instances[j]);
            for (var k = 0; k < pks[type].length; k++)
                if (instances[j][fields[k]] != null && instances[j][fields[k]].length > 70)
                    pks[type].splice(k, 1);
        }
    }

    function testUniqueKeys(type) {
        var testFields = JSON.parse(JSON.stringify(pks[type]));
        var sampleThisOneToo = testFields.pop();
        var targetUniqueCount = data[type].length;
        var sampleList = data[type];
        var samples = {};
        if (testFields.length == 0) {
            console.log(testFields);
            return true;
        }
        for (var i = 0; i < sampleList.length; i++) {
            var sample = data[type][i];
            var id = "";
            for (var j = 0; j < testFields.length; j++) {
                if (j > 0)
                    id += "_";
                //if (sample[testFields[j]] === undefined)
                //   return false;
                if (sample[testFields[j]] !== undefined && sample[testFields[j]].length > 70)
                    return false;
                if (sample[sampleThisOneToo] !== undefined && sample[sampleThisOneToo].length > 70)
                    return false;
                id += sample[testFields[j]];
            }
            samples[id] = true;
        }
        if (targetUniqueCount == 1)
            return true;
        if (EcObject.keys(samples).length < targetUniqueCount) {
            return true; //We have reached distinction.
        }
        return false;
    }

    var types = EcObject.keys(data);
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        console.log(type);
        console.log(pks[type]);
        while (!testUniqueKeys(type))
            pks[type].pop();
        console.log(type + " minimally described by " + pks[type]);
    }

    var saveThing = function (thing) {
        Task.asyncImmediate(function (con) {
            if (repo.selectedServer == "http://nowhere/") {
                var val = parseInt($("#importUploadProgress").attr("value")) + 1;
                $("#importUploadProgress").attr("value", val);
                $("#importUploadText").text(val);
                setTimeout(con, 30);
            } else {
                repo.saveTo(thing, function (success) {
                    var val = parseInt($("#importUploadProgress").attr("value")) + 1;
                    $("#importUploadProgress").attr("value", val);
                    $("#importUploadText").text(val);
                    //console.log(thing.id);
                    con();
                }, function (error) {
                    console.log(thing.id);
                    console.log(error);
                    var val = parseInt($("#importUploadProgress").attr("value")) + 1;
                    $("#importUploadProgress").attr("value", val);
                    $("#importUploadText").text(val);
                    con();
                });
            }
        });
    }

    var types = EcObject.keys(data);
    var duplicateFinder = {};
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var instances = data[type];
        var val = parseInt($("#importUploadProgress").attr("max")) + instances.length;
        $("#importUploadProgress").attr("max", val);
        $("#importUploadTextMax").text(val);
        for (var j = 0; j < instances.length; j++) {
            var rld = new EcRemoteLinkedData();
            rld.copyFrom(instances[j]);
            rld.context = namespace;
            rld.type = type;
            var id = "";
            for (var k = 0; k < pks[type].length; k++) {
                if (k > 0)
                    id += ".";
                if (instances[j][pks[type][k]] === undefined)
                    id += "";
                else
                    id += instances[j][pks[type][k]];
            }
            rld.assignId(repo.selectedServer, id.replace(/ /g, "_"));
            if (duplicateFinder[type + id] != null && duplicateFinder[type + id].toJson() != rld.toJson()) {
                console.log(duplicateFinder[type + id].toJson());
                console.log(rld.toJson());
                console.log(type + id + " duplicated");
                throw type + id;
            }
            duplicateFinder[type + id] = rld;
            saveThing(rld);
            //console.log(rld.id);
        }
        console.log(repo.selectedServer + "data?q=@type:" + type);
    }
}
