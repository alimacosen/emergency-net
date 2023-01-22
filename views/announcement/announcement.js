$(document).ready(function() {
    let username = new String();
    let userStatus = new String();
    let userRole = new String();
    let mainOption = 'announcement';

    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });
    $.ajax({
        type: "GET",
        url: "/users/"+sessionStorage.getItem("user_id"),
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            username = jsonObj.username;
            userRole = jsonObj.userRole;
            userStatus = jsonObj.userStatus;
            
            if (userRole == "Citizen"){
                $("#message-container").remove()
            }
        }
    }).fail(function(jqXHR, textStatus, error) {
        window.location.href="/chatroom";
    });

    $("#back2ESN").click(function() {
        window.location.href="/chatroom";
    });

    let bannedUsers = new Array();

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
            $.ajax({
                type: "GET",
                url: "/announcements/",
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                success: function(result){
                    let jsonObj = JSON.parse(result);
                    if (jsonObj.length>0){
                        let announcements = jsonObj.reverse();
                        for (let i = 0; i < announcements.length; i++) {
                            let username = announcements[i].sender;
                            if (bannedUsers.includes(username)){
                                continue
                            }
                            let content = announcements[i].content;
                            let senderStatus = announcements[i].senderStatus;
                            let createDate = new Date(announcements[i].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
                            let element = composeAnnouncement(username, content, createDate, senderStatus);
                            $("#announcements-container").append(element);
                        }
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                }
            });
        }
    });


    let composeAnnouncement = (username, content, createDate, senderStatus) => {
        let firstLetter = username.charAt(0).toUpperCase();
        let senderStatusIconImage = getUserStatusIconImage(senderStatus);
        let senderStatusIcon = '';
        if (senderStatusIconImage !== '') {
            senderStatusIcon = `<img src=${senderStatusIconImage} />`
        }
        let element = `
                <div class="announcement-list announcement-list--element">
                    <div class="announcement-list_content">
                        <div class="col-1 display-5 text-secondary font-weight-bolder align-self-top">${firstLetter} ${senderStatusIcon}</div>
                        <div class="announcement-list_detail mx-2">
                            <p><b>${username}</b> post an announcement</p>
                            <p class="text-muted">${content}</p>
                            <p class="text-muted"><small>${createDate}</small></p>
                        </div>
                     </div>
                </div>`;
        return element;
    }

    $('#announcement-content').keypress(function(event){
        if(event.keyCode==13)
        $('#announce').click();
    });

    $( "#announce" ).click(function() {
        if ($("#announcement-content").val()){
            let jsonObj = {
                sender: username,
                senderId:sessionStorage.getItem("user_id"),
                content: $("#announcement-content").val(),
                status: userStatus
            }
            $.ajax({
                type: "POST",
                url: "/announcements/",
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: jsonObj,
                success: function(result){
                    $( "#announcement-content" ).val("");
                }
            });
        }
    });

    socket.on('public announcement', function(announcement){
        let jsonObj = JSON.parse(announcement);
        onAnnouncement(jsonObj);
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    let onAnnouncement = (announcement) => {
        let username = announcement.sender;
        let content = announcement.content;
        let senderStatus = announcement.senderStatus;
        let createDate = new Date(announcement.createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
        let element = composeAnnouncement(username, content, createDate, senderStatus);
        $("#announcements-container").append(element);
        window.scrollTo(0, document.body.scrollHeight);
    }

    // search for annoucements
    $("#search-announcement-input").change(function() {
        let searchInput = $("#search-announcement-input").val();
        callSearchAPI(searchInput, getSearchAPIUrl(searchInput, "announcement", ""), populateSearchResult);
    })

    let populateSearchResult = (searchResultJson, searchInput) => {
        searchResultJson.reverse();
        return populateAnnounceSearchResult(searchResultJson);
    }

    let populateAnnounceSearchResult = (searchResult) => {
        $("#announcements-container").empty();

        let elements = ``;
        let i = searchResult.length;
        if ($("#search-announcement-input").val() === ''){
            $("#announce-send").show()
            $("#load-more").hide()

            for (i = i-1; i >= 0; i--) {
                let username = searchResult[i].sender;
                let content = searchResult[i].content;
                let senderStatus = searchResult[i].senderStatus;
                let createDate = new Date(searchResult[i].createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });

                elements = composeAnnouncement(username, content, createDate, senderStatus);
                $("#announcements-container").append(elements);
            }
            window.scrollTo(0, document.body.scrollHeight);
            return;
        }

        $("#announce-send").hide()
        if (i === 0){
            let Element = `<p class="text-danger m-2"> No matches found.</p>`;
            $("#announcements-container").append(Element);
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
            elements = composeAnnouncement(username, content, createDate, senderStatus);

            elements = (i >= lastEle) ? elements.replace(`announcement-list--element">`, `announcement-list--element" style="display:none">`) : elements;
            $("#announcements-container").append(elements);
        }
        window.scrollTo(0, document.body.scrollHeight);
    }

    $("#load-more").on("click", function (e) {
        $(".announcement-list--element:hidden").slice(-10).show();
        if ($(".announcement-list--element:hidden").length == 0) {
            $("#load-more").hide();
        }
    });

})