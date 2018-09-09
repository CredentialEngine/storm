EcRepository.caching = true;
$("#exportS1000D").click(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    EcFramework.search(repo, "*", function (eiacs) {
        for (var i = 0; i < eiacs.length; i++) {
            var eiac = eiacs[i];

            var option = $("#exportS1000DSelect").append("<option/>").children().last();
            option.attr("value", eiac.id);
            option.text(eiac["name"]);
        }
        $("#exportS1000DFeedback").text(eiacs.length + " results found.")
    }, console.log);
});

$("#exportS1000DSelect").change(function (evt) {
    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();

    var frameworkId = $("#exportS1000DSelect :selected").attr("value");
    var f = EcFramework.get(frameworkId, function (f) {
        var ary = [];
        ary = ary.concat(f.competency);
        ary = ary.concat(f.relation);
        repo.precache(ary, function (results) {
            $("#exportS1000DSelectOutput").html("");
            var option =
                $("#exportS1000DSelectOutput").append("<option/>").children().last();
            option.attr("value", exportLearning(f));
            option.text("Learning.xml");
            option = $("#exportS1000DSelectOutput").append("<option/>").children().last();
            option.attr("value", exportSCP(f));
            option.text("Scorm Content Package.xml");
            for (var competencyId in f.competency) {
                var c = EcCompetency.getBlocking(f.competency[competencyId]);
                if (c["dcterms:type"] != "TLO")
                    continue;
                option = $("#exportS1000DSelectOutput").append("<option/>").children().last();
                option.attr("value", exportSco(c));
                option.text(c.getGuid() + ".xml");
            }
        });
    }, console.error);
});

$("#exportS1000DSelectOutput").change(function (evt) {
    $("#exportS1000DIframe").text($("#exportS1000DSelectOutput :selected").attr("value"));

});

function exportSco(c) {
    var xml = "";
    xml += '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE scormContentPackage>\n';
    xml += '<scoContent xmlns:dc="http://www.purl.org/dc/elements/1.1/"\n';
    xml += '	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
    xml += '	xmlns:lom="http://ltsc.ieee.org/xsd/LOM"\n';
    xml += '	xmlns:xlink="http://www.w3.org/1999/xlink"\n';
    xml += '	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '	xsi:noNamespaceSchemaLocation="http://www.s1000d.org/S1000D_4-2/xml_schema_flat/scocontent.xsd">\n';
    xml += '	<contentDescription>\n';
    xml += '		<simplePara>' + c.getName() + '</simplePara>\n';
    xml += '	</contentDescription>\n';
    xml += '	<trainingStep>\n';
    xml += '		<contentDescription>\n';
    xml += '			<simplePara>' + c.getName() + '</simplePara>\n';
    xml += '		</contentDescription>\n';
    xml += '		<dmRef>\n';
    xml += '			<dmRefIdent>\n';
    xml += '				<dmCode modelIdentCode="00" systemDiffCode="0" systemCode="850" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="0" infoCode="000" infoCodeVariant="0" itemLocationCode="T"></dmCode>\n';
    xml += '			</dmRefIdent>\n';
    xml += '		</dmRef>\n';
    xml += '	</trainingStep>\n';
    xml += '</scoContent>\n';
    return xml.replace(/&/g, "&amp;");;
}

function exportLearning(f) {
    var xml = "";
    xml += '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE scormContentPackage>\n';
    xml += '<learning xmlns:dc="http://www.purl.org/dc/elements/1.1/"\n';
    xml += '	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
    xml += '	xmlns:lom="http://ltsc.ieee.org/xsd/LOM"\n';
    xml += '	xmlns:xlink="http://www.w3.org/1999/xlink"\n';
    xml += '	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '	xsi:noNamespaceSchemaLocation="http://www.s1000d.org/S1000D_4-2/xml_schema_flat/learning.xsd">\n';
    xml += '	<learningPlan>\n';
    xml += '		<lcInterventionDefinition>\n';
    xml += '			<lcLearningObjectives>\n';
    xml += '				<lcObjectiveItemGroup>\n';
    xml += '					<title>TLOs</title>\n';

    for (var competencyId in f.competency) {
        var c = EcCompetency.getBlocking(f.competency[competencyId]);
        if (c["dcterms:type"] == "TLO") {
            xml += '					<lcObjectiveItem>\n';
            xml += '						<title>' + c.getName() + '</title>\n';
            if (c.getDescription() != null) {
                xml += '						<description>\n';
                xml += '							<para>' + c.getDescription() + '</para>\n';
                xml += '						</description>\n';
            }
            //  xml += '						<lcObjectiveItemGroup>';
            //  xml += '							<title>ELOs</title>';
            //  xml += '							<lcObjectiveItem>';
            //  xml += '								<title>$ceasn:competencyText</title>';
            //  xml += '								<description>';
            //  xml += '									<para>$ceasn:comment</para>';
            //  xml += '								</description>';
            //  xml += '							</lcObjectiveItem>';
            //  xml += '						</lcObjectiveItemGroup>';
            xml += '					</lcObjectiveItem>\n';
        }
    }
    xml += '				</lcObjectiveItemGroup>\n';
    xml += '			</lcLearningObjectives>\n';
    xml += '		</lcInterventionDefinition>\n';
    xml += '	</learningPlan>\n';
    xml += '</learning>\n';
    return xml.replace(/&/g, "&amp;");;
}

function exportSCP(f) {
    var xml = "";
    xml += '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE scormContentPackage>\n';
    xml += '<scormContentPackage xmlns:dc="http://www.purl.org/dc/elements/1.1/"\n';
    xml += '	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
    xml += '	xmlns:lom="http://ltsc.ieee.org/xsd/LOM"\n';
    xml += '	xmlns:xlink="http://www.w3.org/1999/xlink"\n';
    xml += '	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '	xsi:noNamespaceSchemaLocation="http://www.s1000d.org/S1000D_4-2/xml_schema_flat/scormcontentpackage.xsd">\n';
    xml += "	<identAndStatusSection>\n";
    xml += "		<scormContentPackageAddress>\n";
    xml += "			<scormContentPackageIdent>\n";
    xml += '				<scormContentPackageCode modelIdentCode="' + f.getName().replace(/ /g, "").substring(0, 14) + '" scormContentPackageIssuer="00000" scormContentPackageNumber="00000" scormContentPackageVolume="00"></scormContentPackageCode>\n';
    xml += '				<language languageIsoCode="en" countryIsoCode="US"></language>\n';
    xml += '				<issueInfo issueNumber="000" inWork="00"></issueInfo>\n';
    xml += "			</scormContentPackageIdent>\n";
    xml += "			<scormContentPackageAddressItems>\n";
    xml += '				<issueDate year="2018" month="08" day="25"></issueDate>\n';
    xml += "				<scormContentPackageTitle></scormContentPackageTitle>\n";
    xml += "			</scormContentPackageAddressItems>\n";
    xml += "		</scormContentPackageAddress>\n";
    xml += "		<scormContentPackageStatus>\n";
    xml += '			<security securityClassification="01"></security>\n';
    xml += "			<responsiblePartnerCompany></responsiblePartnerCompany>\n";
    xml += "			<brexDmRef>\n";
    xml += "				<dmRef>\n";
    xml += "					<dmRefIdent>\n";
    xml += '						<dmCode modelIdentCode="00" systemDiffCode="0" systemCode="850" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="0" infoCode="000" infoCodeVariant="0" itemLocationCode="T"></dmCode>\n';
    xml += "					</dmRefIdent>\n";
    xml += "				</dmRef>\n";
    xml += "			</brexDmRef>\n";
    xml += "			<qualityAssurance>\n";
    xml += "				<unverified></unverified>\n";
    xml += "			</qualityAssurance>\n";
    xml += '			<personSkill skillLevelCode="sk01"></personSkill>\n';
    xml += "		</scormContentPackageStatus>\n";
    xml += "		<lom:lom>\n";
    xml += "			<lom:general>\n";
    xml += "				<lom:title>\n";
    xml += "					<lom:string>" + f.getName() + "</lom:string>\n";
    xml += "				</lom:title>\n";
    if (f.getDescription() != null) {
        xml += "				<lom:description>\n";
        xml += "					<lom:string>" + f.getDescription() + "</lom:string>\n";
        xml += "				</lom:description>\n";
    }
    xml += "				<lom:language>EN-US</lom:language>\n";
    xml += "			</lom:general>\n";
    xml += "			<lom:lifeCycle>\n";
    if (f["schema:publisher"] !== undefined && f["schema:publisher"] != null) {
        xml += "				<lom:contribute>\n";
        xml += "					<lom:entity>" + f["schema:publisher"] + "</lom:entity>\n";
        xml += "					<lom:role>\n";
        xml += "						<lom:value>publisher</lom:value>\n";
        xml += "					</lom:role>\n";
        xml += "				</lom:contribute>\n";
    }
    if (f["schema:creator"] !== undefined && f["schema:creator"] != null) {
        xml += "				<lom:contribute>\n";
        xml += "					<lom:entity>" + f["schema:creator"][0] + "</lom:entity>\n";
        xml += "					<lom:role>\n";
        xml += "						<lom:value>author</lom:value>\n";
        xml += "					</lom:role>\n";
        xml += "				</lom:contribute>\n";
    }
    xml += "			</lom:lifeCycle>\n";
    xml += "			<lom:annotation>\n";
    xml += "				<lom:date>\n";
    if (f["schema:dateCreated"] !== undefined && f["schema:dateCreated"] != null)
        xml += "					<lom:dateTime>" + f["schema:dateCreated"] + "</lom:dateTime>\n";
    else
        xml += "					<lom:dateTime>" + new Date().toISOString() + "</lom:dateTime>\n";
    xml += "				</lom:date>\n";
    xml += "			</lom:annotation>\n";
    xml += "		</lom:lom>\n";
    xml += "	</identAndStatusSection>\n";
    xml += "	<content>\n";
    var flat = {};
    var tree = {};
    for (var competencyId in f.competency) {
        flat[f.competency[competencyId]] = tree[f.competency[competencyId]] = {};
    }
    for (var relationId in f.relation) {
        var r = EcAlignment.getBlocking(f.relation[relationId]);
        if (r.relationType == "narrows") {
            delete tree[r.source];
            flat[r.target][r.source] = flat[r.source];
        }
    }
    for (var key in tree) {
        xml += exportSCPTree(key, flat[key], flat);
    }
    xml += "	</content>\n";
    xml += "</scormContentPackage>\n";
    xml = xml.replace(/&/g, "&amp;");
    console.log(xml);
    return xml;
}

var exportSCPTree = function (cId, c, flat, omitEntry) {
    var competency = EcCompetency.getBlocking(cId);
    var xml = "";
    if (omitEntry != true)
        xml += "		<scoEntry>\n";
    //    xml += "			<scoEntryTitle>$ceasn:competencyCategory</scoEntryTitle>\n";
    xml += "			<scoEntryItem>\n";
    xml += "				<lom:lom>\n";
    xml += "					<lom:general>\n";
    if (competency.getName() != null) {
        xml += "						<lom:title>\n";
        xml += "							<lom:string>" + competency.getName() + "</lom:string>\n";
        xml += "						</lom:title>\n";
    }
    if (competency.getDescription() != null) {
        xml += "						<lom:description>\n";
        xml += "							<lom:string>" + competency.getDescription() + "</lom:string>\n";
        xml += "						</lom:description>\n";
    }
    xml += "						<lom:language>EN-US</lom:language>\n";
    xml += "					</lom:general>\n";
    xml += "				</lom:lom>\n";
    xml += "				<dmRef>\n";
    xml += "					<dmRefIdent>\n";
    xml += '						<dmCode modelIdentCode="00" systemDiffCode="0" systemCode="850" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="0" infoCode="000" infoCodeVariant="0" itemLocationCode="T"></dmCode>\n';
    xml += "					</dmRefIdent>\n";
    xml += "				</dmRef>\n";
    if (EcObject.keys(c).length != 0)
        xml += "				<scoEntry>\n";
    for (var k in c) {
        xml += exportSCPTree(k, flat[k], flat, true);
    }
    if (EcObject.keys(c).length != 0)
        xml += "				</scoEntry>\n";
    xml += "			</scoEntryItem>\n";
    if (omitEntry != true)
        xml += "		</scoEntry>\n";
    return xml;
}
