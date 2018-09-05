$("#viewExpandedLinkedDataSearch").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    repo.search("@type:XA_end_item_acronym_code_data OR @type:Product", function (eiac) {
        var option = $("#viewExpandedLinkedDataProducts").append("<option/>").children().last();
        option.attr("value", eiac.id);
        if (eiac["end_item_acronym_code"] != null)
            option.text(eiac["end_item_acronym_code"]);
        else {
            option.text(eiac.name[0].descr);
        }
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
    repo.search("@type:XB_logistics_support_analysis_control_number_indentured_item_data AND end_item_acronym_code:\"" + $("#viewExpandedLinkedDataProducts :selected").text() + "\"", function (xb) {
        var option = $("#viewExpandedLinkedDataComponents").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["logistics_support_analysis_control_number"]);
    }, function (eiacs) {
        $("#viewExpandedLinkedDataComponentsFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") +
            " results found.")
    }, console.log);

    var getBE = function (url) {
        EcRepository.get(url, function (beUsage) {
            EcRepository.get(beUsage.beRef[0], function (beRef) {
                if (beRef.hwPart != null)
                    EcRepository.get(beRef.hwPart[0], function (hwPart) {
                        EcRepository.get(hwPart.partRef[0], function (partRef) {
                            if (beRef.plndTask != null || beRef.supTask != null || beRef.taskReq != null) {
                                var count = parseInt($("#viewExpandedLinkedDataComponentsFeedback").text().split(" ")[0]) + 1;
                                $("#viewExpandedLinkedDataComponentsFeedback").text(count +
                                    " results found.");
                                var option = $("#viewExpandedLinkedDataComponents").append("<option/>").children().last();
                                option.text(partRef.name[0].descr[0]);
                                option.attr("value", beRef.id);
                            }
                        }, console.error);
                    }, console.error);
            }, console.error);
        }, console.error);
    }
    EcRepository.get($("#viewExpandedLinkedDataProducts :selected").attr("value"), function (prod) {
        var bkdns = prod.bkdns[0].bkdn;
        if (bkdns != null)
            for (var i = 0; i < bkdns.length; i++) {
                EcRepository.get(bkdns[i], function (bkdn) {
                    if (bkdn.bkdnRev != null)
                        for (var i = 0; i < bkdn.bkdnRev.length; i++) {
                            EcRepository.get(bkdn.bkdnRev[i], function (bkdnRev) {
                                if (bkdnRev.beUsage != null)
                                    for (var i = 0; i < bkdnRev.beUsage.length; i++) {
                                        getBE(bkdnRev.beUsage[i]);
                                    }
                            }, console.error);
                        }
                }, console.error);
            }
    }, console.error);
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

    EcRepository.get($("#viewExpandedLinkedDataComponents :selected").attr("value"), function (beRef) {
        var ary = [];
        if (beRef.plndTask != null)
            ary = ary.concat(beRef.plndTask);

        if (beRef.supTask != null)
            ary = ary.concat(beRef.supTask);

        for (var i = 0; i < ary.length; i++) {
            EcRepository.get(ary[i], function (plndTask) {
                EcRepository.get(plndTask.taskRef[0], function (taskRef) {
                    EcRepository.get(taskRef.taskRev[0], function (taskRev) {
                        var count = parseInt($("#viewExpandedLinkedDataTasksFeedback").text().split(" ")[0]) + 1;
                        $("#viewExpandedLinkedDataTasksFeedback").text(count +
                            " results found.");
                        var option = $("#viewExpandedLinkedDataTasks").append("<option/>").children().last();
                        option.attr("value", taskRev.id);
                        option.text(taskRev.name[0].descr["0"]);
                    }, console.error);
                }, console.error);
            }, console.error);
        }
    }, console.error);
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

    EcRepository.get($("#viewExpandedLinkedDataTasks :selected").attr("value"), function (taskrev) {
        for (var i = 0; i < taskrev.subtByDef.length; i++) {
            EcRepository.get(taskrev.subtByDef[i], function (subtByDef) {
                var count = parseInt($("#viewExpandedLinkedDataSubtasksFeedback").text().split(" ")[0]) + 1;
                $("#viewExpandedLinkedDataSubtasksFeedback").text(count +
                    " results found.");
                var option = $("#viewExpandedLinkedDataSubtasks").append("<option/>").children().last();
                option.attr("value", subtByDef.id);
                option.text(subtByDef.name[0].descr["0"]);
            }, console.error);
        }
    }, console.error);
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
