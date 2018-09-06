$("#convertProductDataButton").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    var repo2 = repo;

    var structure = [];
    var lookup = {};
    var error = function (failure) {
        console.trace(failure);
        throw failure;
    };
    EcRepository.caching = true;

    function competencyFrom0007(xb) {
        var xbc = new EcCompetency();
        xbc.assignId(repo2.selectedServer, xb.type.split("_")[0] + "_" + xb.getGuid());
        lookup[xb.type.split("_")[0] + "_" + xb.getGuid()] = xbc;
        xbc["dcterms:type"] = {
            XB_logistics_support_analysis_control_number_indentured_item_data: "Component (XB)",
            CA_task_requirement_data: "Task (CA)",
            CB_subtask_requirement_data: "Subtask (CB)"
        }[xb.type];
        xbc["ceasn:derivedFrom"] = xb.id;
        xbc["ceasn:codedNotation"] = xb.getGuid().substring(3);
        xbc.name = xb[{
            XB_logistics_support_analysis_control_number_indentured_item_data: "logistics_support_analysis_control_number_nomenclature",
            CA_task_requirement_data: "task_identification",
            CB_subtask_requirement_data: "subtask_identification"
        }[xb.type]];
        xbc.description = xb[{
            CB_subtask_requirement_data: "subtask_description"
        }[xb.type]];
        if (xbc.description != null)
            xbc.description = xbc.description.replace(/ +/g, " ").replace(/- /g, "");
        return xbc;
    }

    function competencyFromS3000L(xb) {
        var xbc = new EcCompetency();
        xbc.assignId(repo2.selectedServer, xb.getGuid() + "_COMP");
        xbc["dcterms:type"] = {
            BreakdownElementUsageInBreakdown: "Component (BreakdownElementUsageInBreakdown)",
            OperationalTask: "Task (OperationalTask)",
            RectifyingTask: "Task (RectifyingTask)",
            TaskRevision: "Task (TaskRevision)",
            SupportingTaskTarget: "Task (SupportingTaskTarget)",
            SubtaskByDefinition: "Subtask (SubtaskByDefinition)"
        }[xb.type];

        xbc["ceasn:derivedFrom"] = xb.id;
        if (xb.beRef != null)
            EcRepository.get(xb.beRef[0], function (beRef) {
                if (beRef.hwPart != null)
                    EcRepository.get(beRef.hwPart[0], function (hwPart) {
                        EcRepository.get(hwPart.partRef[0], function (partRef) {
                            xbc.name = partRef.name[0].descr[0];
                        }, console.error);
                    }, console.error);

                //        xbc.name = xb[{
                //            BreakdownElementUsageInBreakdown: xb.name[0].descr[0],
                //            CA_task_requirement_data: "task_identification",
                //            CB_subtask_requirement_data: "subtask_identification"
                //        }[xb.type]];
            });

        if (xb.taskRev != null)
            EcRepository.get(xb.taskRev[0], function (taskRev) {
                xbc.name = taskRev.name[0].descr["0"];
            }, console.error);

        if (xb.name != null)
            xbc.name = xb.name[0].descr["0"];
        return xbc;
    }

    var saveThing = function (thing) {
        var typeMap = {
            "Component (XB)": "#convertProductDataComponent",
            "Task (CA)": "#convertProductDataTask",
            "Subtask (CB)": "#convertProductDataSubtask",
            "Component (BreakdownElementUsageInBreakdown)": "#convertProductDataComponent",
            "Task (OperationalTask)": "#convertProductDataTask",
            "Task (RectifyingTask)": "#convertProductDataTask",
            "Task (TaskRevision)": "#convertProductDataTask",
            "Task (SupportingTaskTarget)": "#convertProductDataTask",
            "Subtask (SubtaskByDefinition)": "#convertProductDataSubtask",
            undefined: "#convertProductDataOther"
        };

        var num = parseInt($(typeMap[thing["dcterms:type"]] + "Progress").attr("max")) + 1;
        $(typeMap[thing["dcterms:type"]] + "Progress").attr("max", num);
        $(typeMap[thing["dcterms:type"]] + "ProgressTextMax").text(num);
        if (EcRemote.async == false)
            repo2.saveTo(thing, function (success) {
                //console.log(thing.id);
                var num = parseInt($(typeMap[thing["dcterms:type"]] + "Progress").attr("value")) + 1;
                $(typeMap[thing["dcterms:type"]] + "Progress").attr("value", num);
                $(typeMap[thing["dcterms:type"]] + "ProgressText").text(num);
            }, function (error) {
                console.log(thing.id);
                console.log(error);
                var num = parseInt($(typeMap[thing["dcterms:type"]] + "Progress").attr("value")) + 1;
                $(typeMap[thing["dcterms:type"]] + "Progress").attr("value", num);
                $(typeMap[thing["dcterms:type"]] + "ProgressText").text(num);
            });
        else
            Task.asyncImmediate(function (con) {
                //if (EcRepository.getBlocking(thing.shortId()) == null)
                repo2.saveTo(thing, function (success) {
                    //console.log(thing.id);
                    var num = parseInt($(typeMap[thing["dcterms:type"]] + "Progress").attr("value")) + 1;
                    $(typeMap[thing["dcterms:type"]] + "Progress").attr("value", num);
                    $(typeMap[thing["dcterms:type"]] + "ProgressText").text(num);
                    con();
                }, function (error) {
                    console.log(thing.id);
                    console.log(error);
                    var num = parseInt($(typeMap[thing["dcterms:type"]] + "Progress").attr("value")) + 1;
                    $(typeMap[thing["dcterms:type"]] + "Progress").attr("value", num);
                    $(typeMap[thing["dcterms:type"]] + "ProgressText").text(num);
                    con();
                });
            });
    }

    repo.search("@type:Product", function (xa) {
        var f = new EcFramework();
        f.assignId(repo2.selectedServer, xa.getGuid() + "_TASKS_TLOS");
        f["ceasn:derivedFrom"] = xa.id;
        f["ceasn:codedNotation"] = xa.getGuid();
        f.name = xa.name[0].descr[0] + " Task, TLO, and Component Breakdown";
        var f1 = new EcFramework();
        f1.assignId(repo2.selectedServer, xa.getGuid() + "_TASKS");
        f1["ceasn:derivedFrom"] = xa.id;
        f1["ceasn:codedNotation"] = xa.getGuid();
        f1.name = xa.name[0].descr[0] + " Task and Component Breakdown";
        var f2 = EcFramework.getBlocking(repo2.selectedServer + "data/schema.cassproject.org.0.3.Framework/0a849142-f051-442e-b98b-fbb42e845d10");
        if (f2 == null) {
            f2 = new EcFramework();
            f2.assignId(repo2.selectedServer, "0a849142-f051-442e-b98b-fbb42e845d10");
            f2.name = "Military Occupations, Ratings, etc.";
        }
        var f3 = EcFramework.getBlocking(repo2.selectedServer + "data/schema.cassproject.org.0.3.Framework/0a849142-f051-442e-b98b-fbb42e845d11");
        if (f3 == null) {
            f3 = new EcFramework();
            f3.assignId(repo2.selectedServer, "0a849142-f051-442e-b98b-fbb42e845d11");
            f3.name = "Parts, Tools, and Equipment.";
        }
        EcRemote.async = false;
        var getBE = function (url) {
            EcRepository.get(url, function (beUsage) {
                EcRepository.get(beUsage.beRef[0], function (beRef) {
                    var c = competencyFromS3000L(beUsage);
                    f.addCompetency(c.shortId());
                    f1.addCompetency(c.shortId());
                    saveThing(c);
                    if (beUsage.reversebeChildRef != null && beUsage.reversebeChildRef.length > 0) {
                        for (var i = 0; i < beUsage.reversebeChildRef.length; i++) {
                            for (var j = 0; j < EcRepository.getBlocking(beUsage.reversebeChildRef[i]).reversebeChild.length; j++) {
                                var xbAlignment = new EcAlignment();
                                var parentBreakdownElement = EcRepository.getBlocking(EcRepository.getBlocking(beUsage.reversebeChildRef[i]).reversebeChild[j]);
                                var ctgt = competencyFromS3000L(parentBreakdownElement);
                                xbAlignment.assignId(repo2.selectedServer, c.getGuid() + "_" + Relation.NARROWS + "_" + ctgt.getGuid());
                                xbAlignment.relationType = Relation.NARROWS;
                                xbAlignment.source = c.shortId();
                                xbAlignment.target = ctgt.shortId();
                                f.addRelation(xbAlignment.shortId());
                                f1.addRelation(xbAlignment.shortId());
                                saveThing(xbAlignment);
                            }
                        }
                    }
                    var ary = [];
                    if (beRef.plndTask != null)
                        ary = ary.concat(beRef.plndTask);
                    if (beRef.supTask != null)
                        ary = ary.concat(beRef.supTask);
                    for (var i = 0; i < ary.length; i++) {
                        EcRepository.get(ary[i], function (plndTask) {
                            EcRepository.get(plndTask.taskRef[0], function (taskRef) {
                                EcRepository.get(taskRef.taskRev[0], function (taskRev) {
                                    var cx = competencyFromS3000L(taskRef);
                                    f.addCompetency(cx.shortId());
                                    f1.addCompetency(cx.shortId());
                                    saveThing(cx);
                                    try {
                                        EcRemote.getExpectingString("http://localhost:9722/api/custom/tloFromTaskS3000L?url=", taskRev.shortId(), function (tlo) {
                                            var lo = new EcCompetency();
                                            lo.assignId(repo2.selectedServer, taskRef.getGuid() + "_TLO");
                                            lo.name = tlo;
                                            lo["dcterms:type"] = "TLO";
                                            lo["ceasn:derivedFrom"] = taskRef.id;

                                            var xbAlignment = new EcAlignment();
                                            xbAlignment.assignId(repo2.selectedServer, lo.getGuid() + "_" + Relation.NARROWS + "_" + cx.getGuid());
                                            xbAlignment.relationType = Relation.NARROWS;
                                            xbAlignment.source = lo.shortId();
                                            xbAlignment.target = cx.shortId();
                                            f.addRelation(xbAlignment.shortId());
                                            saveThing(xbAlignment);

                                            f.addCompetency(lo.id);
                                            saveThing(lo);
                                        }, error);
                                    } catch (ex) {}
                                    var xbAlignment = new EcAlignment();
                                    xbAlignment.assignId(repo2.selectedServer, cx.getGuid() + "_" + Relation.NARROWS + "_" + c.getGuid());
                                    xbAlignment.relationType = Relation.NARROWS;
                                    xbAlignment.source = cx.shortId();
                                    xbAlignment.target = c.shortId();
                                    f.addRelation(xbAlignment.shortId());
                                    f1.addRelation(xbAlignment.shortId());
                                    saveThing(xbAlignment);
                                    if (taskRev.subtByDef != null)
                                        for (var j = 0; j < taskRev.subtByDef.length; j++) {
                                            EcRepository.get(taskRev.subtByDef[j], function (subtByDef) {
                                                var cxs = competencyFromS3000L(subtByDef);
                                                f.addCompetency(cxs.shortId());
                                                f1.addCompetency(cxs.shortId());
                                                saveThing(cxs);
                                                var xbAlignmenta = new EcAlignment();
                                                xbAlignmenta.assignId(repo2.selectedServer, cxs.getGuid() + "_" + Relation.NARROWS + "_" + cx.getGuid());
                                                xbAlignmenta.relationType = Relation.NARROWS;
                                                xbAlignmenta.source = cxs.shortId();
                                                xbAlignmenta.target = cx.shortId();
                                                f.addRelation(xbAlignmenta.shortId());
                                                f1.addRelation(xbAlignmenta.shortId());
                                                saveThing(xbAlignmenta);
                                            });
                                        }
                                }, console.error);
                            }, console.error);
                        }, console.error);
                    }
                }, console.error);
            }, console.error);
        }
        var bkdns = xa.bkdns[0].bkdn;
        if (bkdns != null)
            for (var i = 0; i < bkdns.length; i++) {
                EcRepository.get(bkdns[i], function (bkdn) {
                    if (bkdn.bkdnRev != null)
                        for (var j = 0; j < bkdn.bkdnRev.length; j++) {
                            EcRepository.get(bkdn.bkdnRev[j], function (bkdnRev) { //bkdnr
                                if (bkdnRev.beUsage != null)
                                    for (var k = 0; k < bkdnRev.beUsage.length; k++) {
                                        getBE(bkdnRev.beUsage[k]);
                                    }
                            }, console.error);
                        }
                }, console.error);
            }

        saveThing(f);
        saveThing(f1);
        saveThing(f2);
        saveThing(f3);
    }, function (eiacs) {

        $("#viewExpandedLinkedDataProductsFeedback").text(eiacs.length + " results found.")
    }, console.log);

    console.log("Searching for XA.");
    repo.search("@type:XA_end_item_acronym_code_data", function (xa) {
        var f = new EcFramework();
        f.assignId(repo2.selectedServer, xa.getGuid() + "_TASKS_TLOS");
        lookup["XA_" + xa.getGuid()] = f;
        f["ceasn:derivedFrom"] = xa.id;
        f["ceasn:codedNotation"] = xa.getGuid();
        f.name = xa.end_item_acronym_code + " Task, TLO, and Component Breakdown";
        var f1 = new EcFramework();
        f1.assignId(repo2.selectedServer, xa.getGuid() + "_TASKS");
        f1["ceasn:derivedFrom"] = xa.id;
        f1["ceasn:codedNotation"] = xa.getGuid();
        f1.name = xa.end_item_acronym_code + " Task and Component Breakdown";
        console.log(f.toJson());
        var f2 = EcFramework.getBlocking(repo2.selectedServer + "data/schema.cassproject.org.0.3.Framework/0a849142-f051-442e-b98b-fbb42e845d10");
        if (f2 == null) {
            f2 = new EcFramework();
            f2.assignId(repo2.selectedServer, "0a849142-f051-442e-b98b-fbb42e845d10");
            f2.name = "Military Occupations, Ratings, etc.";
        }
        var f3 = EcFramework.getBlocking(repo2.selectedServer + "data/schema.cassproject.org.0.3.Framework/0a849142-f051-442e-b98b-fbb42e845d11");
        if (f3 == null) {
            f3 = new EcFramework();
            f3.assignId(repo2.selectedServer, "0a849142-f051-442e-b98b-fbb42e845d11");
            f3.name = "Parts, Tools, and Equipment.";
        }
        repo.searchWithParams(
            "@type:XB_logistics_support_analysis_control_number_indentured_item_data AND end_item_acronym_code:" + xa.end_item_acronym_code, {
                size: 10000
            },
            function (xb) {
                var xbc = competencyFrom0007(xb);
                xbc["ceasn:codedNotation"] = xb.getGuid().replace(f.getGuid(), "").substring(1);
                f.addCompetency(xbc.id);
                f1.addCompetency(xbc.id);
                console.log("Added " + xbc.name);
                saveThing(xbc);
            },
            function (xbs) {
                for (var i = 0; i < xbs.length; i++) {
                    for (var j = 0; j < xbs.length; j++) {
                        var a = xbs[i];
                        var b = xbs[j];
                        if (a.id == b.id)
                            continue;
                        if (b.logistics_support_analysis_control_number.length == a.logistics_support_analysis_control_number.length - 2)
                            if (a.logistics_support_analysis_control_number.indexOf(b.logistics_support_analysis_control_number) != -1) {
                                var xbAlignment = new EcAlignment();
                                xbAlignment.assignId(repo2.selectedServer, a.getGuid() + "_" + Relation.NARROWS + "_" + b.getGuid());
                                xbAlignment.relationType = Relation.NARROWS;
                                xbAlignment.source = lookup["XB_" + a.getGuid()].shortId();
                                xbAlignment.target = lookup["XB_" + b.getGuid()].shortId();
                                f.addRelation(xbAlignment.shortId());
                                f1.addRelation(xbAlignment.shortId());
                                console.log(a.getGuid() + " narrows " + b.getGuid());
                                saveThing(xbAlignment);
                            }
                    }
                }
                repo.searchWithParams(
                    "@type:CA_task_requirement_data AND end_item_acronym_code:\"" + xa.end_item_acronym_code + "\"", {
                        size: 10000
                    },
                    function (ca) {
                        var cac = competencyFrom0007(ca);
                        f.addCompetency(cac.id);
                        f1.addCompetency(cac.id);

                        var xbc = lookup[("XB_" +
                            ca.end_item_acronym_code + "." +
                            ca.logistics_support_analysis_control_number + "." +
                            ca.alternate_logistics_support_analysis_control_number_code).replace(/ /g, "_")];
                        var xbAlignment = new EcAlignment();
                        xbAlignment.assignId(repo2.selectedServer, cac.getGuid() + "_" + Relation.NARROWS + "_" + xbc.getGuid());
                        xbAlignment.relationType = Relation.NARROWS;
                        xbAlignment.source = cac.shortId();
                        xbAlignment.target = xbc.shortId();
                        f.addRelation(xbAlignment.shortId());
                        f1.addRelation(xbAlignment.shortId());
                        console.log(cac.getGuid() + " narrows " + xbc.getGuid());
                        saveThing(xbAlignment);
                        cac["ceasn:codedNotation"] = cac.getGuid().substring(3).replace(xbc.getGuid().substring(3), "").substring(1);
                        saveThing(cac);

                        EcRemote.getExpectingString("http://localhost:9722/api/custom/tloFromCa?url=", ca.shortId(), function (tlo) {
                            var lo = new EcCompetency();
                            lo.assignId(repo2.selectedServer, cac.getGuid() + "_TLO");
                            lo.name = tlo;
                            lo["dcterms:type"] = "TLO";
                            lo["ceasn:derivedFrom"] = ca.id;

                            var xbAlignment = new EcAlignment();
                            xbAlignment.assignId(repo2.selectedServer, lo.getGuid() + "_" + Relation.NARROWS + "_" + cac.getGuid());
                            xbAlignment.relationType = Relation.NARROWS;
                            xbAlignment.source = lo.shortId();
                            xbAlignment.target = cac.shortId();
                            f.addRelation(xbAlignment.shortId());
                            saveThing(xbAlignment);
                            console.log(lo.getGuid() + " narrows " + cac.getGuid());

                            f.addCompetency(lo.id);
                            saveThing(lo);
                        }, error);
                    },
                    function (cas) {
                        repo.searchWithParams(
                            "@type:CB_subtask_requirement_data AND end_item_acronym_code:\"" + xa.end_item_acronym_code + "\"", {
                                size: 10000
                            },
                            function (cb) {
                                var cbc = competencyFrom0007(cb);
                                f.addCompetency(cbc.id);
                                f1.addCompetency(cbc.id);

                                var cac = lookup[("CA_" +
                                    cb.end_item_acronym_code + "." +
                                    cb.logistics_support_analysis_control_number + "." +
                                    cb.alternate_logistics_support_analysis_control_number_code + "." +
                                    cb.logistics_support_analysis_control_number_type + "." + cb.task_code).replace(/ /g, "_")];
                                var xbAlignment = new EcAlignment();
                                xbAlignment.assignId(repo2.selectedServer, cbc.getGuid() + "_" + Relation.NARROWS + "_" + cac.getGuid());
                                xbAlignment.relationType = Relation.NARROWS;
                                xbAlignment.source = cbc.shortId();
                                xbAlignment.target = cac.shortId();
                                f.addRelation(xbAlignment.shortId());
                                f1.addRelation(xbAlignment.shortId());
                                console.log(cbc.getGuid() + " narrows " + cac.getGuid());
                                saveThing(xbAlignment);
                                cbc["ceasn:codedNotation"] = cbc.getGuid().substring(3).replace(cac.getGuid().substring(3), "").substring(1);
                                saveThing(cbc);
                            },
                            function (cas) {
                                repo.searchWithParams(
                                    "@type:CD_subtask_personnel_requirement_data AND end_item_acronym_code:\"" + xa.end_item_acronym_code + "\"", {
                                        size: 10000
                                    },
                                    function (cd) {
                                        var cdc = competencyFrom0007(cd);
                                        if (cd.skill_specialty_code == null)
                                            return;
                                        delete cdc["ceasn:codedNotation"];
                                        cdc.assignId(repo2.selectedServer, "MOS_" + cd.skill_specialty_code);
                                        cdc.name = cd.skill_specialty_code;
                                        f2.addCompetency(cdc.id);

                                        var cbc = lookup[("CB_" +
                                            cd.end_item_acronym_code + "." +
                                            cd.logistics_support_analysis_control_number + "." +
                                            cd.alternate_logistics_support_analysis_control_number_code + "." +
                                            cd.logistics_support_analysis_control_number_type + "." + cd.task_code + "." + cd.subtask_number).replace(/ /g, "_")];
                                        var xbAlignment = new EcAlignment();
                                        xbAlignment.assignId(repo2.selectedServer, cbc.getGuid() + "_" + Relation.REQUIRES + "_" + cdc.getGuid());
                                        xbAlignment.relationType = Relation.REQUIRES;
                                        xbAlignment.source = cbc.shortId();
                                        xbAlignment.target = cdc.shortId();
                                        f.addRelation(xbAlignment.shortId());
                                        f1.addRelation(xbAlignment.shortId());
                                        console.log(cbc.getGuid() + " requires " + cdc.getGuid());
                                        saveThing(xbAlignment);
                                        saveThing(cdc);

                                        if (cd.new_or_modified_skill_specialty_code != null) {
                                            cdc = competencyFrom0007(cd);
                                            cdc.assignId(repo2.selectedServer, "MOS_" + cd.new_or_modified_skill_specialty_code);
                                            cdc.name = cd.new_or_modified_skill_specialty_code;
                                            f2.addCompetency(cdc.id);
                                            xbAlignment = new EcAlignment();
                                            xbAlignment.assignId(repo2.selectedServer, cbc.getGuid() + "_" + Relation.REQUIRES + "_" + cdc.getGuid());
                                            xbAlignment.relationType = Relation.REQUIRES;
                                            xbAlignment.source = cbc.shortId();
                                            xbAlignment.target = cdc.shortId();
                                            f.addRelation(xbAlignment.shortId());
                                            f1.addRelation(xbAlignment.shortId());
                                            console.log(cbc.getGuid() + " requires " + cdc.getGuid());
                                            saveThing(xbAlignment);
                                            saveThing(cdc);
                                        }
                                    },
                                    function (cas) {
                                        repo.searchWithParams(
                                            "@type:HA_item_identification_data", {
                                                size: 10000
                                            },
                                            function (ha) {},
                                            function (has) {
                                                repo.searchWithParams(
                                                    "@type:CG_task_support_equipment_data AND end_item_acronym_code:\"" + xa.end_item_acronym_code + "\"", {
                                                        size: 10000
                                                    },
                                                    function (cg) {
                                                        var cgc = competencyFrom0007(cg);
                                                        delete cgc["ceasn:codedNotation"];
                                                        cgc.assignId(repo2.selectedServer, "Familiarity_" + cg.task_support_commercial_and_government_entity_code.replace(/ /g, "_") + "." + cg.task_support_reference_number.replace(/ /g, "_"));
                                                        var ha = EcRepository.getBlocking(repo.selectedServer + "data/www.geia_STD_0007.com.2006.schema.HA_item_identification_data/" + cg.task_support_commercial_and_government_entity_code.replace(/ /g, "_") + "." + cg.task_support_reference_number.replace(/ /g, "_"));
                                                        cgc.name = ha.item_name;
                                                        f3.addCompetency(cgc.id);

                                                        var cac = lookup[("CA_" +
                                                            cg.end_item_acronym_code + "." +
                                                            cg.logistics_support_analysis_control_number + "." +
                                                            cg.alternate_logistics_support_analysis_control_number_code + "." +
                                                            cg.logistics_support_analysis_control_number_type + "." + cg.task_code).replace(/ /g, "_")];
                                                        var xbAlignment = new EcAlignment();
                                                        xbAlignment.assignId(repo2.selectedServer, cac.getGuid() + "_" + Relation.REQUIRES + "_" + cgc.getGuid());
                                                        xbAlignment.relationType = Relation.REQUIRES;
                                                        xbAlignment.source = cac.shortId();
                                                        xbAlignment.target = cgc.shortId();
                                                        f.addRelation(xbAlignment.shortId());
                                                        f1.addRelation(xbAlignment.shortId());
                                                        console.log(cac.getGuid() + " requires " + cgc.getGuid());
                                                        saveThing(xbAlignment);
                                                        saveThing(cgc);
                                                    },
                                                    function (cgs) {
                                                        f.competency.sort();
                                                        saveThing(f);
                                                        f1.competency.sort();
                                                        saveThing(f1);
                                                        saveThing(f2);
                                                        saveThing(f3);
                                                    }, error
                                                );
                                            }, error
                                        );
                                    }, error
                                );
                            }, error
                        )
                    }, error
                )
            }, error
        );
    }, function (results) {

    }, error);
});
