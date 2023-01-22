import { BANNED_USERNAME } from "../signin/banned_username_list.js";

let userElements = new Map(); //{<userName>: <user.data>}
let adminAmount = 0;

$(document).ready(function() {
    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })

    if (sessionStorage.getItem("user_role") == 'Citizen' || sessionStorage.getItem("user_role") == 'Coordinator'){
        window.location.href="/chatroom";
    }
    
    $(".container-fluid").click(function() {
        window.location.href="/chatroom";
    });

    updatePage();
});

function updatePage(){
    $.ajax({
        type: "GET",
        url: "/users/alluser",
        async: false,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            let usersInfo = jsonObj.data;

            for (let i = 0; i < usersInfo.length; i++) {
                addUser(usersInfo[i])
                userElements.set(usersInfo[i].username, usersInfo[i])
                if (usersInfo[i].userRole == 'Administrator'){
                    adminAmount += 1;
                }
            }
        }
    }).fail(function(jqXHR, textStatus, error) {
        window.location.href="/chatroom";
    });
}

function addUser(user) {
    let element = `<div id="user">
        <hr class="rounded">
        <h4>${user.username}<button type="button" class="btn position-absolute end-0 p-0" style="font-size:20px;"><span class="bi bi-gear-fill"></span></button></h4>
        </div>`
    
    $("#user-list").append(element);
}

function addBoard(user) {
    let disableBtn = false;
    if (user.userRole == 'Administrator' && adminAmount == 1){
        disableBtn = true;
    }
    let manageBoardElement = `<div id="manage" class="rounded row p-2 mb-2 border border-dark">
        <div class="col-6"><label class="h5 pt-1 justify-content-center w-100" for="username"><strong>Username</strong></label></div>
        <div class="col-6"><input class="w-100" type="text" id="username" placeholder="${user.username}" /></div>

        <div class="col-6"><label class="h5 pt-1 justify-content-center w-100" for="password"><strong>Password</strong></label></div>
        <div class="col-6"><input class="w-100" type="text" id="password" placeholder="******" /></div>

        <div class="col-6"><label class="h5 pt-1 justify-content-center w-100" for="role"><strong>Privilege Level</strong></label></div>
        <div class="col-6" id="role">
            <div class="custom-control custom-radi">
                <input class="custom-control-input" type="radio" name="customRadio" id="customRadio1" value="Citizen" ${user.userRole == 'Citizen'?"checked":""} ${disableBtn?"disabled":""}>
                <label class="custom-control-label" for="customRadio1">
                Citizen
                </label>
            </div>
            <div class="custom-control custom-radi">
                <input class="custom-control-input" type="radio" name="customRadio" id="customRadio2" value="Coordinator" ${user.userRole == 'Coordinator'?"checked":""} ${disableBtn?"disabled":""}>
                <label class="custom-control-label" for="customRadio2">
                    Coordinator
                </label>
            </div>
            <div class="custom-control custom-radi">
                <input class="custom-control-input" type="radio" name="customRadio" id="customRadio3" value="Administrator" ${user.userRole == 'Administrator'?"checked":""} ${disableBtn?"disabled":""}>
                <label class="custom-control-label" for="customRadio3">
                    Administrator
                </label>
            </div>
        </div>

        <div class="col-6"><label class="h5 pt-1 justify-content-center w-100" for="flexSwitchCheckDefault"><strong>Account Status</strong></label></div>
        <div class="col-6">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" ${user.accountStatus?"checked":""} ${disableBtn?"disabled":""} />
                <span>${user.accountStatus?"Active":"Inactive"}</span>
            </div>
        </div>

        <div class="col-6"><button class="btn btn-outline-secondary w-100" id="cancel">Cancel</button></div>
        <div class="col-6"><button class="btn btn-secondary w-100" id="update" value="${user.userId}">Update</button></div>
    </div>`;
    return manageBoardElement;
}

$(document).on('click','#user h4 button', function(e) {
    // disable the option to change other users
    $('#user h4 button').prop("disabled", true);

    let user = userElements.get($(this).parent().text());
    let element = addBoard(user);

    // add manage board
    $($(this).parent().parent()).append(element);
})

$(document).on('click','#cancel', function(e) {
    let manageBoard = $(this).parent().parent()
    manageBoard.remove();

    // enable the option to change other users
    $('#user h4 button').prop("disabled", false);
})

// update account info
$(document).on('click','#update', function(e) {
    let username = $("#username").val();
    let password = $("#password").val();
    let oldUsername = $("#username").attr('placeholder');
    username = username === '' ? oldUsername: username;
    let jsonObj = {
        userId : $(this).attr('value'), 
        username : username,
        password : password,
        role : $("#role").find('div input[type="radio"]:checked').attr('value'),
        status : $("#flexSwitchCheckDefault").is(":checked") ? true: false,
    }

    $("#error").remove();
    if (!validateUsername(username)) {
        // error username message
        $('#manage').append(`<p class="mt-1 mb-0 text-danger" id="error">ERROR: Please enter a valid at least 3 characters username.</p>`)
        return;
    }
    if (password !== '' && password.length < 4) {
        // error all message
        $('#manage').append(`<p class="mt-1 mb-0 text-danger" id="error">ERROR: Password should be at least 4 digits.</p>`)
        return;
    }
    if (userElements.has(username)){
        $('#manage').append(`<p class="mt-1 mb-0 text-danger" id="error">ERROR: Can not user other's username.</p>`)
        return;
    }

    jsonObj.password = "unchange";
    if (password.length > 0) {
        jsonObj.password = CryptoJS.MD5(password).toString();
    }

    $.ajax({
        type: "POST",
        url: "/sessions/update",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            userElements.clear();
            $("#user-list").empty();
            adminAmount = 0;
            updatePage();
            // enable the option to change other users
            $('#user h4 button').prop("disabled", false);
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when update user information: " + error);
    });

})

$(document).on('click','#flexSwitchCheckDefault', function(e) {
    $(this).parent().find('span').text($(this).is(":checked") ? 'Active' : 'Inactive')
})

function validateUsername(username) {
    return validateBannedUsernameList(username) && validateMinInputSize(username, 3);
}

function validateBannedUsernameList(username) {
    return !BANNED_USERNAME.includes(username);
}

function validateMinInputSize(input, size) {
    return input.length >= size;
}