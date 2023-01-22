$(document).ready(function() {
    let currentChatRoomId = new String();
    let currentChatRoomName = new String();
    let currentReceiverId = new String();
    let unreadMessages = new Array();
    let userElements = new Map(); //{<userId>: <userElement>}

    // search feature
    let currentUserName = '';
    let currentUserStatus = '';
    let jsonObj;

    $.ajax({
        type: "GET",
        url: "/users/"+sessionStorage.getItem("user_id"),
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            // add current user's profile
            currentUserName = jsonObj.username;
            // update status to the status on record
            currentUserStatus = jsonObj.userStatus;
        }
    }).fail(function(jqXHR, textStatus, error) {
        window.location.href="/signin";
    });

    // when click to show esn directory
    $(".container-fluid button").click(function() {
        window.location.href="/chatroom";
    });

    let params = new URL(location.href).searchParams;
    currentChatRoomId = params.get('id');
    $("#navbar-container").show()
    $("#main-container").show()   
    $("#load-more").hide();
    $("#message-send").show();
    $("#search-message-input").val('');
    clearMessages();
    $.ajax({
        type: "GET",
        url: "/chatroom/private/"+currentChatRoomId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            jsonObj = JSON.parse(result);
            for (var i in jsonObj.userIds){
                if (sessionStorage.getItem("user_id") != jsonObj.userIds[i]){
                    currentReceiverId = jsonObj.userIds[i];
                }
            }

            $.ajax({
                type: "GET",
                url: "/users/"+currentReceiverId,
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                success: function(result){
                    let json = JSON.parse(result);
                    currentChatRoomName = json.username;
                    $("#chatroom-name").text(currentChatRoomName);

                    let userElement = new UserElement(json, '')
                    userElements.set(currentReceiverId, userElement);
                    getChatMessage(currentChatRoomId);
                    updateUnreadMessage(currentChatRoomId,currentUserName);
                    populateLatestMessage(userElement);
                }
            }).fail(function(jqXHR, textStatus, error) {
                console.log("error occur when chatting privately: " + error);
            });
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when chatting privately: " + error);
    });

    $("#send").click(function(){
        if ($("#content").val()) {
            let jsonObject = {
                roomId: currentChatRoomId,
                name: currentUserName,
                senderId: sessionStorage.getItem("user_id"),
                receiver: $("#chatroom-name").text(),
                receiverId: currentReceiverId,
                readOrNot: false,
                content: $("#content").val(),
                status: currentUserStatus
            }
            $.ajax({
                type: "POST",
                url: "/messages/" + currentChatRoomId,
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: jsonObject,
                success: function(result){
                    console.log(result);
                    $("#content").val("");
                }
            }).fail(function(jqXHR, textStatus, error) {
                console.log("error occur when sending a message: " + error);
            });
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

    socket.on('private message', function(message){
        jsonObj = JSON.parse(message);
        if (jsonObj.chatRoomId == currentChatRoomId){
            let username = jsonObj.sender;
            let content = jsonObj.content;
            let senderStatus = jsonObj.senderStatus;
            let createDate = new Date(jsonObj.createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
            let position = 0;
            if (username ===  currentUserName){
                position = 1;
            }
            let element = compose(position, username, content, createDate, senderStatus)
            $("#messages").append(element);
            window.scrollTo(0, document.body.scrollHeight);
            if (jsonObj.receiver === currentUserName){
                updateUnreadMessage(jsonObj.chatRoomId,currentUserName);
                let userElement = userElements.get(jsonObj.senderId);
                populateLatestMessage(userElement);
            }
        }else{
            if (jsonObj.receiver === currentUserName){
                unreadMessages.push(jsonObj)
                $("#unread").text(unreadMessages.length ? unreadMessages.length : '');
                let userElement = userElements.get(jsonObj.senderId);
                populateLatestMessage(userElement);
            }
        }
    })

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    let getChatMessage = (currentChatRoomId) => {
        $.ajax({
            type: "GET",
            url: "/messages/" + currentChatRoomId,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let elements = [];
                jsonObj = JSON.parse(result);
                for (let i = jsonObj.length - 1; i >= 0; i--) {
                    let username = jsonObj[i].sender;
                    let content = jsonObj[i].content;
                    let senderStatus = jsonObj[i].senderStatus;
                    let createDate = new Date(jsonObj[i].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
                    let position = 0;
                    if (username ==  currentUserName){
                        position = 1;
                    }
                    elements = compose(position, username, content, createDate, senderStatus);
                    $("#messages").append(elements);
                }
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
    }

    let populateLatestMessage = (userElement) => {
        let jsonObj = {
            sender: userElement.username,
            receiver: currentUserName
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

    // search for messages
    $("#search-message-input").change(function() {
        let searchInput = $("#search-message-input").val();
        let searchUrl = getSearchAPIUrl(searchInput, 'private', currentChatRoomId);
        callSearchAPI(searchInput, searchUrl, populateSearchResult);
    })

    let populateSearchResult = (searchResultJson, searchInput) => {
        if (isSearchUserStatusHistory(searchInput)) {
            const userStatusHistory = getUserStatusChangeHistory(searchResultJson, currentChatRoomName);
            return printUserList(userStatusHistory);
        } else {
            populateMessageSearchResult(searchResultJson, currentUserName);
        }
    }
});

