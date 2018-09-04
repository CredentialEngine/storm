var importWorker;

if (typeof (Worker) !== "undefined") {
    if (typeof (importWorker) == "undefined") {
        importWorker = new Worker("dist/importWorker.js");
    }
    importWorker.onmessage = function (event) {
        if (event.data == null) {
            var val = parseInt($("#importParseProgress").attr("value"));
            $("#importParseProgress").attr("value", val + 1);
            $("#importParseText").text(val);
        } else if (event.data.length > 500) {
            console.log(JSON.stringify(EcObject.keys(JSON.parse(event.data)), null, 2));
            upload(JSON.parse(event.data));
        } else {
            var val = parseInt($("#importParseProgress").attr("max"));
            $("#importParseProgress").attr("max", val + parseInt(event.data));
            $("#importParseTextMax").text(val);
        }
    };
} else {}

$("#0007Import").click(function (evt) {
    var file = $("#0007Input")[0].files[0];
    fr = new FileReader();
    fr.onload = function (progress) {
        xml2js.parseString(progress.target.result, function (err, result) {
            var full_file = JSON.parse(JSON.stringify(result["geia:GEIA-STD-0007"]["geia:full_file"]).replace(/geia:/g, ""));
            importWorker.postMessage(full_file);
        });
    };
    fr.readAsText(file);
});

$("#S3000LImport").click(function (evt) {
    var file = $("#S3000LInput")[0].files[0];
    fr = new FileReader();
    fr.onload = function (progress) {
        xml2js.parseString(progress.target.result, function (err, result) {
            importS3000L(result);
        });
    };
    fr.readAsText(file);
});
