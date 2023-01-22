// decline to send message
$(document).on('click','#decline', function(e) {
    $("#overlay").hide();
    $("#emergencyNotification").hide();
    $( "input" ).prop( "disabled", false );
})

// send request message
$(document).on('click','#accept', function(e) {
    $("#overlay").hide();
    $("#emergencyNotification").hide();
    $( "input" ).prop( "disabled", false );

    // get all emergency contacts' id
    let senderId = sessionStorage.getItem("user_id");
    // get content and status
    let content = $("#emergencyNotification span.content").text()
    let status = $("#emergencyNotification span.status").text()

    $.ajax({
        type: "GET",
        url: "/users/"+senderId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            let emergencyContacts = jsonObj.emergencyContact
            let senderName = $("#username").text();

            for (let contact in emergencyContacts){
                let receiverId = emergencyContacts[contact].userId;
                let receiverName = emergencyContacts[contact].userName;

                // for each id, find private chatroom
                // save message to the chatroom
                let currentChatRoomId = '';
                let jsonObj;
                $.ajax({
                    type: "GET",
                    url: "/chatroom/private/"+senderId+"/"+receiverId,
                    headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                    success: function(result){
                        jsonObj = JSON.parse(result);
                        if (jsonObj){
                            currentChatRoomId = jsonObj.id;
                            savePrivateMessage(currentChatRoomId, receiverId, receiverName, senderName, senderId, content, status)
                            let emailString = '"' + content + '" sent by ' + senderName + ' with status:" ' + status + '" just now. ';
                            sendEmail(currentChatRoomId, receiverId, emailString)
                        }else{
                            let jsonObject = {
                                userIds: [senderId,receiverId]
                            };
                            $.ajax({
                                type: "POST",
                                url: "/chatroom/private/"+senderId+"/"+receiverId,
                                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                                data: jsonObject,
                                success: function(result){
                                    jsonObj = JSON.parse(result);
                                    currentChatRoomId = jsonObj.id;
                                    savePrivateMessage(currentChatRoomId, receiverId, receiverName, senderName, senderId, content, status)
                                    let emailString = content + ', ' + senderName + ', ' + status;
                                    sendEmail(currentChatRoomId, receiverId, emailString)
                                }
                            }).fail(function(jqXHR, textStatus, error) {
                                console.log("error occur when generating private room: " + error);
                            });
                        }
                    }
                }).fail(function(jqXHR, textStatus, error) {
                    console.log("error occur when getting private room: " + error);
                });
            }
        }
    }).fail(function(jqXHR, textStatus, error) {
        window.location.href="/signin";
    });
})

function savePrivateMessage(currentChatRoomId, receiverId, receiverName, senderName, senderId, content, status){
    let jsonObject = {
        roomId: currentChatRoomId,
        name: senderName,
        senderId: senderId,
        receiver: receiverName,
        receiverId: receiverId,
        readOrNot: false,
        content: content,
        status: status
    }
    $.ajax({
        type: "POST",
        url: "/messages/" + currentChatRoomId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObject,
        success: function(result){
            console.log(result);
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when sending a message: " + error);
    });
}

function sendEmail(currentChatRoomId, receiverId, content){
    // for each id find his/her email and send email
    $.ajax({
        type: "GET",
        url: "/users/"+receiverId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let user = JSON.parse(result);

            let jsonObject = {
                privateRoomId : currentChatRoomId,
                content : content,
                userEmail: user.userEmail
            };
            $.ajax({
                type: "POST",
                url: "/users/email",
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: jsonObject,
                success: function(result){
                }
            }).fail(function(jqXHR, textStatus, error) {
                console.log("error occur when sending email: " + error);
            });
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when sending email: " + error);
    });
}