$(document).ready(function() {
    let publicChatRoomId = new String();
    let currentChatRoomName = new String();
    let currentReceiverId = new String();
    let currentZipcode = "";
    let unreadMessages = new Array();
    let currentUserName = new String();

    // search feature
    let mainOption = "username";

    // hide chatroom first
    let hide_chatroom = () => {
        $("#navbar-container").hide()
        $("#main-container").hide()

        // search feature
        let mainOption = "username";
        $("#search-input").val('')

        // hide setting pages
        if (sessionStorage.getItem("user_role") !== "Administrator"){
            $("#performance").hide()
            $("#management").hide()
        }
    }
    hide_chatroom();
    let jsonObj;

    function getUserInfo() {
        $.ajax({
            type: "GET",
            url: "/users/"+sessionStorage.getItem("user_id"),
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let jsonObj = JSON.parse(result);
                // add current user's profile
                $("#username").text(jsonObj.username);
                currentUserName = jsonObj.username;
                let firstLetter = jsonObj.username.charAt(0).toUpperCase();
                $("#firstLetter").text(firstLetter);
                // update status to the status on record
                $( ".dropdown dd ul li" ).each(function( ) {
                    if ($(this).find("a span.value").html() == jsonObj.userStatus){
                        let text = $(this).html();
                        let color = $(this).css('color');
                        $(".dropdown dt a span").html(text);
                        $(".dropdown dt a").css({'color': color});
                    }
                });
                currentZipcode = jsonObj.zipcode
                $('#current-zipcode').val(currentZipcode);
            }
        }).fail(function(jqXHR, textStatus, error) {
            window.location.href="/signin";
        });
    }
    getUserInfo();
    

    // when click to show esn directory
    $(".container-fluid button").click(function() {
        $("#overlay").hide();
        $("#emergencyNotification").hide();
        $( "input" ).prop( "disabled", false );

        $("#esn").show();
        $("#logout").show();
        $("#messages").empty();
        hide_chatroom();
        updateESN();
        mainOption = 'username';
    });

    // when click to show public chatroom
    $("#publicGroupButton").click(function() {
        $("#esn").hide();
        $("#logout").hide();
        clearMessages();
        $("#navbar-container").show()
        $("#main-container").show()
        
        currentChatRoomName = $("#publicGroupButton").text();
        $("#chatroom-name").text(currentChatRoomName);
        // request to get chat message
        generatePublic();
        if (publicChatRoomId == ''){
            publicChatRoomId = currentChatRoomId;
        }
        getUnreadMessages();
        $("#content").focus();

        mainOption = "public";
        $("#load-more").hide();
        $("#message-send").show();
        $("#search-message-input").val('');
    });


    let generatePublic = () => {
        let jsonObject = {
            creater: "# Public Group Chat"
        };
        $.ajax({
            type: "GET",
            url: "/chatroom/public",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: jsonObject,
            success: function(result){
                jsonObj = JSON.parse(result);
                if (jsonObj){
                    currentChatRoomId = jsonObj.id;
                    currentChatRoomName = jsonObj.creater;
                    currentReceiverId = "ALL";
                    getChatMessage(currentChatRoomId);
                }else{
                    let jsonObject = {
                        creater: "# Public Group Chat"
                    };
                    $.ajax({
                        type: "POST",
                        url: "/chatroom/public",
                        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                        data: jsonObject,
                        success: function(result){
                            jsonObj = JSON.parse(result);
                            currentChatRoomId = jsonObj.id;
                            currentChatRoomName = jsonObj.creater;
                            currentReceiverId = "ALL";
                        }
                    }).fail(function(jqXHR, textStatus, error) {
                        console.log("error occur when entering public chatroom: " + error);
                    });
                }
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when entering public chatroom: " + error);
        });
    }

    let generatePrivate = (receiver,receiverId) => {
        $("#esn").hide();
        $("#logout").hide();
        $("#navbar-container").show()
        $("#main-container").show()
        clearMessages();
        $.ajax({
            type: "GET",
            url: "/chatroom/private/"+sessionStorage.getItem("user_id")+"/"+receiverId,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                jsonObj = JSON.parse(result);
                if (jsonObj){
                    currentChatRoomId = jsonObj.id;
                    currentChatRoomName = receiver;
                    currentReceiverId = receiverId;
                    let userElement = userElements.get(receiverId);
                    $("#chatroom-name").text(currentChatRoomName);
                    getChatMessage(currentChatRoomId);
                    updateUnreadMessage(currentChatRoomId,$("#username").text());
                    populateLatestMessage(userElement);
                    
                    mainOption = "private";
                    $("#load-more").hide();
                    $("#message-send").show();
                    $("#search-message-input").val('');
                }else{
                    let jsonObject = {
                        userIds: [sessionStorage.getItem("user_id"),receiverId]
                    };
                    $.ajax({
                        type: "POST",
                        url: "/chatroom/private/"+sessionStorage.getItem("user_id")+"/"+receiverId,
                        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                        data: jsonObject,
                        success: function(result){
                            console.log();
                            jsonObj = JSON.parse(result);
                            currentChatRoomId = jsonObj.id;
                            currentChatRoomName = receiver;
                            currentReceiverId = receiverId;
                            $("#chatroom-name").text(currentChatRoomName);

                            mainOption = "private";
                            $("#load-more").hide();
                            $("#message-send").show();
                            $("#search-message-input").val('');
                        }
                    }).fail(function(jqXHR, textStatus, error) {
                        console.log("error occur when chatting privately: " + error);
                    });
                }
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when chatting privately: " + error);
        });
    }

    $("#send").click(function(){
        if ($("#content").val()) {
            let message = {
                roomId: currentChatRoomId,
                name: $("#username").text(),
                senderId: sessionStorage.getItem("user_id"),
                receiver: "ALL",
                receiverId: "ALL",
                readOrNot: true,
                content: $("#content").val(),
                status: $("#userstatus").find("dt a span.value").html()
            }
            if (currentChatRoomName == "# Public Group Chat"){
                var contentReg = new RegExp('(bomb|fire|threat|battle|fighting|warfare|combat|war|snipers|enemy|tank|mine|weapon)+', 'i');
                if (contentReg.test($("#content").val())){
                    $("#emergencyNotification span.content").text($("#content").val())
                    $("#emergencyNotification span.status").text($("#userstatus").find("dt a span.value").html())
                    $("#emergencyNotification").show();
                    $("#overlay").show();
                    $( "input" ).prop( "disabled", true );
                    $("#overlay").click(function (e)
                    {
                        $("#overlay").hide();
                        $("#emergencyNotification").hide();
                        $( "input" ).prop( "disabled", false );
                    });
                }
                postMessage(message)
            }else{
                message.receiver = $("#chatroom-name").text()
                message.receiverId = currentReceiverId
                message.readOrNot = false
                postMessage(message)
            }
        }
    });

    $('#content').keypress(function(event){
        if(event.keyCode==13)
        $('#send').click();
    });

    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });
    
    socket.on('chat message', function(message) {
        if (currentChatRoomName==="# Public Group Chat"){
            let jsonObj = JSON.parse(message);
            let username = jsonObj.sender;
            let content = jsonObj.content;
            let senderStatus = jsonObj.senderStatus;
            let createDate = new Date(jsonObj.createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
            let position = 0;
            if (username ===  $("#username").text()){
                position = 1;
            }
            let element = compose(position, username, content, createDate, senderStatus)
            $("#messages").append(element);
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    socket.on('private message', function(message){
        jsonObj = JSON.parse(message);
        if (jsonObj.chatRoomId == currentChatRoomId){
            let elements = ``;
            let username = jsonObj.sender;
            let content = jsonObj.content;
            let senderStatus = jsonObj.senderStatus;
            let requestId = jsonObj.requestId;
            let createDate = new Date(jsonObj.createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
            let position = 0;
            if (username ===  $("#username").text()){
                position = 1;
            }
            if (requestId !== "message"){
                $.ajax({
                    type: "GET",
                    url: "/emergencySupplyRequest/"+requestId, 
                    headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                    success: function(result){
                        console.log(result)
                        if (result.length>0){
                            let resultAf = JSON.parse(result);
                            let response = resultAf.response;
                            let valueObject = {
                                position:position,
                                username:username,
                                content:content,
                                createDate:createDate,
                                senderStatus:senderStatus,
                                response:response,
                                requestId:requestId
                            }
                            elements = composeRequest(valueObject)
                            $("#messages").append(elements);
                        }
                    }
                });
            }else{
                elements = compose(position, username, content, createDate, senderStatus);
                $("#messages").append(elements);
            }
            window.scrollTo(0, document.body.scrollHeight);
            if (jsonObj.receiver === $("#username").text()){
                if ( $("#esn").css('display') === 'none'){
                    updateUnreadMessage(jsonObj.chatRoomId,$("#username").text());
                }
                let userElement = userElements.get(jsonObj.senderId);
                populateLatestMessage(userElement);
            }
        }else{
            if (jsonObj.receiver === $("#username").text()){
                unreadMessages.push(jsonObj)
                $("#unread").text(unreadMessages.length ? unreadMessages.length : '');
                let userElement = userElements.get(jsonObj.senderId);
                populateLatestMessage(userElement);
            }
        }
    })

    socket.on('request update', function(request){
        let result = JSON.parse(request)
        if (currentReceiverId===result.providerId || currentReceiverId === result.requesterId){
            clearMessages();
            getChatMessage(currentChatRoomId)
        }
    })

    socket.on('latest announcement', function(announcement){
        let jsonObj = JSON.parse(announcement);
        let output = jsonObj.sender+" post an announcement: "+ jsonObj.content;
        $("#announce-content").text(output);
        $("#announce-toast").toast("show");
    });

    socket.on('new rescue', function(rescue){
        let jsonObj = JSON.parse(rescue);
        console.log(rescue);
        $("#rescue-info").html(`
            <h2>Citizen: ${jsonObj.citizenName}</h2>
            <h3>Location: ${jsonObj.place}</h3>
        `);
        $("#rescue-notification").modal("show");
    });

    $("#ignore-rescue").click(function() {
        $("#rescue-notification").modal("hide");
    });

    $("#help-rescue").click(function() {
        window.location.href = "/rescue";
    });

    socket.on('on off change', function(userStatus) {
        let jsonObj = JSON.parse(userStatus);
        onUserOnOffStatusChanged(jsonObj);
    });

    socket.on('status change', function(userStatus) {
        let jsonObj = JSON.parse(userStatus);
        onUserStatusChanged(jsonObj);
    })

    socket.on('new user in', function(userStatus) {
        let jsonObj = JSON.parse(userStatus);
        handleNewUser(jsonObj);
    })

    socket.on('err', function(msg) {
        console.log(msg)
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    $("#shelter-button").click(function() {
        window.location.replace("/shelter");
    })

    let dangerReportNotification;
    socket.on('nearby danger', function (report) {
        dangerReportNotification = JSON.parse(report);
        $('#danger-notification-title').text(dangerReportNotification.title);
        $('#danger-notification-zipcode').text(dangerReportNotification.zipcode);
        $('#danger-notification-danger-item').text(dangerReportNotification.dangerItems);
        $('#danger-notification-description').text(dangerReportNotification.description);
        $('#danger-report-notification').modal('toggle');
    });


    $('#reply-report-btn').click(function () {
        let reply = $('#danger-notification-reply').val();
        if (reply.length === 0) {
            alert("Comment cannot be empty! No comment has been made.");
            $('#danger-report-notification').modal('hide');
            return;
        }
        sendNewComment(reply)
        $('#danger-report-notification').modal('hide');
        $('#danger-notification-reply').empty();
    });

    let sendNewComment = (reply) => {
        let comment = {
            username: $("#username").text(),
            content: reply,
        }
        $.ajax({
            type: "POST",
            url: "/dangerReports/" + dangerReportNotification.id + "/comments",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: comment,
            success: function(result){
                console.log(result);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when posting a new danger report comment: " + error);
        });
    }

    let validateZipcode = (zipcode) => {
        let str = zipcode.trim();
        if (str.length !== 5) {
            return false;
        }
        let num = Number(zipcode);
        return Number.isInteger(num) && num > 0;
    }

    $('#current-zipcode').focusout(function () {
        let zipcode = $('#current-zipcode').val();
        if (!validateZipcode(zipcode)) {
            alert("Please input valid zipcode: \nZipcode has to be 5 number\nStrings are not allowed");
            $('#current-zipcode').val(currentZipcode);
            return;
        }
        $.ajax({
            type: "PATCH",
            url: "/users/" + sessionStorage.getItem("user_id") + "/zipcode",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: { zipcode: zipcode },
            success: function(result){
                console.log(result);
                currentZipcode = zipcode;
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when updating user zipcode location: " + error);
            $('#current-zipcode').val(currentZipcode);
        });
    });

    $("#danger-report").click(function () {
        window.location.href="/dangerReport";
    });

    $( "#logout" ).click(function() {
        $.ajax({
            type: "DELETE",
            url: "/sessions/logout",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: jsonObj,
            success: function(result){
                sessionStorage.clear();
                window.location.replace("/");
            }
        });
    });

    let getChatMessage = (currentChatRoomId) => {
        $.ajax({
            type: "GET",
            url: "/messages/" + currentChatRoomId,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let element =``;
                jsonObj = JSON.parse(result);
                for (let i = jsonObj.length - 1; i >= 0; i--) {
                    let username = jsonObj[i].sender;
                    if (bannedUsers.includes(username)){
                        continue
                    }
                    let content = jsonObj[i].content;
                    let senderStatus = jsonObj[i].senderStatus;
                    let requestId = jsonObj[i].requestId;
                    let createDate = new Date(jsonObj[i].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
                    let position = 0;
                    if (username ==  $("#username").text()){
                        position = 1;
                    }
                    if (requestId !=="message"){
                        let response = jsonObj[i].requestResponse
                        let valueObject = {
                            position:position,
                            username:username,
                            content:content,
                            createDate:createDate,
                            senderStatus:senderStatus,
                            response:response,
                            requestId:requestId
                        }
                        element = composeRequest(valueObject)
                    }else{
                        element = compose(position, username, content, createDate, senderStatus);
                    }
                    $("#messages").append(element);
                    window.scrollTo(0, document.body.scrollHeight);
                }
            }
        });
    }

    let composeRequest = (valueObject) => {
        let response = valueObject.response;
        let firstLetter = valueObject.username.charAt(0).toUpperCase();
        let senderStatusIconImage = getUserStatusIconImage(valueObject.senderStatus);
        let senderStatusIcon = '';
        let leftElement = ``;
        let rightElement = ``;
        let requestRes = ``;
        let provideRes = ``;
        if (senderStatusIconImage !== '') {
            senderStatusIcon = `<img src=${senderStatusIconImage} />`
        }
        if (response==="Approve"){
            requestRes = `Approved!`;
            provideRes = `Approved!`;

        }else if (response === "Reject"){
            requestRes = `Rejected!`;
            provideRes = `Rejected!`;
        }else{
            requestRes = `Waiting for response!`;
            provideRes = `
            <button type="submit" class="green margin-right" value = "${valueObject.requestId}">Approve</button>
            <button type="submit" class="green margin-right" value = "${valueObject.requestId}">Reject</button>`;
        }
        leftElement = `
                <div class="message-left message w-100">
                    <div class="col-1 display-5 text-secondary font-weight-bolder align-self-top">
                        ${firstLetter} ${senderStatusIcon}
                    </div>
                    <div class="d-block col">
                        <div class="d-flex text-secondary justify-content-start">
                            <small><b>${valueObject.username}</b>, ${valueObject.createDate}</small>
                        </div>
                        <div class="d-flex justify-content-start">
                            <span class="message-base shadow-sm">${valueObject.content}</span>
                            <span class="message-base shadow-sm">${provideRes}</span>
                        </div>
                    </div>
                </div>`;
            rightElement = `
                <div class="message-right message w-100">
                    <div class="d-block col">
                        <div class="d-flex text-muted px-2 justify-content-end">
                            <small>${valueObject.createDate}, <b>${valueObject.username}</b></small>
                        </div>
                        <div class="d-flex justify-content-end">
                            <span class="message-base shadow-sm">${valueObject.content}</span>
                            <span class="message-base shadow-sm">${requestRes}</span>
                        </div>
                    </div>
                    <div class="col-1 display-5 text-muted font-weight-bolder align-self-top text-end">
                        ${firstLetter} ${senderStatusIcon}
                    </div>
                </div>`;
            return valueObject.position==0?leftElement:rightElement;
    }


    let onlineUsers= new Map(); //{<userId>: <user>}
    let offlineUsers = new Map();
    let userElements = new Map(); //{<userId>: <userElement>}

    function getAllUsers(){
        $.ajax({
            type: "get",
            url: "/users",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let jsonObj = JSON.parse(result);
                initializeUser(jsonObj.data.onlineUsers, onlineUsers);
                initializeUser(jsonObj.data.offlineUsers, offlineUsers);
                updateESN();
                populateLatestMessages();
                updateDirectoryHeight();
            }
        });
    }
    getAllUsers();

    let bannedUsers = new Array();
    function getBannedUsers(){
        $.ajax({
            type: "get",
            url: "/users/bannedusers",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let jsonObj = JSON.parse(result);
                if (jsonObj.length>0){
                    for (let i = 0; i < jsonObj.length; i++) {
                        bannedUsers.push(jsonObj[i].username)
                    }
                }
            }
        });
    }
    getBannedUsers();

    function getAnnouncement(){
        $.ajax({
            type: "GET",
            url: "/announcements/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let jsonObj = JSON.parse(result);
                if(jsonObj.length > 0){
                    let createDate = new Date(jsonObj[0].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' })
                    let announcement = jsonObj[0].sender + " " + createDate + ": "+ jsonObj[0].content;
                    $("#announce-content").text(announcement);
                }else{
                    $("#announce-content").text("No Announcement Yet.");
                }
                bindAnnounceButton();
            }
        });
    }
    getAnnouncement();
    

    let bindAnnounceButton = () => {
        $( "#announce-button" ).click(function() {
            window.location.href="/announcement";
        });
        $( "#show-announcement" ).click(function() {
            $("#announce-toast").toast("show");
        });
        $( "#announce-close" ).click(function() {
            $("#announce-toast").toast("hide");
        });
    }

    let initializeUser = (users, userMap) => {
        for (let i = 0; i < users.length; i++) {
            let userId = users[i].userId;
            userMap.set(userId, users[i]);
            let userElement = composeUserElement(users[i]);
            userElements.set(userId, userElement);
        }
    }

    let composeUserElement = (user) => {
        return new UserElement(user, generatePrivate);
    }

    let updateDirectoryHeight = () =>{
        // set height of ESN directory list
        let logoutHeight = $("#logout").offset().top
        let directHeight = $("#esn-directory").offset().top
        let directoryHeight = logoutHeight - directHeight - 5;
        $("#esn-directory").css({'height': directoryHeight})
    }

    let updateESN = () => {
        if ( $("#esn").css('display') !== 'none'){
            clearESN();
            let comparator = getSortByNameComparator()
            appendUserElementsInESN(onlineUsers, comparator);
            appendOfflineDividerInESN();
            appendUserElementsInESN(offlineUsers, comparator);
        }
    }

    let appendOfflineDividerInESN = () => {
        $("#esn-directory").append(`<div class="offline-divider display-8"><span>Offline Users</span></div>`);
    }

    // when click change status button
    $(".dropdown dt a").click(function() {
        $(".dropdown dd ul").toggle();
        $("#overlay").show();
        $("#overlay").click(function (e)
        {
            $("#overlay").hide();
            $(".dropdown dd ul").hide();
        });
    });

    // when selected the demanding status
    $(".dropdown dd ul li a").click(function() {
        let username = $("#username").text();
        let text = $(this).html();
        let value = $(this).find('.value').text();
        let color = $(this).css('color');
        if ($(".dropdown dt a span.value").html() !== value){
            $(".dropdown dt a span").html(text);
            $(".dropdown dt a").css({'color': color});

            // update status at database
            let userStatus = $("#userstatus").find("dt a span.value").html();
            changeUserStatus(username, userStatus);
        }
        $(".dropdown dd ul").hide();
        $("#overlay").hide();
    });

    // add other user's profiles
    let appendUserElementsInESN = (users, comparator) => {
        let sortedMap = getSortedUsers(users, comparator);
        let currentUsername = $("#username").text();
        sortedMap.forEach((user, id) => {
            if (user.username !== currentUsername){
                let userElement = userElements.get(id);
                $("#esn-directory").append(userElement);
            }
        });
    }

    let getSortedUsers = (users, comparator) => {
        let sortedElements = [...users];
        sortedElements.sort(comparator)
        return new Map(sortedElements);
    }

    let getSortByNameComparator = () => {
        return ([userId1, user1], [userId2, user2]) =>
            user1.username.localeCompare(user2.username)
    }

    let clearESN = () => {
        $('#esn-directory').empty();
    }

    let populateLatestMessages = () => {
        userElements.forEach((userElement, id) => {
            populateLatestMessage(userElement);
        })
    }

    let populateLatestMessage = (userElement) => {
        let jsonObj = {
            sender: userElement.user.username,
            receiver: $("#username").text()
        }
        $.ajax({
            type: "GET",
            url: "/messages/public/latest",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: jsonObj,
            success: function(result){
                const messages = JSON.parse(result);
                userElement.setLatestMessages(messages);
            }
        });
    }

    let onUserOnOffStatusChanged = (userActStatusObj) => {
        let userId = userActStatusObj.userInfo.userId;
        let status = userActStatusObj.status;
        if (status === "1" && offlineUsers.has(userId)) {
            //TODO: unify ActStatus data type (Boolean vs. Integer)
            let user = offlineUsers.get(userId);
            user.activeStatus = true;
            onlineUsers.set(userId, user);
            offlineUsers.delete(userId);
        } else if (status === "0" && onlineUsers.has(userId)) {
            let user = onlineUsers.get(userId);
            user.activeStatus = false;
            offlineUsers.set(userId, user);
            onlineUsers.delete(userId);
        }

        updateESN(); //TODO: This can be optimized by inserting userElement into an ordered list
    }

    // update user current status when selected
    let changeUserStatus=(username, userStatus)=>{
        let jsonObj = {
            username: username,
            userStatus: userStatus,
        }
        $.ajax({
            type: "POST",
            url: "/users/userstatus",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: jsonObj,
            success: function(result){
                console.log(result);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when changing current userStatus: " + error);
        });
    }

    let onUserStatusChanged = (userStatusObj) => {
        let userId = userStatusObj.userInfo.userId;
        let status = userStatusObj.userStatus;
        if (onlineUsers.has(userId)) {
            const user = onlineUsers.get(userId);
            user.userStatus = status;
        } else if (offlineUsers.has(userId)) {
            //Ideally this should not happen;
            //Or we should at least combine online and offline user in a single map
            const user = offlineUsers.get(userId);
            user.userStatus = status;
        }
        let userElement = userElements.get(userId);
        userElement.setStatus(status);
    }

    let handleNewUser = (userStatusObj) => {
        userStatusObj.userInfo.activeStatus = true;
        let userId = userStatusObj.userInfo.userId;
        let userInfo = userStatusObj.userInfo;
        onlineUsers.set(userId, userInfo);
        userElements.set(userId, composeUserElement(userInfo));
        updateESN(); //TODO: This can be optimized by inserting userElement into an ordered list
    }

    // when click to search for status
    $(".input-group-text").click(function(){
        $(".status-option").show()

        $("#overlay").show();
        $("#overlay").click(function (e)
        {
            $("#overlay").hide();
            $(".status-option").hide();
        });
        mainOption = 'userstatus';
    })

    // when selected the demanding status
    $(".search-option-content ul a").click(function() {
        let statusOption = $(this).find('.value').text()
        $(".status-option").hide();
        $("#overlay").hide();

        if (statusOption == 'cancel'){
            $("#search-input").val('')
            updateESN();
        }
        else{
            $("#search-input").val(statusOption)
            let searchUrl = getSearchAPIUrl(statusOption, mainOption, currentChatRoomId);
            callSearchAPI(statusOption, searchUrl, populateSearchResult);
        }
    });
    // set selection width
    let searchWidth = $(".input-group-text").outerWidth() + 'px';
    $(".search-option-content").css({'width': searchWidth});

    // search for username
    $("#search-input").on('input propertychange', function() {
        mainOption = 'username';
        let searchInput = $("#search-input").val();
        let searchUrl = getSearchAPIUrl(searchInput, mainOption, currentChatRoomId);
        callSearchAPI(searchInput, searchUrl, populateSearchResult);
    })

    // search for messages
    $("#search-message-input").change(function() {
        if (currentChatRoomName == "# Public Group Chat"){
            mainOption = 'public';
        }
        else{
            mainOption = 'private';
        }
        let searchInput = $("#search-message-input").val();
        let searchUrl = getSearchAPIUrl(searchInput, mainOption, currentChatRoomId);
        callSearchAPI(searchInput, searchUrl, populateSearchResult);
    })

    let populateSearchResult = (searchResultJson, searchInput) => {
        switch (mainOption) {
            case 'username':
            case 'userstatus':
                return populateUserSearchResult(searchResultJson.data);
            case 'announcement':
                searchResultJson.reverse();
            case 'public':
                return populateMessageSearchResult(searchResultJson, currentUserName);
            case 'private':
                if (isSearchUserStatusHistory(searchInput)) {
                    const userStatusHistory = getUserStatusChangeHistory(searchResultJson, currentChatRoomName);
                    return printUserList(userStatusHistory);
                } else {
                    populateMessageSearchResult(searchResultJson, currentUserName);
                }
        }
    }

    // username and userstatus result
    let appendResultsInESN = (results) => {
        if (results.length == 0){
            let Element = `<p class="text-danger m-2"> No matches found.</p>`;
            $("#esn-directory").append(Element);
        }
        results.forEach((user) => {
            let currentUsername = $("#username").text();
            let searchInput = $("#search-input").val();
            if (searchInput !== '' || (user['username'] !== currentUsername)){
                let userElement = userElements.get(user['userId']);
                $("#esn-directory").append(userElement);
            }
        });
    }
    let populateUserSearchResult = (searchResult) => {
        let onlineusers = searchResult['onlineUsers'];
        let offlineusers = searchResult['offlineUsers'];

        clearESN();
        let comparator = getSortByNameComparator()
        appendResultsInESN(onlineusers, comparator);
        appendOfflineDividerInESN();
        appendResultsInESN(offlineusers, comparator);
    }
});
let currentChatRoomId = new String();

$(document).on('click',"#messages div div div span button",function(e) {
    let button_name = this.innerText;
    let requestId = this.value;
    let update_package = {
        id: requestId,
        response: button_name,
    }
    let message = {
        roomId: currentChatRoomId,
        name: $("#username").text(),
        senderId: sessionStorage.getItem("user_id"),
        receiver: '',
        receiverId: '',
        readOrNot: false,
        requestId: "message",
        content: '',
        status: $("#userstatus").find("dt a span.value").html()
    }
    $.ajax({
        type: "PUT",
        url: "/emergencySupplyRequest/"+requestId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: update_package,
        success: function(result){
            let pastData = {
                response: button_name
            }
            $.ajax({
                type: "PUT",
                url: "/messages/response/" + requestId,
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: pastData,
                success: function(result){
                    console.log(result)
                }
            }).fail(function(jqXHR, textStatus, error) {
                console.log("error occur when updating a request response: " + error);
            });

            let resultAf = JSON.parse(result)
            message.receiver = resultAf.requester,
            message.receiverId = resultAf.requesterId
            if (button_name==="Approve"){
                message.content = resultAf.provider + " approved "+resultAf.requester + "'s request for "+resultAf.type+ " with quantity : "+resultAf.quantity
                postMessage(message)

                let jsonObj = {
                    provider: resultAf.provider,
                    providerId: resultAf.providerId,
                    type: resultAf.type,
                    quantity: resultAf.quantity
                }
                $.ajax({
                    type: "PUT",
                    url: "/emergencySupplies/"+resultAf.type+"/"+resultAf.providerId,
                    headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                    data: jsonObj,
                    success: function(result){
                        console.log(result)
                    }
                });
            }else{
                message.content = resultAf.provider + " rejected "+resultAf.requester + "'s request for "+resultAf.type+ " with quantity : "+resultAf.quantity
                postMessage(message)
            }
        }
    });

})

let postMessage = (message) =>{
    $.ajax({
        type: "POST",
        url: "/messages/" + currentChatRoomId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: message,
        success: function(result){
            console.log(result)
            $("#content").val("");
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when sending a message: " + error);
    });
}
