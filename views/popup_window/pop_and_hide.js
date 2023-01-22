$(document).ready(function() {
    // when user agree
    $("#agreePopup").click(function() {
        // update user's ackStatement value
        let jsonObj = {
            ackStatement : true,
        }
        $.ajax({
            type: "POST",
            url: "/users/ack",
            data: jsonObj,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                jsonObj = JSON.parse(result);
                console.log(result)
                if(jsonObj.length != 0){
                    window.location.href="/chatroom";
                }
            }
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
            $("#error").text(message.message);
        });
    });
    $("#disagreePopup").click(function() {
        $.ajax({
            type: "DELETE",
            url: "/sessions/logout",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: {},
            success: function(result){
                window.location.replace("/signin");
            }
        }).fail(function(jqXHR, textStatus, error) {
            message = jqXHR.responseJSON;
            console.log(message)
        });
    });

    // when user what to find this information again
    // $("#showPopup").click(function() {
    //     $(".popup-overlay").fadeTo(100, 1);
    //     $(".popup-cover").fadeTo(100, 1);
    //     $("#agreePopup").click(function() {
    //         $(".popup-overlay").fadeOut(100);
    //         $(".popup-cover").fadeOut(100);
    //     });
    //     $("#disagreePopup").hide();
    // });
});