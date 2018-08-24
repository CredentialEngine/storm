$("#viewExpandedLinkedDataSearch").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    repo.search("@type:geia\\:XA_end_item_acronym_code_data", function (eiac) {
        var option = $("#viewExpandedLinkedDataProducts").append("<option/>").children().last();
        option.attr("value", eiac.id);
        option.text(eiac["geia:end_item_acronym_code"]);
    }, function (eiacs) {
        $("#viewExpandedLinkedDataProductsFeedback").text(eiacs.length + " results found.")
    }, console.log);
});

function syntaxHighlight2(json) {
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
        if (match.indexOf("descriptors") != -1)
            cls += " descriptors";
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

$("#viewExpandedLinkedDataProducts").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewExpandedLinkedDataProducts :selected").attr("value").indexOf("localhost") == -1)
        $("#viewLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewExpandedLinkedDataProducts :selected").attr("value")
        });
    $("#viewExpandedLinkedDataIframe").html(
        syntaxHighlight2(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewExpandedLinkedDataProducts :selected").attr("value")
                ).toJson()
            )
        )
    );
    $("#viewExpandedLinkedDataComponents").html("");
    $("#viewExpandedLinkedDataComponentsFeedback").text(0 +
        " results found.");
    $("#viewExpandedLinkedDataTasks").html("");
    $("#viewExpandedLinkedDataTasksFeedback").text(0 +
        " results found.");
    $("#viewExpandedLinkedDataSubtasks").html("");
    $("#viewExpandedLinkedDataSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:geia\\:XB_logistics_support_analysis_control_number_indentured_item_data AND geia\\:end_item_acronym_code:\"" + $("#viewExpandedLinkedDataProducts :selected").text() + "\"", function (xb) {
        var option = $("#viewExpandedLinkedDataComponents").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["geia:logistics_support_analysis_control_number"]);
    }, function (eiacs) {
        $("#viewExpandedLinkedDataComponentsFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") +
            " results found.")
    }, console.log);
});

$("#viewExpandedLinkedDataComponents").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewExpandedLinkedDataComponents :selected").attr("value").indexOf("localhost") == -1)
        $("#viewExpandedLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewExpandedLinkedDataComponents :selected").attr("value")
        });
    $("#viewExpandedLinkedDataIframe").html(
        syntaxHighlight2(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewExpandedLinkedDataComponents :selected").attr("value")
                ).toJson()
            )
        )
    );
    $("#viewExpandedLinkedDataTasks").html("");
    $("#viewExpandedLinkedDataTasksFeedback").text(0 +
        " results found.");
    $("#viewExpandedLinkedDataSubtasks").html("");
    $("#viewExpandedLinkedDataSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:CA_task_requirement_data AND logistics_support_analysis_control_number:\"" + $("#viewExpandedLinkedDataComponents :selected").text() + "\"", function (xb) {
            var option = $("#viewExpandedLinkedDataTasks").append("<option/>").children().last();
            option.attr("value", xb.id);
            option.attr("task_code", xb.task_code);
            option.text(xb["task_identification"]);
        },
        function (eiacs) {
            $("#viewExpandedLinkedDataTasksFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") + " results found.")
        }, console.log);
});

$("#viewExpandedLinkedDataTasks").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewExpandedLinkedDataTasks :selected").attr("value").indexOf("localhost") == -1)
        $("#viewExpandedLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewExpandedLinkedDataTasks :selected").attr("value")
        });
    $("#viewExpandedLinkedDataIframe").html(
        syntaxHighlight2(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewExpandedLinkedDataTasks :selected").attr("value")
                ).toJson()
            )
        )
    );
    $("#viewExpandedLinkedDataSubtasks").html("");
    $("#viewExpandedLinkedDataSubtasksFeedback").text(0 +
        " results found.");
    repo.search("@type:CB_subtask_requirement_data AND task_code:\"" + $("#viewExpandedLinkedDataTasks :selected").attr("task_code") + "\"", function (xb) {
        var option = $("#viewExpandedLinkedDataSubtasks").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["subtask_identification"]);
    }, function (eiacs) {
        $("#viewExpandedLinkedDataSubtasksFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") + " results found.")
    }, console.log);
});

$("#viewExpandedLinkedDataSubtasks").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    if ($("#viewExpandedLinkedDataSubtasks :selected").attr("value").indexOf("localhost") == -1)
        $("#viewExpandedLinkedDAtaQrCodeCanvas").html("").qrcode({
            width: 192,
            height: 192,
            text: $("#viewExpandedLinkedDataSubtasks :selected").attr("value")
        });
    $("#viewExpandedLinkedDataIframe").html(
        syntaxHighlight2(
            JSON.parse(
                EcRepository.getBlocking(
                    $("#viewExpandedLinkedDataSubtasks :selected").attr("value")
                ).toJson()
            )
        )
    );
});
