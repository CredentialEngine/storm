function importS3000L(data) {
    var repo = new EcRepository();
    repo.selectedServer = "http://10.1.123.190:8080/api/";

    var pks = {};

    var namespace = "http://www.asd-europe.org/s-series/s3000l";

    var lookupTable = {};

    function shatter(data, prevName) {
        var val = parseInt($("#importParseProgress").attr("value")) + 1;
        $("#importParseProgress").attr("value", val);
        $("#importParseText").text(val);
        if (EcArray.isArray(data)) {
            var val = parseInt($("#importParseProgress").attr("max")) + data.length;
            $("#importParseProgress").attr("max", val);
            $("#importParseTextMax").text(val);
            for (var i = 0; i < data.length; i++) {
                var result = shatter(data[i], prevName);
                if (result == true)
                    data.splice(i, 1);
                else if (result == false || result == null)
                ;
                else
                    data[i] = result;
            }
            if (data.length == 0)
                return true;
            return data;
        } else if (EcObject.isObject(data)) {
            //We're in something that can be called a fragment. Recurse first, then turn into an object and save.
            var val = parseInt($("#importParseProgress").attr("max")) + EcObject.keys(data).length;
            $("#importParseProgress").attr("max", val);
            $("#importParseTextMax").text(val);
            for (var prop in data) {
                if (prop == "$") {
                    var val = parseInt($("#importParseProgress").attr("value")) + 1;
                    $("#importParseProgress").attr("value", val);
                    $("#importParseText").text(val);
                    continue;
                }
                var result = shatter(data[prop], prop);
                if (result == true)
                    delete data[prop];
                else if (result == false || result == null)
                ;
                else
                    data[prop] = result;
            }

            if (data["$"] != null)
                if (data["$"].uidRef != null) {
                    return EcRemoteLinkedData.veryShortId(repo.selectedServer, data["$"].uidRef);
                }
            if (data["$"] != null)
                if (data["$"].uid != null) {
                    if (lookupTable[prevName] != null)
                        var d = new EcRemoteLinkedData(namespace, lookupTable[prevName]);
                    else
                        var d = new EcRemoteLinkedData(namespace, prevName);
                    d.assignId(repo.selectedServer, data["$"].uid);
                    var val = parseInt($("#importParseProgress").attr("max")) + EcObject.keys(data).length;
                    $("#importParseProgress").attr("max", val);
                    $("#importParseTextMax").text(val);
                    for (var param in data) {
                        var val = parseInt($("#importParseProgress").attr("value")) + 1;
                        $("#importParseProgress").attr("value", val);
                        $("#importParseText").text(val);
                        if (param == "$")
                            continue;
                        d[param] = data[param];
                    }
                    console.log(d.toJson());
                    saveThing(d);
                    return d.id;
                }
        }
        return data;
    }

    var saveThing = function (thing) {
        var val = parseInt($("#importUploadProgress").attr("max")) + 1;
        $("#importUploadProgress").attr("max", val);
        $("#importUploadTextMax").text(val);

        Task.asyncImmediate(function (con) {
            if (repo.selectedServer == "http://nowhere/") {
                var val = parseInt($("#importUploadProgress").attr("value")) + 1;
                $("#importUploadProgress").attr("value", val);
                $("#importUploadText").text(val);
                setTimeout(con, 30);
            } else
                repo.saveTo(thing, function (success) {
                    console.log(thing.id);

                    var val = parseInt($("#importUploadProgress").attr("value")) + 1;
                    $("#importUploadProgress").attr("value", val);
                    $("#importUploadText").text(val);

                    con();
                }, function (error) {
                    console.log(thing.id);
                    console.log(error);

                    var val = parseInt($("#importUploadProgress").attr("value")) + 1;
                    $("#importUploadProgress").attr("value", val);
                    $("#importUploadText").text(val);

                    con();
                });
        });
    }

    var val = parseInt($("#importParseProgress").attr("max")) + 1;
    $("#importParseProgress").attr("max", val);
    $("#importParseTextMax").text(val);

    EcRemote.getExpectingObject("js/S3000LSchema.json", null, function (success) {
        var g = success["@graph"];
        for (var i = 0; i < g.length; i++) {
            lookupTable[g[i]["meta:s3000lShortName"]] = g[i]["ceasn:codedNotation"];
        }
        console.log(lookupTable);
        shatter(data);
    }, console.error);
}
