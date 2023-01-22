function enforcedLogOut(){
    $.ajax({
        type: "DELETE",
        url: "/sessions/logout",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            sessionStorage.clear();
            window.location.replace("/informing_message");
    }
});}