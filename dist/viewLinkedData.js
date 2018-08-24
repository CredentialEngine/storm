$("#viewLinkedDataSearch").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    repo.search("@type:geia\\:XA_end_item_acronym_code_data", function (eiac) {
        var option = $("#viewLinkedDataProducts").append("<option/>").children().last();
        option.attr("value", eiac.id);
        option.text(eiac["geia:end_item_acronym_code"]);
    }, function (eiacs) {
        $("#viewLinkedDataProductsFeedback").text(eiacs.length + " results found.")
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

$("#viewLinkedDataProducts").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewLinkedDataProducts :selected").attr("value").indexOf("localhost") == -1)
        $("#viewLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewLinkedDataProducts :selected").attr("value")
        });
    $("#viewLinkedDataIframe").html(
        syntaxHighlight(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewLinkedDataProducts :selected").attr("value")
                ).toJson()
            )
        )
    );
    $("#viewLinkedDataComponents").html("");
    $("#viewLinkedDataComponentsFeedback").text(0 +
        " results found.");
    $("#viewLinkedDataTasks").html("");
    $("#viewLinkedDataTasksFeedback").text(0 +
        " results found.");
    $("#viewLinkedDataSubtasks").html("");
    $("#viewLinkedDataSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:geia\\:XB_logistics_support_analysis_control_number_indentured_item_data AND geia\\:end_item_acronym_code:\"" + $("#viewLinkedDataProducts :selected").text() + "\"", function (xb) {
        var option = $("#viewLinkedDataComponents").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["geia:logistics_support_analysis_control_number"]);
    }, function (eiacs) {
        $("#viewLinkedDataComponentsFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") +
            " results found.")
    }, console.log);
});

$("#viewLinkedDataComponents").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewLinkedDataComponents :selected").attr("value").indexOf("localhost") == -1)
        $("#viewLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewLinkedDataComponents :selected").attr("value")
        });
    $("#viewLinkedDataIframe").html(
        syntaxHighlight(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewLinkedDataComponents :selected").attr("value")
                ).toJson()
            )
        )
    );
    $("#viewLinkedDataTasks").html("");
    $("#viewLinkedDataTasksFeedback").text(0 +
        " results found.");
    $("#viewLinkedDataSubtasks").html("");
    $("#viewLinkedDataSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:CA_task_requirement_data AND logistics_support_analysis_control_number:\"" + $("#viewLinkedDataComponents :selected").text() + "\"", function (xb) {
            var option = $("#viewLinkedDataTasks").append("<option/>").children().last();
            option.attr("value", xb.id);
            option.attr("task_code", xb.task_code);
            option.text(xb["task_identification"]);
        },
        function (eiacs) {
            $("#viewLinkedDataTasksFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") + " results found.")
        }, console.log);
});

$("#viewLinkedDataTasks").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewLinkedDataTasks :selected").attr("value").indexOf("localhost") == -1)
        $("#viewLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewLinkedDataTasks :selected").attr("value")
        });
    $("#viewLinkedDataIframe").html(
        syntaxHighlight(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewLinkedDataTasks :selected").attr("value")
                ).toJson()
            )
        )
    );
    $("#viewLinkedDataSubtasks").html("");
    $("#viewLinkedDataSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:CB_subtask_requirement_data AND task_code:\"" + $("#viewLinkedDataTasks :selected").attr("task_code") + "\"", function (xb) {
        var option = $("#viewLinkedDataSubtasks").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["subtask_identification"]);
    }, function (eiacs) {
        $("#viewLinkedDataSubtasksFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") + " results found.")
    }, console.log);
});

$("#viewLinkedDataSubtasks").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewLinkedDataSubtasks :selected").attr("value").indexOf("localhost") == -1)
        $("#viewLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewLinkedDataSubtasks :selected").attr("value")
        });
    $("#viewLinkedDataIframe").html(
        syntaxHighlight(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewLinkedDataSubtasks :selected").attr("value")
                ).toJson()
            )
        )
    );
});
