$(document).ready(function() {
    let testMode = false;  // front-end test flag
    let endPerformance = false;
    let settings = {};
    let testRecords = {}; // contains rest records and each one has the same data field with performance schema
    let performanceTestTimeout;
    let performanceTestInterval;
    const DURATION_TOLERANCE = 5; // max duration (seconds)
    const POST_LIMIT = 1000;
    const MS_TO_S = 1000; // millisecond to second conversion

    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });

    console.log(sessionStorage.getItem("user_role"))
    if (sessionStorage.getItem("user_role") == 'Citizen' || sessionStorage.getItem("user_role") == 'Coordinator'){
        window.location.href="/chatroom";
    }
    
    $(".container-fluid").click(function() {
        window.location.href="/chatroom";
    });

    $("#startTest").click(async function() {
        if(await getCurrentServerStatus() == 2) {
            return;
        }
        if(await !initiateAutomatedTest()){
            return;
        }
        if(await !changeServer2TestStatusSuccessfully()){
            return;
        }
        startAutomatedTest();
    });

    $("#stopTest").click(async function() {
        testMode = false;

        $("#post-result #result").show();
        $("#post-result #result").text(0);
        $("#post-result #load").hide();
        $("#get-result #result").show();
        $("#get-result #result").text(0);
        $("#get-result #load").hide();
    });

    let getCurrentServerStatus = async () => {
        let result = await $.ajax({
            type: "GET",
            url: "/performance/status/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") }
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
        });
        curServerStatus = result.data.status;
        return curServerStatus;
    }
    
    let changeServer2TestStatusSuccessfully = async () => {
        let result = await $.ajax({
            type: "POST",
            url: "/performance/status/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") }
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
        });

        if (result.data.status == 2){
            return true;
        }
        return false;
    }
    
    let changeServer2NormalStatus = async () => {
        await $.ajax({
            type: "DELETE",
            url: "/performance/status/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
        });
    }
    
    async function saveRecords() {
        await $.ajax({
            type: "POST",
            url: "/performance/records/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: testRecords
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
        });

        //TODO update latest records
    }

    let initiateAutomatedTest = () => {
        testMode = true;
        endPerformance = false;
        settings.duration = parseInt($("#duration").val()) * MS_TO_S;
        if (settings.duration > DURATION_TOLERANCE * MS_TO_S) {
            alert("Exceeds Max Test Duration Tolerance. Defaults Duration to " + DURATION_TOLERANCE);
            settings.duration = DURATION_TOLERANCE;
        }
        settings.interval = parseInt($("#interval").val());
        
        // post can't be over 1000;
        if (((settings.duration / settings.interval)/2).toFixed() > POST_LIMIT) {
            alert("Either Test Duration is long or interval is short. Exceeds POST Request Limit " + POST_LIMIT);
            return false;
        }
        settings.totalRequests = (settings.duration / settings.interval).toFixed();
        testRecords.postNum = 0;
        testRecords.postDuration = 0
        testRecords.postResNum = 0;
        testRecords.getNum = 0;
        testRecords.getDuration = 0;
        testRecords.getResNum = 0;
        return true;
    }

    let startAutomatedTest = () => {
        performanceTestInterval = setInterval(startPerformanceTest, settings.interval);
    }

    let startPerformanceTest = () => {
        if (testRecords.postNum > POST_LIMIT) {
            endPerformanceTest();
            alert("Either Test Duration is long or interval is short. Exceeds POST Request Limit " + POST_LIMIT);
            cleanTestDB();
        }
        else{
            $("#post-result #result").hide();
            $("#post-result #load").show();
            $("#get-result #result").hide();
            $("#get-result #load").show();
            if (testRecords.postNum < (settings.totalRequests/2).toFixed()) { //split in half for post & get request counts
                testRecords.postNum += 1;
                testPOSTPerformance();
            } else if(testRecords.getNum < (settings.totalRequests/2).toFixed()){
                testRecords.getNum += 1;
                testGETPerformance();
            }
        }
    }

    let testPOSTPerformance = async () => {
        let mockJsonObject = {
            name: "TestUser1",
            receiver: "TestUser2",
            readOrNot: false,
            status: "help",
            content: "fse sb1 mock message" // Test Payload Rule: Each message POST should be 20 characters long.
        }
        
        let startTime = Date.now().valueOf();
        await $.ajax({
            type: "POST",
            url: "/messages/1",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: mockJsonObject
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur during POST performance testing: " + error);
        });

        let endTime = Date.now().valueOf();
        testRecords.postResNum += 1;
        testRecords.postDuration += endTime - startTime;
        if(testRecords.postResNum + testRecords.getResNum == settings.totalRequests || (testMode == false && endPerformance == false)){
            endPerformanceTest();
        }
    }

    let testGETPerformance = async () => {
        let startTime = Date.now().valueOf();
        await $.ajax({
            type: "GET",
            url: "/messages/1",
            data: {testFlag: true,},
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur during GET performance testing: " + error);
        });

        let endTime = Date.now().valueOf();
        testRecords.getResNum += 1;
        testRecords.getDuration += endTime - startTime;
        if(testRecords.postResNum + testRecords.getResNum == settings.totalRequests || (testMode == false && endPerformance == false)){
            endPerformanceTest();
        }
    }

    let endPerformanceTest = () => {
        endPerformance = true;
        clearInterval(performanceTestInterval);
        generatePerformanceTestReport();
        cleanTestDB();
        changeServer2NormalStatus();
        saveRecords();
    }

    let cleanTestDB = async () => {
        await $.ajax({
            type: "DELETE",
            url: "/performance/db/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
        });
    }

    let generatePerformanceTestReport = () => {
        testRecords.postNumPerSec =  parseInt(testRecords.postResNum * MS_TO_S / testRecords.postDuration);
        testRecords.getNumPerSec = parseInt(testRecords.getResNum * MS_TO_S / testRecords.getDuration);

        // $("#performance-result").append(`<div>POST per second is ${testRecords.postNumPerSec}</div>`);
        // $("#performance-result").append(`<div>Get per second is ${testRecords.getNumPerSec}</div>`);

        $("#post-result #result").show();
        $("#post-result #load").hide();
        $("#get-result #result").show();
        $("#get-result #load").hide();

        $("#post-result #result").text(testRecords.postNumPerSec);
        $("#get-result #result").text(testRecords.getNumPerSec);
    }

});


