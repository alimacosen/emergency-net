$(document).ready(async function() {
    if(!sessionStorage.getItem("rescue")){
        window.location.href = "/rescue";
    }

    let socket = io();

    let rescue = JSON.parse(sessionStorage.getItem("rescue"));
    let userId = sessionStorage.getItem("user_id")
    let result = await $.ajax({
        type: "GET",
        url: "/rescues/" + rescue.id,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") }
    }).fail(function(jqXHR, textStatus, error) {
        if(jqXHR.status == 401 || jqXHR.status == 403){
            alert("Session time out. Please login again.");
            window.location.href="/signin";
        }else if(jqXHR.status == 406){
            alert("You can't be the rescuer yourself.");
        }else{
            alert("Something weng wrong. Please contact IT for advanced help.");
        }
    });

    let returnRes = JSON.parse(result);
    rescue = returnRes.data.rescue;

    let init = () => {
        $("#cancel-group").hide();  
        if(rescue.rescueStatus === 0){
            if(rescue.citizenId === userId){
                $("#cancel").show();
                $("#confirm").hide();
                $("#accomplish").show();
            }else{
                $("#cancel").hide();
                $("#confirm").show();
                $("#accomplish").hide();
            }
        }else if(rescue.rescueStatus === 1){
            if(rescue.citizenId != userId && rescue.rescuerId != userId){
                window.location.href = "/rescue";
            }
            if(rescue.citizenId === userId){
                $("#accomplish").show();
            }else{
                //TODO shouldn't show until the locations are close
                $("#accomplish").show();
            }
            $("#cancel").show();
            $("#confirm").hide();
        }else{
            window.location.href = "/rescue";
        }
    }

    init();

    let mapCenter = true;

    mapboxgl.accessToken = 'pk.eyJ1IjoiaHNpbnl1bHUiLCJhIjoiY2wxanlsaHVnMXdodzNqcDhsaDYzanplMCJ9.DFVfohJnpDPA5vuZ7eF1Jw';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [rescue.citizenLongitude, rescue.citizenLatitude],
        zoom: 15
    });

    $("#back-rescue").click(function(){
        window.location.href="/rescue";
    });

    $("#set-center").click(function(){
        mapCenter = true;
        console.log('Set center.');
        if(!rescue.rescuerId){
            map.setCenter(new mapboxgl.LngLat(rescue.citizenLongitude, rescue.citizenLatitude));
        }else{
            getRoute();
        }
    });

    $("#confirm").click(function(){
        confirmRescue("CONFIRM");
    });

    $("#accomplish").click(function(){
        updateRescueStatus("ACCOMPLISH");
    });

    $("#cancel").click(function(){
        $("#cancel").hide();
        $("#confirm").hide();
        $("#accomplish").hide();
        $("#cancel-group").show();
    });

    $("#no-button").click(function(){
        init();
    });

    $("#yes-button").click(function(){
        updateRescueStatus("CANCEL");
    });

    let confirmRescue = (action) => {
        let rescueStatus = -1;
        if (action === "CONFIRM"){
            rescueStatus = 1;
            $.ajax({
                type: "PATCH",
                url: "/rescues/" + rescue.id + "/match",
                headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                data: {rescueStatus: rescueStatus},
                success: function(result){
                    let returnRes = JSON.parse(result);
                    rescue = returnRes.data.returnRescue;
                    init();
                    listenToLocationUpdate();
                }
            }).fail(function(jqXHR, textStatus, error) {
                if(jqXHR.status == 401 || jqXHR.status == 403){
                    alert("Session time out. Please login again.");
                    window.location.href="/signin";
                }else if(jqXHR.status == 406){
                    alert("You can't be the rescuer yourself.");
                }else{
                    alert("Something weng wrong. Please contact IT for advanced help.");
                }
            });
        }else{
            return;
        }
    }

    let updateRescueStatus = (action) => {
        let rescueStatus = -1;
        if (action === "ACCOMPLISH"){
            rescueStatus = 2;
        }else if(action === "CANCEL"){
            rescueStatus = 3;
        }else{
            return;
        }
        $.ajax({
            type: "PATCH",
            url: "/rescues/" + rescue.id + "/status",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: {rescueStatus: rescueStatus},
            success: function(result){
                window.location.href = "/rescue";
                let returnRes = JSON.parse(result);
                //TODO finish or cancel the rescue;
            }
        }).fail(function(jqXHR, textStatus, error) {
            if(jqXHR.status == 401 || jqXHR.status == 403){
                alert("Session time out. Please login again.");
                window.location.href="/signin";
            }else{
                alert("Something weng wrong. Please contact IT for advanced help.");
            }
        });
    }

    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
    }

    //remove map auto center
    map.on('touchstart', () => {
        mapCenter = false;
        console.log('A touchstart event occurred.');
    });

    let addDestinationDot = () => {
        map.addLayer({
            id: 'destination',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [rescue.citizenLongitude, rescue.citizenLatitude]
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#e10000'
            }
        });
    }

    let registerRescueStatusChange = () => {
        socket.on('rescue status change', function(returnRescue){
            let jsonObj = JSON.parse(returnRescue);
            console.log(jsonObj);
            if(rescue.id === jsonObj.id){
                console.log(jsonObj);
                rescue = jsonObj;
                if(rescue.rescueStatus == 2){
                    alert("The rescue request has accomplished. Please go back to Rescue Lists Page.");
                    return window.location.href="/rescue";
                }else if(rescue.rescueStatus == 3){
                    alert("The rescue request has canceled. Please go back to Rescue Lists Page.");
                    return window.location.href="/rescue";
                }
                if(jsonObj.citizenId != userId && jsonObj.rescuerId != userId){
                    alert("The rescue request has been taken. Please go back to Rescue Lists Page.");
                    return window.location.href="/rescue";
                }
            }
        });
    }

    map.on('load', () => {
        // Add destination point to the map
        addDestinationDot();
        // if user us a citizen, listen to socket
        if (rescue.citizenId === userId){
            getRoute();
            socket.on('LOCATIONUPDATE'+rescue.id, function(location){
                console.log(location);
                let jsonObj = JSON.parse(location);
                rescue.rescuerLongitude = jsonObj.rescuerLongitude;
                rescue.rescuerLatitude = jsonObj.rescuerLatitude;
                getRoute();
            });
        }
        registerRescueStatusChange();
        socket.on("enforced-logout", function() {
            enforcedLogOut();
        })
    });

    let updateLocationToServer = () => {
        $.ajax({
            type: "PATCH",
            url: "/rescues/" + rescue.id + "/location",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: {
                rescuerLongitude: rescue.rescuerLongitude, 
                rescuerLatitude:rescue.rescuerLatitude
            },
            success: function(result){
                console.log("updateLocationToServer");
                // let returnRes = JSON.parse(result);
                // rescue = returnRes.data.returnRescue;
                // init();
            }
        }).fail(function(jqXHR, textStatus, error) {
            if(jqXHR.status == 401 || jqXHR.status == 403){
                alert("Session time out. Please login again.");
                window.location.href="/signin";
            }else{
                alert("Something weng wrong. Please contact IT for advanced help.");
            }
        });
    }

    let listenToLocationUpdate = () => {
        let id, target, options;

        let success = (pos) => {
            let crd = pos.coords;
            rescue.rescuerLongitude = crd.longitude;
            rescue.rescuerLatitude = crd.latitude;
            if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
                console.log('Congratulations, you reached the target');
                navigator.geolocation.clearWatch(id);
            }else{
                console.log(crd);
                getRoute();
                updateLocationToServer();
            }
        }

        let error = (err) => {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        }

        target = {
            latitude : 0,
            longitude: 0
        };

        options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        id = navigator.geolocation.watchPosition(success, error, options);
    }

    // if user is a rescuer, update rescuer location.
    if (rescue.rescuerId === userId){
        listenToLocationUpdate();
    }

    let setMapCenter = () => {
        if(mapCenter){
            let center;
            if(userId === rescue.rescuerId){
                center = new mapboxgl.LngLat(rescue.rescuerLongitude, rescue.rescuerLatitude);
            }else if(userId === rescue.citizenId){
                center = new mapboxgl.LngLat(rescue.citizenLongitude, rescue.citizenLatitude);
            }
            map.setCenter(center);
        }
    }

    const size = 200;

    function renderDot(){
        const duration = 1000;
        const t = (performance.now() % duration) / duration;
        
        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;
    
        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = `rgba(56, 135, 190, ${1 - t})`;
        context.fill();
        
        // Draw the inner circle.
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(56, 135, 190, 0.8)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();
    
        // Update this image's data with data from the canvas.
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;
    
        // Continuously repaint the map, resulting
        // in the smooth animation of the dot.
        map.triggerRepaint();
    
        // Return `true` to let the map know that the image was updated.
        return true;
    }
 
    // This implements `StyleImageInterface`
    // to draw a pulsing dot icon on the map.
    const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
        
        // When the layer is added to the map,
        // get the rendering context for the map canvas.
        onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },
     
        // Call once before every frame where the icon will be used.
        render: renderDot
    };
    // add the JavaScript here
    // create a function to make a directions request
    async function getRoute(){
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${rescue.rescuerLongitude},${rescue.rescuerLatitude};${rescue.citizenLongitude},${rescue.citizenLatitude}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };
        addPath(geojson);
        addRescuerDot();
        setMapCenter();
    }

    function addPath(geojson) {
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        }else {
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: geojson
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
        }
    }

    function addRescuerDot(){
        if (map.getSource('dot-point')) {
            map.getSource('dot-point').setData({
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [rescue.rescuerLongitude, rescue.rescuerLatitude]
                        }
                    }
                ]
            });
        }else{
            map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
            map.addSource('dot-point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [rescue.rescuerLongitude, rescue.rescuerLatitude]
                            }
                        }
                    ]
                }
            });
            map.addLayer({
                'id': 'layer-with-pulsing-dot',
                'type': 'symbol',
                'source': 'dot-point',
                'layout': {
                'icon-image': 'pulsing-dot'
                }
            });
        }
    }
})
