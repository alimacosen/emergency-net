let compose = (position, username, content, createDate, senderStatus) => {
    let firstLetter = username.charAt(0).toUpperCase();
    let senderStatusIconImage = getUserStatusIconImage(senderStatus);
    let senderStatusIcon = '';
    if (senderStatusIconImage !== '') {
        senderStatusIcon = `<img src=${senderStatusIconImage} />`
    }
    let leftElement = `
            <div class="message-left message w-100">
                <div class="col-1 display-5 text-secondary font-weight-bolder align-self-top">
                    ${firstLetter} ${senderStatusIcon}
                </div>
                <div class="d-block col">
                    <div class="d-flex text-secondary justify-content-start">
                        <small><b>${username}</b>, ${createDate}</small>
                    </div>
                    <div class="d-flex justify-content-start">
                        <span class="message-base shadow-sm">${content}</span>
                    </div>
                </div>
            </div>`;
    let rightElement = `
            <div class="message-right message w-100">
                <div class="d-block col">
                    <div class="d-flex text-muted px-2 justify-content-end">
                        <small>${createDate}, <b>${username}</b></small>
                    </div>
                    <div class="d-flex justify-content-end">
                        <span class="message-base shadow-sm">${content}</span>
                    </div>
                </div>
                <div class="col-1 display-5 text-muted font-weight-bolder align-self-top text-end">
                    ${firstLetter} ${senderStatusIcon}
                </div>
            </div>`;
    
    return position==0?leftElement:rightElement;
}

let printUserList = (userStatusHistory) => {
    clearMessages();

    let elements = ``;
    let i = userStatusHistory.length;
    if (i === 0){
        let Element = `<p class="text-danger m-2"> No matches found.</p>`;
        $("#messages").append(Element);
        return;
    }

    for (i = i-1; i >= 0; i--) {
        let username = userStatusHistory[i].username;
        let content = '';
        let senderStatus = userStatusHistory[i].userStatus;
        let createDate = '';
        let position = 0;

        elements = compose(position, username, content, createDate, senderStatus);
        $("#messages").append(elements);
    }
    window.scrollTo(0, document.body.scrollHeight);
}

$("#load-more").on("click", function (e) {
    $(".message:hidden").slice(-10).show();
    if ($(".message:hidden").length == 0) {
        $("#load-more").hide();
    }
});

// search for private status
let getUserStatusChangeHistory = (chatMessageHistory, currentChatRoomName) => {
    const userStatusHistory = [];
    let status = '';
    const otherUsername = currentChatRoomName;
    const MAX_USER_STATUS = 10;

    for (let i = 0; i < chatMessageHistory.length && userStatusHistory.length < MAX_USER_STATUS; i++) {
        let message = chatMessageHistory[i];
        if (message.sender === otherUsername && status !== message.senderStatus) {
            status = message.senderStatus;
            const userStatusObj = {
                username: otherUsername,
                userStatus: status
            }
            userStatusHistory.push(userStatusObj);
        }
    }
    return userStatusHistory;
}

let clearMessages = () => {
    $("#messages").empty();
}

let getUnreadMessages = () => {
    $.ajax({
        type: "GET",
        url: "/messages/private/unread/"+sessionStorage.getItem("user_id"),
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let unreadMessages = JSON.parse(result);
            $("#unread").text(unreadMessages.length ? unreadMessages.length : '');
        }
    });
};

let updateUnreadMessage=(roomId, receiver)=>{
    let jsonObject = {
        roomId: roomId,
        receiver: receiver
    }
    $.ajax({
        type: "PUT",
        url: "/messages/unread/update",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObject,
        success: function(result){
            getUnreadMessages();
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when chatting privately: " + error);
    });
}

// messasge result
let populateMessageSearchResult = (searchResult, currentUserName) => {
    clearMessages();

    let elements = ``;
    let i = searchResult.length;
    if ($("#search-message-input").val() === ''){
        $("#message-send").show()
        $("#load-more").hide()

        for (i = i-1; i >= 0; i--) {
            let username = searchResult[i].sender;
            let content = searchResult[i].content;
            let senderStatus = searchResult[i].senderStatus;
            let createDate = new Date(searchResult[i].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
            let position = 0;
            if (username === currentUserName){
                position = 1;
            }
            elements = compose(position, username, content, createDate, senderStatus);
            $("#messages").append(elements);
        }
        window.scrollTo(0, document.body.scrollHeight);
        return;
    }

    $("#message-send").hide()
    if (i === 0){
        let Element = `<p class="text-danger m-2"> No matches found.</p>`;
        $("#messages").append(Element);
        return;
    }

    if (i > 10){
        $("#load-more").show()
    }
    let lastEle = 10;

    for (i = i-1; i >= 0; i--) {
        let username = searchResult[i].sender;
        let content = searchResult[i].content;
        let senderStatus = searchResult[i].senderStatus;
        let createDate = new Date(searchResult[i].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
        let position = 0;
        if (username === currentUserName){
            position = 1;
        }
        elements = compose(position, username, content, createDate, senderStatus);

        elements = (i >= lastEle) ? elements.replace(`w-100">`, `w-100" style="display:none">`) : elements;
        $("#messages").append(elements);
    }
    window.scrollTo(0, document.body.scrollHeight);
}

