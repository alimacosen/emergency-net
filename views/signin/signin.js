import { BANNED_USERNAME } from "./banned_username_list.js";

$(document).ready(function() {
    $( "#signin" ).click(function() {
        let username = $("#username").val();

        let error_box = $(".error-message").eq(0);
        let error_user = $("#invalid-username");
        let error_psw = $("#invalid-password");
        let error_both = $("#invalid-both");
        let error_user_taken = $("#taken-username");

        function clear_error_window(){
            error_box.hide();
            error_user.hide();
            error_psw.hide();
            error_both.hide();
            error_user_taken.hide();
            $(".register-confirmation").hide();
        }

        // TODO
        // 4 functions below need refactor, cuz duplicated codes
        // identify the error type and write in one single printError function
        function print_username_error(){
            error_box.show();
            error_user.css('display', 'inline');
        }
        function print_password_error(){
            // print password error
            error_box.show();
            error_psw.css('display', 'inline');
        }
        function print_all_error(){
            // print username error and password error
            error_box.show();
            error_both.css('display', 'inline');
        }
        function print_username_taken_error(){
            error_box.show();
            error_user_taken.css('display', 'inline');
        }

        clear_error_window();
        
        // show error messages
        if (!validateUsername(username)) {
            if ($("#password").val().length < 4) {
                print_all_error();
                return;
            }
            print_username_error();
            return;
        }

        if ($("#password").val().length < 4) {
            print_password_error();
            return;
        }

        // check if username and password can be used to log in
        let jsonObj = {
            username: $("#username").val(), 
            password: CryptoJS.MD5($("#password").val()).toString()
        }

        $.ajax({
            type: "POST",
            url: "/sessions/login",
            data: jsonObj,
            success: function (result) {
                let res = JSON.parse(result);
                sessionStorage.setItem('authorization', res.token);
                sessionStorage.setItem('user_id', res.userId);
                sessionStorage.setItem('user_role', res.userRole);
                if (res.length != 0) {
                    if (res.ackStatement) {
                        window.location.href = "/chatroom";
                    } else {
                        window.location.href = "/acknowledge";
                    }
                }
            }
        }).fail(function(jqXHR, textStatus, error) {
            let message = jqXHR.responseJSON;
            $("#error").text(message.message);
            // username already exist
            // need to reenter password, or change username
            if (message.message == "Username banned."){
                window.location.href = "/informing_message"
                return
            }
            if (message.message == "Username exist."){
                print_username_taken_error();
                return;
            }

            // no matching data found, need confirmation to register
            $(".register-confirmation").show();
            
        });
    });

    $('#username').keypress(function(event){
        if(event.keyCode==13)
        $('#signin').click();
    });

    $('#password').keypress(function(event){
        if(event.keyCode==13)
        $('#signin').click();
    });

    $("#not-register").click(function() {
        $(".register-confirmation").hide();
        return
    });

    $("#register").click(function() {
        let jsonObj = {
            username: $("#username").val(), 
            password: CryptoJS.MD5($("#password").val()).toString()
        }
        $.ajax({
            type: "POST",
            url: "/sessions/registration",
            data: jsonObj,
            success: function(result){
                let res = JSON.parse(result);
                sessionStorage.setItem('authorization', res.token);
                sessionStorage.setItem('user_id', res.userId);
                sessionStorage.setItem('user_role', 'Citizen');
                if(res.length != 0){
                    window.location.href="/acknowledge";
                }
            }
        }).fail(function(jqXHR, textStatus, error) {
            let message;
            message = jqXHR.responseJSON;
            $("#error").text(message.message);
        });
    });
});

function validateUsername(username) {
    return validateBannedUsernameList(username) && validateMinInputSize(username, 3);
}

function validateBannedUsernameList(username) {
    return !BANNED_USERNAME.includes(username);
}

function validateMinInputSize(input, size) {
    return input.length >= size;
}

function changeActiveStatus(username, activeStatus) {
    let jsonObj = {
        username: username,
        activeStatus: activeStatus,
    }
    $.ajax({
        type: "POST",
        url: "/users/actstatus",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            let res = JSON.parse(result);
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when changing activeStatus: " + error);
    });
}

function printError(errorType) {
    // TODO refactor
}