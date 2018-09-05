$("#viewLinkedDataSearch").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    repo.searchWithParams("@type:XA_end_item_acronym_code_data OR @type:Product", {
        size: 5000
    }, function (eiac) {
        var option = $("#viewLinkedDataProducts").append("<option/>").children().last();
        option.attr("value", eiac.id);
        if (eiac["end_item_acronym_code"] != null)
            option.text(eiac["end_item_acronym_code"]);
        else {
            option.text(eiac.name[0].descr);
        }
    }, function (eiacs) {
        $("#viewLinkedDataProductsFeedback").text(eiacs.length + " results found.")
    }, console.error);
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
    repo.searchWithParams("@type:XB_logistics_support_analysis_control_number_indentured_item_data AND end_item_acronym_code:\"" + $("#viewLinkedDataProducts :selected").text() + "\"", {
        size: 5000
    }, function (xb) {
        var option = $("#viewLinkedDataComponents").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["logistics_support_analysis_control_number"]);
    }, function (eiacs) {
        $("#viewLinkedDataComponentsFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") +
            " results found.")
    }, console.log);
    var getBE = function (url) {
        EcRepository.get(url, function (beUsage) {
            EcRepository.get(beUsage.beRef[0], function (beRef) {
                if (beRef.hwPart != null)
                    EcRepository.get(beRef.hwPart[0], function (hwPart) {
                        EcRepository.get(hwPart.partRef[0], function (partRef) {
                            if (beRef.plndTask != null || beRef.supTask != null || beRef.taskReq != null) {
                                var count = parseInt($("#viewLinkedDataComponentsFeedback").text().split(" ")[0]) + 1;
                                $("#viewLinkedDataComponentsFeedback").text(count +
                                    " results found.");
                                var option = $("#viewLinkedDataComponents").append("<option/>").children().last();
                                option.text(partRef.name[0].descr[0]);
                                option.attr("value", beRef.id);
                            }
                        }, console.error);
                    }, console.error);
            }, console.error);
        }, console.error);
    }
    EcRepository.get($("#viewLinkedDataProducts :selected").attr("value"), function (prod) {
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
    repo.searchWithParams("@type:CA_task_requirement_data AND logistics_support_analysis_control_number:\"" + $("#viewLinkedDataComponents :selected").text() + "\"", {
            size: 5000
        }, function (xb) {
            var option = $("#viewLinkedDataTasks").append("<option/>").children().last();
            option.attr("value", xb.id);
            option.attr("task_code", xb.task_code);
            option.text(xb["task_identification"]);
        },
        function (eiacs) {
            $("#viewLinkedDataTasksFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") + " results found.");
        }, console.log);

    EcRepository.get($("#viewLinkedDataComponents :selected").attr("value"), function (beRef) {
        var ary = [];
        if (beRef.plndTask != null)
            ary = ary.concat(beRef.plndTask);

        if (beRef.supTask != null)
            ary = ary.concat(beRef.supTask);

        for (var i = 0; i < ary.length; i++) {
            EcRepository.get(ary[i], function (plndTask) {
                EcRepository.get(plndTask.taskRef[0], function (taskRef) {
                    EcRepository.get(taskRef.taskRev[0], function (taskRev) {
                        var count = parseInt($("#viewLinkedDataTasksFeedback").text().split(" ")[0]) + 1;
                        $("#viewLinkedDataTasksFeedback").text(count +
                            " results found.");
                        var option = $("#viewLinkedDataTasks").append("<option/>").children().last();
                        option.attr("value", taskRev.id);
                        option.text(taskRev.name[0].descr["0"]);
                    }, console.error);
                }, console.error);
            }, console.error);
        }
    }, console.error);
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
    repo.searchWithParams("@type:CB_subtask_requirement_data AND task_code:\"" + $("#viewLinkedDataTasks :selected").attr("task_code") + "\"", {
        size: 5000
    }, function (xb) {
        var option = $("#viewLinkedDataSubtasks").append("<option/>").children().last();
        option.attr("value", xb.id);
        option.text(xb["subtask_identification"]);
    }, function (eiacs) {
        $("#viewLinkedDataSubtasksFeedback").text(eiacs.length + (eiacs.length == 50 ? "+" : "") + " results found.")
    }, console.log);

    EcRepository.get($("#viewLinkedDataTasks :selected").attr("value"), function (taskrev) {
        for (var i = 0; i < taskrev.subtByDef.length; i++) {
            EcRepository.get(taskrev.subtByDef[i], function (subtByDef) {
                var count = parseInt($("#viewLinkedDataSubtasksFeedback").text().split(" ")[0]) + 1;
                $("#viewLinkedDataSubtasksFeedback").text(count +
                    " results found.");
                var option = $("#viewLinkedDataSubtasks").append("<option/>").children().last();
                option.attr("value", subtByDef.id);
                option.text(subtByDef.name[0].descr["0"]);
            }, console.error);
        }
    }, console.error);
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
