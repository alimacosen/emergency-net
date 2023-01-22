$(document).ready(function() {
    let shelterPosts = []; // all the posts in shelter directory
    let myShelterPosts = [];  // posts I published
    let thisPost = {};  // selected post
    let thisRequest;
    let Requests4ThisPost = [];
    let myRequests = [];  // requests I published
    let userName;

    // *************** POST HTTP FUNCTIONS *******************
    // create ONE post
    let createPost = (post) => {
        $.ajax({
            type: "post",
            url: "/shelters/newpost",
            data: post,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                // let jsonObj = JSON.parse(result);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    $("#back-esn").click(function(){
        window.location.href="/chatroom";
    });

    let getAllPosts = () => {
        $.ajax({
            type: "get",
            url: "/shelters/post",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                let jsonObj = JSON.parse(result);
                shelterPosts = jsonObj.data;
                composeAllPosts(shelterPosts);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let getMyPosts = (userID) => {
        let jsonObj = {
            senderId: userID
        };
        $.ajax({
            type: "get",
            url: "/shelters/post",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: jsonObj,
            success: function(result) {
                let jsonObj = JSON.parse(result);
                myShelterPosts = jsonObj.data;
                composeMyPosts(myShelterPosts);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let getThisPost = (postID) => {
        let jsonObj = {
            postID: postID
        };
        $.ajax({
            type: "get",
            url: "/shelters/post",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            async: false,
            data: jsonObj,
            success: function(result) {
                let jsonObj = JSON.parse(result);
                thisPost = jsonObj.data;
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let updatePost = (postID, newPostField) => {
        let jsonObj = {
            postID: postID,
            newPostField: newPostField,
        }
        $.ajax({
            type: "post",
            url: "/shelters/post",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                // let jsonObj = JSON.parse(result);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let deletePost = (postID) => {
        let jsonObj = {
            postID: postID,
        };
        $.ajax({
            type: "delete",
            url: "/shelters/post",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                // let jsonObj = JSON.parse(result);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let getMyUserName = () => {
        $.ajax({
            type: "GET",
            url: "/users/"+sessionStorage.getItem("user_id"),
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let jsonObj = JSON.parse(result);
                userName = jsonObj.username;
            }
        }).fail(function(jqXHR, textStatus, error) {
            window.location.href="/chatroom";
        });
    }

    // *************** REQUEST HTTP FUNCTIONS *******************
    let createRequest = (request) => {
        $.ajax({
            type: "post",
            url: "/shelters/newrequest",
            data: request,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                // let jsonObj = JSON.parse(result);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let getAllMyRequest = (filter) => {
        let jsonObj = {
            filter: filter,
        }
        $.ajax({
            type: "get",
            url: "/shelters/request",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                let jsonObj = JSON.parse(result);
                myRequests = jsonObj.data;
                composeMyRequests(myRequests);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let getThisRequest = (filter) => {
        let jsonObj = {
            filter: filter,
        }
        $.ajax({
            type: "get",
            url: "/shelters/request",
            data: jsonObj,
            async: false,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                let jsonObj = JSON.parse(result);
                thisRequest = jsonObj.data;
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let getThisPostRequests = (filter) => {
        let jsonObj = {
            filter: filter,
        }
        $.ajax({
            type: "get",
            url: "/shelters/request",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                let jsonObj = JSON.parse(result);
                Requests4ThisPost = jsonObj.data;
                composeThisPostRequests(Requests4ThisPost);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let updateRequest = (requestID, newRequestField) => {
        let jsonObj = {
            requestID: requestID,
            newRequestField: newRequestField,
        }
        $.ajax({
            type: "post",
            url: "/shelters/request",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
                let jsonObj = JSON.parse(result);
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }

    let deleteRequest = (requestID) => {
        let jsonObj = {
            requestID: requestID,
        };
        $.ajax({
            type: "delete",
            url: "/shelters/request",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result) {
            }
        }).fail(function(jqXHR, textStatus, error) {

        });
    }


    // ******************* OTHER FUNCTIONS **********************
    let composeThisPostRequests = (Requests4ThisPost) => {
        $("#requests-list").empty();
        for (let i = 0; i < Requests4ThisPost.length; i++) {
            let composedRequest = composeRequest(Requests4ThisPost[i]);
            $("#requests-list").append(composedRequest);
        }
    }

    let helpFunc1 = (post) => {
        // postID
        $("#postIDDetail").text(post.postID);
        $("#postIDDetail").hide();
        // sender
        $("#shelterProviderDetail").text(post.sender);
        let updatedTime = post.postUpdateDate.substring(0, 10) + " " + post.postUpdateDate.substring(12, 19)
        $("#shelterUpdateDateDetail").text(updatedTime);
        $("#shelterRoomLeftDetail").text(post.availableRoomNum);
        $("#shelterAddressDetail").val(post.shelterAddress);
        $("#shelterDescriptionDetail").val(post.description);

        // compose room info
        $("#room-info-list").empty();
    }

    let composeMyPostDetail = (post) => {
        $("#RequestShelterModalLabel").text("My Post");

        $("#updatePost").show();
        $("#submitRequest").hide();

        $("#shelterAddressDetail").attr("readonly",true);
        $("#shelterDescriptionDetail").attr("readonly",true);

        $("#editPost-btn").show();
        $("#editPost-btn").click(function(){
            $("#shelterAddressDetail").attr("readonly",false);
            $("#shelterDescriptionDetail").attr("readonly",false);
        });
        $("#deletePost-btn").show();
        $("#deletePost-btn").click(function(){
            deletePost(post.postID);
            $("#publishedPostModal").modal('hide');
            return;
        });
        // //postID
        // $("#postIDDetail").text(post.postID);
        // $("#postIDDetail").hide();
        // // sender
        // $("#shelterProviderDetail").text(post.sender);
        // let updatedTime = post.postUpdateDate.substring(0, 10) + " " + post.postUpdateDate.substring(12, 19)
        // $("#shelterUpdateDateDetail").text(updatedTime);
        // $("#shelterRoomLeftDetail").text(post.availableRoomNum);
        // $("#shelterAddressDetail").val(post.shelterAddress);
        // $("#shelterDescriptionDetail").val(post.description);
        helpFunc1(post);

        // compose room info
        $("#room-info-list").empty();
        for (let i = 0; i < post.roomInfo.length; i++) {
            let availableDateBegin = post.roomInfo[i].availableDateBegin.substring(0,10);
            let availableDateEnd = post.roomInfo[i].availableDateEnd.substring(0,10);
            let element = `<div class="form-check">
                                <label class="form-check-label" for="flexRadioDefault${i+1}">Room ${i+1}: &nbsp;&nbsp;</label>
                                <label class="form-check-label" for="flexCheckDefault${i+1}">${availableDateBegin}&nbsp; To &nbsp;${availableDateEnd}</label>

                            </div>`;
            $("#room-info-list").append(element);
        }
        $("#numOfPeople1").hide();
        $("#shelterRequestDescription-0").hide();
        $("#bookRange").hide();
        $("#requests-list").show();
        getThisPostRequests({postID: post.postID});

    }

    let composeOtherPostDetail = (post) => {
        $("#RequestShelterModalLabel").text("Request Shelter");

        $("#editPost-btn").hide();
        $("#deletePost-btn").hide();
        $("#updatePost").hide();
        $("#submitRequest").show();

        // // postID
        // $("#postIDDetail").text(post.postID);
        // $("#postIDDetail").hide();
        // // sender
        // $("#shelterProviderDetail").text(post.sender);
        // let updatedTime = post.postUpdateDate.substring(0, 10) + " " + post.postUpdateDate.substring(12, 19)
        // $("#shelterUpdateDateDetail").text(updatedTime);
        // $("#shelterRoomLeftDetail").text(post.availableRoomNum);
        // $("#shelterAddressDetail").val(post.shelterAddress);
        // $("#shelterDescriptionDetail").val(post.description);
        //
        // // compose room info
        // $("#room-info-list").empty();
        helpFunc1(post);
        for (let i = 0; i < post.roomInfo.length; i++) {
            if (post.roomInfo[i].assigned) {
                continue;
            }
            let availableDateBegin = post.roomInfo[i].availableDateBegin.substring(0,10);
            let availableDateEnd = post.roomInfo[i].availableDateEnd.substring(0,10);
            let roomID = post.roomInfo[i].roomID;
            let element = `<div class="form-check">
                                <input class="form-check-input" type="checkbox" value=${roomID} id="flexCheckDefault${i+1}">
                                <label class="form-check-label" for="flexRadioDefault${i+1}">Room ${i+1}: &nbsp;&nbsp;</label>
                                <label class="form-check-label" for="flexCheckDefault${i+1}">${availableDateBegin}&nbsp;&nbsp; To ${availableDateEnd}</label>

                            </div>`;
            $("#room-info-list").append(element);
        }
        $("#numOfPeople1").show();
        $("#shelterRequestDescription-0").show();
        $("#bookRange").show();
        $("#requests-list").hide();
    }

    let showPostDetail = (post) => {
        console.log("click callback: ", post);
        if (post.senderId !== sessionStorage.getItem("user_id")) {
            composeOtherPostDetail(post);
            $("#publishedPostModal").modal('show');
        } else {
            composeMyPostDetail(post);
            $("#publishedPostModal").modal('show');
        }
    }

    let helpFunc2 = (request) => {
        $("#requestIDDetail").text(request.requestID);
        $("#requestIDDetail").hide();

        $("#requestShelterProviderDetail").text(request.senderName);

        let updatedTime = request.requestUpdateDate.substring(0, 10) + " " + request.requestUpdateDate.substring(12, 19)
        $("#requestUpdateDateDetail").text(updatedTime);

        getThisPost(request.postID);

        // requested rooms
        $("#requestedRoomInfoContainer").empty();
        for (let i = 0; i < request.roomIDs.length; i++) {
            let roomID = request.roomIDs[i].roomID;
            let element = `<label class="form-check-label" id="requestedRoomInfo${i+1}">${roomID}</label>`
            $("#requestedRoomInfoContainer").append(element);
        }

        $("#requestShelterAddressDetail").val(thisPost[0].shelterAddress);
        $("#requestShelterDescriptionDetail").val(thisPost[0].description);
        $("#numOfPeople2-1").val(request.totalPeople);
        $("#conditionDescription").val(request.description);
        if (request.approved) {
            $("#requestApprovedStatusDetail").text("Approved");
        } else {
            $("#requestApprovedStatusDetail").text("Not Approved");
        }
        let availableDateBegin = request.BookDateBegin.substring(0,10);
        let availableDateEnd = request.BookDateEnd.substring(0,10);
        $("#bookDateRange").text(availableDateBegin + " To " + availableDateEnd);
    }

    let composeMyRequestDetail = (request) => {
        //TODO
        $("#requestShelterAddressDetail").attr("readonly",true);
        $("#requestShelterDescriptionDetail").attr("readonly",true);
        $("#numOfPeople2-1").attr("readonly",true);
        $("#conditionDescription").attr("readonly",true);


        $("#TheRequestModalLabel").text("My Request");
        $("#request-editRequest-btn").show()
        $("#request-deleteRequest-btn").show()
        $("#updateRequest").show();
        $("#approveRequest").hide();


        helpFunc2(request);
    }

    let composeOthersRequestDetail = (request) => {
        //TODO
        $("#requestShelterAddressDetail").attr("readonly",true);
        $("#requestShelterDescriptionDetail").attr("readonly",true);
        $("#numOfPeople2-1").attr("readonly",true);
        $("#conditionDescription").attr("readonly",true);

        $("#TheRequestModalLabel").text("Other's Request");
        $("#request-editRequest-btn").hide();
        $("#request-deleteRequest-btn").hide();
        $("#updateRequest").hide();
        $("#approveRequest").show();

        helpFunc2(request);
    }

    let showRequestDetail = (request) => {
        console.log("click callback: ", request);
        if (request.requesterID === sessionStorage.getItem("user_id")) { // the request I send out
            composeMyRequestDetail(request);
            $("#publishedRequestModal").modal('show');
        } else if (request.senderID === sessionStorage.getItem("user_id")) { // the request of my shelter
            composeOthersRequestDetail(request);
            $("#publishedRequestModal").modal('show');
        }
    }

    let composePost = (post) => {
        return new shelterPostElement(post, showPostDetail);
    }

    let composeRequest = (request) => {
        return new shelterRequestElement(request, showRequestDetail);
    }

    let composeAllPosts = (posts) => {
        for (let i = 0; i < posts.length; i++) {
            let composedPost = composePost(posts[i]);
            $("#shelter-list").append(composedPost);
        }
    }

    let composeMyPosts = (posts) => {
        $("#myShelterPostList").empty();
        for (let i = 0; i < posts.length; i++) {
            let composedPost = composePost(posts[i]);
            $("#myShelterPostList").append(composedPost);
        }
    }

    let composeMyRequests = (requests) => {
        $("#myShelterRequestList").empty();
        for (let i = 0; i < requests.length; i++) {
            let composedRequest = composeRequest(requests[i]);
            $("#myShelterRequestList").append(composedRequest);
        }
    }

    let displayShelterList = () => {
        $("#shelter-list").empty();
        getAllPosts();
    }


    // *************** SOCKET.IO LISTENERS *******************
    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });

    socket.on('post change', function(message) {
        displayShelterList();
        getMyPosts(sessionStorage.getItem("user_id"));
    });

    socket.on('new request', function(message) {
        window.alert("There's a new request on your post");
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    // *************** INITIALIZATION PROCESS *******************
    getMyUserName();
    displayShelterList();

    // *************** ELEMENT LISTENERS *******************
    $("#back2ESN").click(function() {
        window.location.href="/chatroom"
    });

    $("#submitProvide").click(function() {
        let shelterAddress = $("#shelterAddress").val();
        let description = $("#shelterDescription").val();
        if (shelterAddress === "" || description === "") {
            window.alert("please complete all fields");
            return;
        }
        let roomNum = $("#roomInfo").children().length;
        let roomsDateRange = []
        for (let i = 1; i <= roomNum; i++) {
            let roomFromID = "room" + i + "DateFrom";
            let roomToEleID = "room" + i + "DateTo";
            let startDate =  Date.parse($("#"+roomFromID).val());
            let endDate = Date.parse($("#"+roomToEleID).val());
            if (startDate > endDate) {
                window.alert("start date must be previous of end date");
                return;
            }
            roomsDateRange.push({
                roomID: "",
                availableDateBegin: startDate,
                availableDateEnd: endDate,
                assigned: false,
            })
        }
        let newPost = {
            sender: userName,
            senderId: sessionStorage.getItem("user_id"),
            description: description,
            totalRoomNum: roomNum,
            roomInfo: roomsDateRange,
            shelterAddress: shelterAddress,
        }
        createPost(newPost);
        $("#newPostModal").modal('hide');
    });

    $("#roomNew").click(function() {
        let roomNum = $("#roomInfo").children().length;
        if (roomNum >= 3) {
            $("#roomNew").hide()
        }
        let element =
        `<div>
            <div class="row mb-3">
                <label For="room${roomNum+1}DateFrom" class="col-4 col-form-label">Room${roomNum+1} From</label>
                <div class="col-8">
                    <input type="date" class="form-control" id="room${roomNum+1}DateFrom">
                </div>
            </div>
            <div class="row mb-3">
                <label For="room${roomNum+1}DateTo" class="col-4 col-form-label">Room${roomNum+1} To</label>
                <div class="col-8">
                    <input type="date" class="form-control" id="room${roomNum+1}DateTo">
                </div>
            </div>
            <hr>
        </div>`;
        $("#roomInfo").append(element);
        if (roomNum === 1) {
            $("#roomDelete").show();
        }
    })

    $("#roomDelete").click(function() {
        let roomNum = $("#roomInfo").children().length;
        if (roomNum === 1) {
            $("#roomDelete").hide();
            return;
        }
        if (roomNum === 2) {
            $("#roomDelete").hide();
        }
        $("#roomInfo").children()[roomNum-1].remove()

        if (roomNum === 4) {
            $("#roomNew").show()
        }
    });

    $("#myPost").click(function() {
        let userID = sessionStorage.getItem("user_id");
        getMyPosts(userID);
    });

    $("#myRequest").click(function() {
        let userID = sessionStorage.getItem("user_id");
        let filter = {requesterID: userID};
        getAllMyRequest(filter);
    });

    $("#updatePost").click(function () {
        let postID = $("#postIDDetail").html().trim();
        let newAddress = $("#shelterAddressDetail").val();
        let newDescription = $("#shelterDescriptionDetail").val();
        let newPostField = {
            shelterAddress: newAddress,
            description:newDescription
        }
        updatePost(postID, newPostField);
        displayShelterList();
    });

    $("#submitRequest").click(function (){
        //TODO
        let checkboxVals = [];
        for (let i = 0; i < 4; i++) {
            let checkVal = $("#"+"flexCheckDefault"+(i+1)).val();
            let checked = $("#"+"flexCheckDefault"+(i+1)).is(':checked');
            if ((typeof checkVal !== 'undefined') && checked) {
                checkboxVals.push(checkVal);
            }
        }
        let roomIDSelected = checkboxVals;
        let numOfPeople = parseInt($("#numOfPeople1-1").val());
        let condition = $("#shelterRequestDescription").val();
        let bookDateFrom = Date.parse($("#bookDateFrom").val());
        let bookDateTo = Date.parse($("#bookDateTo").val());

        let postID = $("#postIDDetail").html();
        getThisPost(postID);
        let senderName = thisPost[0].sender;
        let senderID = thisPost[0].senderId;

        if (roomIDSelected.length === 0 || numOfPeople <= 0 || condition.length === 0) {
            window.alert("please complete all fields");
            return;
        }

        if (bookDateFrom > bookDateTo || (isNaN(bookDateFrom) || isNaN(bookDateTo))) {
            window.alert("book date start must no later than book date end");
            return;
        }

        let roomIDs = [];
        for (let i = 0; i < roomIDSelected.length; ++i) {
            roomIDs.push({roomID: roomIDSelected[i]})
        }

        let newRequest = {
            requesterID: sessionStorage.getItem("user_id"),
            postID: postID,
            senderName: senderName,
            senderID: senderID,
            requesterName: userName,
            description: condition,
            totalRoomNumRequest: roomIDSelected.length,
            roomIDs: roomIDs,
            totalPeople: numOfPeople,
            BookDateBegin: bookDateFrom,
            BookDateEnd: bookDateTo
        }
        createRequest(newRequest);
        $("#publishedPostModal").modal('hide');
    });

    $("#approveRequest").click(function () {
        let requestID = $("#requestIDDetail").html().trim();
        getThisRequest({requestID: requestID});
        getThisPost(thisRequest.postID);
        let roomLeft = thisPost[0].availableRoomNum;
        if (roomLeft <= 0) {
            window.alert("You have no room to assign")
            return;
        }
        roomLeft = roomLeft-1;
        // console.log(thisPost[0].availableRoomNum);
        let newRequestField = {
            approved: true,
        }
        updateRequest(requestID, newRequestField);

        // TODO 修改post room的assign信息

        // console.log("getThisRequest: ", getThisRequest);
        // console.log("getThisRequest: ", getThisRequest);
        //
        // let newAssignees = thisPost[0].assignees;
        // newAssignees.push({
        //     assigneeName: thisRequest[0].requesterName,
        //     assigneeID: thisRequest[0].assigneeID,
        //     roomNum: thisRequest[0].roomNum,
        //     roomIDs: thisRequest[0].roomIDs,
        // })
        //
        // let help = (roomID) => {
        //     for (let i = 0; i < thisRequest[0].roomIDs; i++) {
        //         if (roomID === thisRequest[0].roomIDs[i].roomID) {
        //             return true
        //         }
        //     }
        //     return false;
        // }
        //
        // let newRoomInfo = thisPost[0].roomInfo;
        // for (let i = 0; i < newRoomInfo.length; i++) {
        //     if (help(newRoomInfo[i].roomID)) {
        //         newRoomInfo[i].assigned = true;
        //     }
        // }
        //
        // let newPostField = {
        //     availableRoomNum: thisPost[0].availableRoomNum-1,
        //     assignees: newAssignees,
        //     roomInfo: newRoomInfo,
        // }
        let newPostField = {
            availableRoomNum: roomLeft,
        }
        updatePost(thisPost[0].postID, newPostField);

    });

    $("#request-editRequest-btn").click(function () {
        $("#numOfPeople2-1").attr("readonly",false);
        $("#conditionDescription").attr("readonly",false);
    });

    $("#updateRequest").click(function () {
        let requestID = $("#requestIDDetail").html().trim();
        let newNumOfPeople = parseInt($("#numOfPeople2-1").val());
        let newCondition = $("#conditionDescription").val();
        if (newNumOfPeople <= 0 || newCondition.length === 0) {
            window.alert("please complete all fields");
            return;
        }

        let newRequestField = {
            totalPeople: newNumOfPeople,
            description: newCondition,
        }

        updateRequest(requestID, newRequestField);
    });

    $("#request-deleteRequest-btn").click(function () {
        let requestID = $("#requestIDDetail").html().trim();
        deleteRequest(requestID);
        $("#publishedRequestModal").modal('hide');
    });

});