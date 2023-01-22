$(document).ready(function() {
    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });
    
    $(".container-fluid").click(function() {
        window.location.href="/chatroom";
    });

    let currentEmail = null;

    $.ajax({
        type: "GET",
        url: "/users/"+sessionStorage.getItem("user_id"),
        async: false,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            currentUserName = jsonObj.username
            $("#username").text(currentUserName).css("font-weight","Bold");
            $("#role").text(jsonObj.userRole);

            currentEmail = jsonObj.userEmail;
            $(".form-control").attr("placeholder", currentEmail);

            jQuery.each(jsonObj.emergencyContact, function(index, item) {
                currentEC.push(item.userName)
                appendEmergencyContact(item.userName)
            });

            let pendingEC = jsonObj.pendingEmergencyContact;
            jQuery.each(pendingEC, function(index, item) {
                currentEC.push(item)
                addPendingRequest(item)
            });
            
            let requests = jsonObj.emergencyRequest;
            jQuery.each(requests, function(index, item) {
                let username = item.senderName;
                let userId = item.senderId;
                addRequest(username, userId)
            });
            
            updateUserList();
        }
    }).fail(function(jqXHR, textStatus, error) {
        window.location.href="/chatroom";
    });

    function appendEmergencyContact(user) {
        let element = `<p class="h5 d-inline" id="name">${user}<a id="remove" href="#" onclick="event.preventDefault();">(remove)<span class="value">${user}</span></a> </p>`;
        $(".emergencyContacts").append(element);
    }

    // update email information
    function validateEmail(email) {
        var emailReg = /^([\w-\.]+@([\w-]+\.){1,4}(com|net|org|edu))?$/;
        return emailReg.test(email);
    }

    $("#email-update").click(function(){
        let email = $(".form-control").val();
        if(validateEmail(email)) {
            let jsonObj = {
                email: email,
            }
            $.ajax({
                type: "POST",
                url: "/users/useremail",
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: jsonObj,
                success: function(result){
                    $("#emailSucceed").text("Succeed!");
                    $("#emailSucceed").show();
                    $("#accept").prop('disabled', false);
                    currentEmail = email;
                }
            }).fail(function(jqXHR, textStatus, error) {
                console.log("error occur when update email: " + error);

                $("#emailSucceed").text("Failed!");
                $("#emailSucceed").show();
            });
        }
        else{
            $("#emailSucceed").text("Check Your Email Format! It should be formatted in name@example.com and end with '.com .net .org or .edu'");
            $("#emailSucceed").show();
        }
    })

    function addRequest(username, userId) {
        let element = `<div class="h5 p-2" id="request"><b>${username}</b> wants to set you as his/her emergency contact
                    <div class="input-group mt-2">
                    <button id="decline" type="button" class="w-50 btn btn-light">Decline<span class="value d-none">${userId}</span></button>
                    <button id="accept" type="button" class="w-50 input-group-append btn btn-secondary" ${currentEmail == 'name@example.com'?"disabled":""}>Accept<span class="value d-none">${userId}</span></button>
                </div>
            </div>`;
        
        $(".request-list").prepend(element);
    }

    socket.on('emergency contact request', function(request){
        let jsonObj = JSON.parse(request);
        addRequest(jsonObj.senderName, jsonObj.senderId)
    })
    
    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    socket.on('emergency contact response', function(request){
        let jsonObj = JSON.parse(request);
        
        let username = jsonObj.receiverName;
        // if response is true: update emergency contact and request
        if (jsonObj.response == "true"){
            appendEmergencyContact(username)
            $("#pending").filter(function(index){
                return ($("b", this).text() === username);
            }).replaceWith(`<div class="h5 p-2" id="pending">Waiting for <b>${username}</b> to accept your request. <div>(Accepted! ${username} has been added to your Emergency Contact)</div></div>`);
        }
        // if response if true: update userlist and request 
        else{
            $(".dropdown-menu").empty();
            let element = `<a class="dropdown-item">none</a> <div class="dropdown-divider"></div>`
            $(".dropdown-menu").append(element);
            currentEC.splice( $.inArray(username, currentEC), 1 );
            updateUserList();

            $("#pending").filter(function(index){
                return ($("b", this).text() === username);
            }).replaceWith(`<div class="h5 p-2" id="pending">Waiting for <b>${username}</b> to accept your request. <div>(Declined! Please Try Again)</div></div>`);
        }
        $("#requestSucceed").hide();
    })
})

// accept or decline the request
$(document).on('click','#request .input-group .btn',function(e) {
    let decision = $(this).attr("id")
    let userId = $(this).find('span.value').text()

    let jsonObj = {
        senderId: userId,
        receiverName: $("#username").text(),
        response: decision === "accept" ? true : false
    }
    $.ajax({
        type: "POST",
        url: "/users/ECrespond",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            $("#request .input-group").filter(function(index){
                return ($("#decline", this).find('.value').text() === userId);
            }).replaceWith(`<div class="h5 mt-2"><b>${decision==="accept"?"Accepted":"Declined"}</b></div>`);
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when update emergency contact response: " + error);
    });
});

// update userlist
let currentUserName = null; 
let currentEC = [];
function updateUserList(){
    $.ajax({
        type: "GET",
        url: "/users/alluser",
        async: false,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            let usersInfo = jsonObj.data;
            let element =  ``;

            for (let i = 0; i < usersInfo.length; i++) {
                let username = usersInfo[i].username;
                let userId = usersInfo[i].userId;
                
                if (username != currentUserName && jQuery.inArray(username, currentEC) == -1){
                    element = element + `<a class="dropdown-item">${username}<span class="value">${userId}</span></a>`;
                }
            }

            $(".dropdown-menu").append(element);
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when load all user: " + error);
    });
}

// remove current emergency contact
$(document).on('click','.emergencyContacts p a',function(e) {
    let username = $(this).find('.value').text();
    let jsonObj = {
        username: username,
    }
    $.ajax({
        type: "POST",
        url: "/users/removeContact",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            // remove contact from the list
            $(".emergencyContacts p").filter(function(index){
                return $("a", this).find('.value').text() === username;
            }).empty();

            // add user to the user list
            $(".dropdown-menu").empty();
            let element = `<a class="dropdown-item">none</a> <div class="dropdown-divider"></div>`
            $(".dropdown-menu").append(element);
            currentEC.splice( $.inArray(username, currentEC), 1 );
            updateUserList();
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when update email: " + error);
    });
});

// send request message
$(document).on('click','.dropdown-menu a', function(e) {
    let requestuserId = $(this).find('span.value').text();
    let requestuserName = $(this).contents().get(0).nodeValue;
    if (requestuserName == "none"){
        return;
    }

    let jsonObj = {
        receiverId: requestuserId,
        receiverName: requestuserName,
        senderName: currentUserName
    }
    $.ajax({
        type: "POST",
        url: "/users/ECrequest",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            $("#requestSucceed").text("Request Send, waiting for responses");
            $("#requestSucceed").show();
            addPendingRequest(requestuserName)

            // add user to the user list
            $(".dropdown-menu").empty();
            let element = `<a class="dropdown-item">none</a> <div class="dropdown-divider"></div>`
            $(".dropdown-menu").append(element);
            currentEC.push(requestuserName)
            updateUserList();
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when send emergency contact request: " + error);

        $("#requestSucceed").text("Request Failed!");
        $("#requestSucceed").show();
    });
})

function addPendingRequest(username){
    let element = `<div class="h5 p-2" id="pending">Waiting for <b>${username}</b> to accept your request. 
        </div>`;
    
    $(".request-list").prepend(element);
}