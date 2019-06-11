$("#expandProductDataButton").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();


    EcRepository.caching = true;
    EcRepository.cachingSearch = true;
    EcRemote.async = false;
    var saveThing = function (thing) {
        Task.asyncImmediate(function (con) {
            if (repo.selectedServer == "http://nowhere/") {
                var val = parseInt($("#saveTasksProgress").attr("value")) + 1;
                $("#saveTasksProgress").attr("value", val);
                $("#saveTasksProgressText").text(val);
                setTimeout(con, 30);
            } else
                repo.saveTo(thing, function (success) {
                    console.log(thing.id);

                    var val = parseInt($("#saveTasksProgress").attr("value")) + 1;
                    $("#saveTasksProgress").attr("value", val);
                    $("#saveTasksProgressText").text(val);

                    con();
                }, function (error) {
                    console.log(thing.id);
                    console.log(error);

                    var val = parseInt($("#saveTasksProgress").attr("value")) + 1;
                    $("#saveTasksProgress").attr("value", val);
                    $("#saveTasksProgressText").text(val);

                    con();
                });
        });
    }

    var toSave = {};

    var searchForFramework = function (xa, ca, field, i) {
        if (i == null)
            var search = '@type:ConceptScheme AND meta\\:forProperty:' + field + '_Type';
        else
            var search = '@type:ConceptScheme AND meta\\:geiaCodePositionIndex:' + i + ' AND meta\\:forProperty:' + field + '_Type';
        console.log(search);

        repo.searchWithParams(
            search, {
                size: 10000
            },
            function (framework) {
                searchForCode(xa, ca, field, i, framework);
            }, null, console.error);
    }

    var searchForCode = function (xa, ca, field, h, framework) {
        var search;
        if (h == null)
            h = 0;
        search = '@type:Concept AND skos\\:topConceptOf:"' + framework.shortId() + '" AND meta\\:forProperty:' + field + '_Type AND ceasn\\:codedNotation:' + ca[field][h];
        console.log(search);

        repo.searchWithParams(
            search, {
                size: 10000
            },
            function (output) {
                console.log(field, 0, ca[field][h], output);
                if (ca["" + field + "_descriptors"] == null)
                    ca["" + field + "_descriptors"] = [];
                if (output["skos:definition"] != null && output["skos:prefLabel"] != null)
                    ca["" + field + "_descriptors"].push((output["skos:prefLabel"] + ": " + output["skos:definition"]["en-us"]).trim());
                else if (output["skos:definition"] != null)
                    ca["" + field + "_descriptors"].push((output["skos:definition"]["en-us"]).trim());
                else if (output["skos:prefLabel"] != null)
                    ca["" + field + "_descriptors"].push(output["skos:prefLabel"]);
                toSave[ca.id] = ca;
            }, null, console.error);
    }

    var searchCode = function (xa, ca, field) {
        if (ca[field] != null)
            for (var i = 0; i < ca[field].length; i++) {
                if (ca[field].length == 1)
                    searchForFramework(xa, ca, field, null);
                else
                    searchForFramework(xa, ca, field, i);
            }
    }

    console.log("Searching for XA.");
    repo.search("@type:XA_end_item_acronym_code_data", function (xa) {
        console.log("Searching for CA.");
        repo.searchWithParams(
            "@type:CA_task_requirement_data AND end_item_acronym_code:" + xa.end_item_acronym_code, {
                size: 10000
            },
            function (ca) {},
            function (cas) {
                var val = parseInt($("#expandTasksProgress").attr("max")) + cas.length;
                $("#expandTasksProgress").attr("max", val);
                $("#expandTasksProgressTextMax").text(val);
            }, console.error);
        repo.searchWithParams(
            "@type:CA_task_requirement_data AND end_item_acronym_code:" + xa.end_item_acronym_code, {
                size: 10000
            },
            function (ca) {
                console.log("Searching fields.");

                var val = parseInt($("#expandTasksProgress").attr("value")) + 1;
                $("#expandTasksProgress").attr("value", val);
                $("#expandTasksProgressText").text(val);

                searchCode(xa, ca, "task_code");
                searchCode(xa, ca, "tool_support_equipment_requirement_code");
                searchCode(xa, ca, "task_annual_operating_requirement_measurement_base");
                searchCode(xa, ca, "primary_means_of_detection");
                searchCode(xa, ca, "logistics_support_analysis_control_number_type");
                searchCode(xa, ca, "hazardous_maintenance_procedure_code");
                searchCode(xa, ca, "hardness_critical_procedure_code");
                searchCode(xa, ca, "facility_requirement_code");
                searchCode(xa, ca, "annual_operating_requirement_logistics_support_analysis_control_number_type");

                var val = parseInt($("#saveTasksProgress").attr("max")) + 1;
                $("#saveTasksProgress").attr("max", val);
                $("#saveTasksProgressTextMax").text(val);
            }, null, console.error);
    }, null, console.error);

    EcRemote.async = true;

    for (id in toSave) {
        saveThing(toSave[id]);
    }

});
