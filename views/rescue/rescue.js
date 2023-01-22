$(document).ready(function() {
    let userId = sessionStorage.getItem("user_id");

    $("#share-location-spin").hide();

    $("#back-esn").click(function(){
        window.location.href="/chatroom";
    });

    let socket = io();
    socket.on('new rescue', function(rescue){
        let jsonObj = JSON.parse(rescue);
        composeRescueElements(jsonObj)
    });

    socket.on('rescue status change', function(rescue){
        let jsonObj = JSON.parse(rescue);
        console.log(jsonObj);
        // remove old rescue
        $("#rescue-list").children().each(function( index ) {
            let rescueId = $(this).children("button").attr("rescue-id");
            if(jsonObj.id == rescueId){
                $(this).remove();
            }
            console.log($(this).children("button").attr("rescue-id"));
        });
        // compose updated rescue
        composeRescueElements(jsonObj)
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut();
    })
    
    $.ajax({
        type: "GET",
        url: "/rescues/",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let returnRes = JSON.parse(result);
            let rescues = returnRes.data;
            for(let i = 0; i < rescues.length; i++) {
                composeRescueElements(rescues[i]);
            }
        }
    }).fail(function(jqXHR, textStatus, error) {
        if(jqXHR.status == 401 || jqXHR.status == 403){
            alert("Session time out. Please login again.");
            window.location.href="/signin";
        }else{
            alert("Something weng wrong. Please contact IT for advanced help.");
        }
    });

    let buildUpHelp = (rescue) => {
        if(rescue.citizenId == userId){// citizen can view
            return `<button id="view" rescue-id="${rescue.id}" class="w-100 rounded btn resuce-button status-font shadow">VIEW</button>`;
        }else{// other citizen can help
            return `<button id="view" rescue-id="${rescue.id}" class="w-100 rounded btn resuce-button status-font shadow">HELP NOW</button>`;
        }
    }

    let buildUpProcess = (rescue) => {
        if(rescue.citizenId == userId || rescue.rescuerId == userId){// only citizen or rescuer can view progress
            return `<button id="view" rescue-id="${rescue.id}" class="w-100 rounded btn btn-light status-font shadow">PROCESSING</button>`;
        }else{
            return `<span class="d-flex justify-content-center status-font">PROCESSING</span>`;
        }
    }
   
    let composeRescueElements = (rescue) => {
        let button_slot = ``;
        if(rescue.rescueStatus == 0) {// help
            button_slot = buildUpHelp(rescue);
        }else if (rescue.rescueStatus == 1) {// processing
            button_slot = buildUpProcess(rescue);
        }else if (rescue.rescueStatus == 2) {// accomplished
            button_slot = `<span class="d-flex justify-content-center status-font">ACCOMPLISHED</span>`;
        }else{// canceled
            button_slot = `<span class="d-flex justify-content-center status-font">CANCELED</span>`;
        }
        $("#rescue-list").prepend(
            `<div class="mx-3 my-3 px-3 py-3 border rounded rescue-item shadow-sm">
                <h2>Citizen: ${rescue.citizenName}</h2>
                <h3>Location: ${rescue.place}</h3>
                <hr/>
                ${button_slot}
            </div>`
        );
        // after prepend to UI, add event listener
        if(rescue.rescueStatus == 0 || (rescue.rescueStatus == 1 && (rescue.citizenId == userId || rescue.rescuerId == userId))){
            $("#view").click(function(){
                $(this).attr("rescue-id");
                sessionStorage.setItem("rescue", JSON.stringify(rescue));
                window.location.href="/navigation";
            });
        }
    }

    $("#share-location").click(function(){

        $("#share-location").hide();
        $("#share-location-spin").show();

        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
        }

        let showPosition = (position) => {
            shareLocation(position);
        }
        
        let handleError = (error) => {
            let errorStr;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                alert('Please reopen the page and enable location share.');
                errorStr = 'User denied the request for Geolocation.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorStr = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorStr = 'The request to get user location timed out.';
                break;
              case error.UNKNOWN_ERROR:
                errorStr = 'An unknown error occurred.';
                break;
              default:
                errorStr = 'An unknown error occurred.';
            }
            console.error('Error occurred: ' + errorStr);
        }

        navigator.geolocation.getCurrentPosition(showPosition, handleError);

        let shareLocation = async (position) => {
            mapboxgl.accessToken = 'pk.eyJ1IjoiaHNpbnl1bHUiLCJhIjoiY2wxanlsaHVnMXdodzNqcDhsaDYzanplMCJ9.DFVfohJnpDPA5vuZ7eF1Jw';
            const query = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            let address = json.features;
            let city = "";
            if(address[3]){
                city = address[3].text;
            }else{
                city = address[1].text;
            }
            let newRescue = {
                place: city,
                citizenLongitude: position.coords.longitude,
                citizenLatitude: position.coords.latitude,
            }

            $.ajax({
                type: "POST",
                url: "/rescues/",
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: newRescue,
                success: function(result){
                    let data = JSON.parse(result);
                    $("#share-location").show();
                    $("#share-location-spin").hide();
                }
            }).fail(function(jqXHR, textStatus, error) {
                if(error.status == 401 || error.status == 403){
                    alert("Session time out. Please login again.");
                    window.location.href="/signin";
                }else if(jqXHR.status == 409){
                    alert("Request rescue has existed. Please finish or cancel the first rescue to request the second.");
                }else{
                    alert("Something weng wrong. Please contact IT for advanced help.");
                }
                $("#share-location").show();
                $("#share-location-spin").hide();
            });
        }
    })
});