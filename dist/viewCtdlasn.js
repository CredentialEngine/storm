$("#viewCtdlasnSearch").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    EcFramework.search(repo, "*", function (eiacs) {
        for (var i = 0; i < eiacs.length; i++) {
            var eiac = eiacs[i];

            var option = $("#viewCtdlasn").append("<option/>").children().last();
            option.attr("value", eiac.id);
            option.text(eiac["name"]);
        }
        $("#viewCtdlasnFeedback").text(eiacs.length + " results found.")
    }, console.log);
});

function syntaxHighlight(json) {
    for (var key in json) {
        if (key.indexOf("descriptors") != -1)
            delete json[key];
    }
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

$("#viewCtdlasn").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewCtdlasn :selected").attr("value").indexOf("localhost") == -1)
        $("#viewCtdlasnQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewCtdlasn :selected").attr("value")
        });
    EcRemote.getExpectingObject(
        EcRepository.getBlocking(
            $("#viewCtdlasn :selected").attr("value")
        ).shortId().replace("data", "ceasn"), "",
        function (obj) {
            $("#viewCtdlasnIframe").html(
                syntaxHighlight(obj)
            );
        }, console.error);

    $("#viewCtdlasnComponents").html("");
    $("#viewCtdlasnComponentsFeedback").text(0 +
        " results found.");
    $("#viewCtdlasnTasks").html("");
    $("#viewCtdlasnTasksFeedback").text(0 +
        " results found.");
    $("#viewCtdlasnSubtasks").html("");
    $("#viewCtdlasnSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:geia\\:XB_logistics_support_analysis_control_number_indentured_item_data AND geia\\:end_item_acronym_code:\"" + $("#viewCtdlasn :selected").text() + "\"", function (xb) {
        var option = $("#viewCtdlasnComponents").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["geia:logistics_support_analysis_control_number"]);
    }, function (eiacs) {
        $("#viewCtdlasnComponentsFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") +
            " results found.")
    }, console.log);
});
