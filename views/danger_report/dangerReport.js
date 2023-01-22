$(document).ready(function() {
    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });
    let editReportMode = false;
    let editReportCard;
    loadAllDangerReports();

    $("#back-esn").click(function(){
        window.location.href = "/chatroom";
    });

    $('#report-send-btn').click(function () {
        let title = $('#report-title').val();
        let zipcode = $('#report-zipcode').val();
        let dangerItems = $('#dangerous-items-selection').val();
        let description = $('#report-description').val();
        if (!validateReportInput(title, zipcode, dangerItems)) {
            $('#report-modal').modal('hide');
            return;
        }
        let newReport = {
            title: title,
            zipcode: zipcode,
            dangerItems: dangerItems,
            description: description
        }
        if (editReportMode) {
            editReportCard.updateReport(newReport);
            editReportMode = false;
        } else {
            createNewDangerReport(newReport);
        }
    });

    $('#report-modal').on('hidden.bs.modal', function () {
        $('#report-form').trigger('reset');
    })

    socket.on('new report', function (newReportJSON) {
        let newReport = JSON.parse(newReportJSON);
        let newReportCard = new DangerReportCard(newReport, editDangerReportHandler);
        dangerReportMap.set(newReport.id, newReportCard);
        $('#reports').prepend(newReportCard);
    });

    socket.on('update report', function (updatedFieldsJSON) {
        let updatedReport = JSON.parse(updatedFieldsJSON);
        let reportCard = dangerReportMap.get(updatedReport.reportId);
        reportCard.updateReportFields(updatedReport.updatedFields);
    });

    socket.on('delete report', function (json) {
        let reportId = JSON.parse(json).reportId
        let reportCard = dangerReportMap.get(reportId);
        dangerReportMap.delete(reportId);
        reportCard.remove();
    });

    socket.on('new report comment', function (newReportCommentJSON) {
        let newComment = JSON.parse(newReportCommentJSON);
        let reportCard = dangerReportMap.get(newComment.dangerReportId);
        reportCard.appendNewComment(newComment);
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    function validateReportInput(title, zipcode, dangerItems) {
        let errMsg = ""
        if (title.length === 0) {
            errMsg += "Title is required\n";
        }
        if (zipcode.length !== 5) {
            errMsg += "Zipcode length has to be 5\n";
        }
        if (dangerItems.length === 0) {
            errMsg += "Must have at least one danger item\n";
        }
        if (errMsg.length === 0) {
            return true;
        } else {
            alert(errMsg);
            return false;
        }
    }

    function editDangerReportHandler(report) {
        editReportMode = true;
        editReportCard = dangerReportMap.get(report.id);
        $('#report-title').val(report.title);
        $('#report-zipcode').val(report.zipcode);
        $('#dangerous-items-selection').val(report.dangerItems);
        $('#report-description').val(report.description);
        $('#report-modal').modal('toggle');
    }

    function createNewDangerReport(newReport) {
        $.ajax({
            type: "POST",
            url: "/dangerReports",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: newReport,
            success: function(result){
                console.log(result);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when creating a new danger report: " + error);
        });
    }

    let dangerReportMap = new Map();
    function populateDangerReports(allDangerReports) {
        allDangerReports.forEach(report => {
            let dangerReportCard = new DangerReportCard(report, editDangerReportHandler);
            dangerReportMap.set(report.id, dangerReportCard);
            $('#reports').prepend(dangerReportCard);
        })
    }

    function loadAllDangerReports() {
        $.ajax({
            type: "GET",
            url: "/dangerReports",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                console.log(result);
                let allDangerReports = JSON.parse(result);
                populateDangerReports(allDangerReports);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when get danger reports: " + error);
        });
    }
});
