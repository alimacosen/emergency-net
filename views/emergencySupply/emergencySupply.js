$(document).ready(function() {
    let supplies = new Map()
    supplies.set("food",new Array())
            .set("water",new Array())
            .set("medkit",new Array())
            .set("clothes",new Array())
            .set("blanket",new Array())

    let socket = io({
        auth: {
            userID: sessionStorage.getItem("user_id")
        }
    });

    $("#back-esn").click(function(){
        window.location.href="/chatroom";
    });

    $.ajax({
        type: "GET",
        url: "/users/"+sessionStorage.getItem("user_id"),
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            username = jsonObj.username;
            userId = sessionStorage.getItem("user_id");
            userStatus = jsonObj.userStatus;
            clear_confirmation_window()
        }
    }).fail(function(jqXHR, textStatus, error) {
        window.location.href="/chatroom";
    });

    $.ajax({
        type: "GET",
        url: "/emergencySupplies/",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            if (jsonObj.length>0){
                let emergencySupplies = jsonObj.sort(getSortByQuantity);
                for (let i = 0; i < emergencySupplies.length; i++) {
                    let lastModifiedDate = new Date(emergencySupplies[i].lastModifiedDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
                    let provider = emergencySupplies[i].provider;
                    let providerId = emergencySupplies[i].providerId;
                    let type = emergencySupplies[i].type;
                    let quantity = emergencySupplies[i].quantity;
                    let element = composeEmergencySupply(provider, providerId, type, quantity, lastModifiedDate);
                    if (provider === username){
                        let selfElement = composeSelfEmergencySupply(provider, providerId, type, quantity, lastModifiedDate);
                        $("#self_shared_supplies_directory").append(selfElement);
                    }
                    let supply = supplies.get(type);
                    supply.push(emergencySupplies[i])
                    supplies.set(type,supply)
                    $("#"+type+"-container").append(element)
                }
                window.scrollTo(0, document.body.scrollHeight);
            }
        }
    });

    function clear_confirmation_window(){
        error_add.hide();
        error_input.hide();
        main_error_box.hide();
        main_error_input.hide();
        main_error_exceed_limit.hide();
        $(".add-food-confirmation").hide();
        $(".add-water-confirmation").hide();
        $(".add-medkit-confirmation").hide();
        $(".add-clothes-confirmation").hide();
        $(".add-blanket-confirmation").hide();
    }

    for(let i = 0; i < supplyTypes.length; i++){
        $("#not-add-" + supplyTypes[i]).click(function() {
            clear_confirmation_window();
            return;
        });
        $( "#pre-add-" + supplyTypes[i]).click(function() {
            if (($("#quantity").val())&&(!isNaN($("#quantity").val()))&&(parseInt($("#quantity").val(),10)>0)){
                if (document.getElementById("self" + supplyTypes[i] + username)){
                    updateHelperAlert();
                    error_add.show();
                    return
                }
                $(".add-" + supplyTypes[i] + "-confirmation").show();
            }else{
                validInputAlert();
                error_input.show();
            }
        });
        $( "#" + supplyTypes[i] + "_add" ).click(function() {
            postAddition(supplyTypes[i])
        });
    }

    let postAddition = (type) =>{
        let jsonObj = {
            provider: username,
            providerId:sessionStorage.getItem("user_id"),
            type: type,
            quantity: $("#quantity").val()
        }
        $.ajax({
            type: "POST",
            url: "/emergencySupplies/",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: jsonObj,
            success: function(result){
                $( "#quantity" ).val("");
                clear_confirmation_window()
            }
        });
    }

    let clearSupplies = (type)=>{
        $("#"+type+"-container").empty();
    }

    socket.on('update emergencySupply directory', function(supply){
        let jsonObj = JSON.parse(supply);
        if (jsonObj.provider === username){
            let selfElement = composeSelfEmergencySupply(jsonObj.provider, jsonObj.providerId, jsonObj.type, jsonObj.quantity, jsonObj.lastModifiedDate);
            $("#self_shared_supplies_directory").append(selfElement);
        }
        let addition = supplies.get(jsonObj.type);
        addition.push(jsonObj)
        addition.sort(getSortByQuantity)
        supplies.set(jsonObj.type,addition)
        clearSupplies(jsonObj.type)
        for (let i = 0; i < addition.length; i++) {
            let lastModifiedDate = new Date(addition[i].lastModifiedDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
            let provider = addition[i].provider;
            let providerId = addition[i].providerId;
            let type = addition[i].type;
            let quantity = addition[i].quantity;
            let element = composeEmergencySupply(provider, providerId, type, quantity, lastModifiedDate);
            $("#"+type+"-container").append(element);
        }
        return;
    });

    let deleteSupplyFromList=(typeList,providerName)=>{
        for (let i = 0; i < typeList.length; i++) {
            if (typeList[i].provider === providerName){
                typeList.splice(i,i+1);
            }
        }
    }

    socket.on('delete supply', function(filter){
        let filterAf = JSON.parse(filter);
        let elId = filterAf.type + filterAf.provider;
        let el = document.getElementById(elId);
        el.remove();
        if (filterAf.provider === username){
            let el2 = document.getElementById("self"+elId);
            el2.remove();
        }
        let supply = supplies.get(filterAf.type);
        deleteSupplyFromList(supply,filterAf.provider)
        supplies.set(filterAf.type,supply)
        return;
    });

    socket.on('update supply', function(filter){
        let filterAf = JSON.parse(filter);
        let elId = filterAf.type + filterAf.provider;
        let el = document.getElementById(elId+"quantity");
        let el_1 = document.getElementById(elId+"date");
        el.innerText = 'Quantity : '+filterAf.quantity;
        el_1.innerText = new Date(filterAf.lastModifiedDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
        if (filterAf.provider === username){
            let el2 = document.getElementById(filterAf.type+"_quantity");
            el2.placeholder = filterAf.quantity;
        }else{
            let el_3 = document.getElementById(filterAf.type + filterAf.providerId);
            el_3.placeholder = filterAf.quantity;
        }
    });

    socket.on("enforced-logout", function() {
        enforcedLogOut()
    })

    let composeEmergencySupply = (provider, providerId, type, quantity, lastModifiedDate) => {
        let firstLetter = provider.charAt(0).toUpperCase();
        let supplyTypeIconImage = getSupplyTypeIconImage(type);
        let supplyTypeIcon = '';
        let element= ``;
        if (supplyTypeIconImage !== '') {
            supplyTypeIcon = `<img src=${supplyTypeIconImage} width="35" height="35"/>`
        };
        if (provider === username){
            element = `
                <div id = "${type}${provider}" class="supply-list supply-list--element">
                    <div class="supply-list_content">
                        <div class="col-1 display-5 text-secondary font-weight-bolder align-self-top">${firstLetter} ${supplyTypeIcon}</div>
                        <div class="supply-list_detail mx-2">
                            <p><b>${provider}</b> share some ${type}!</p>
                            <p id = "${type}${provider}quantity" class="text-muted">Quantity : ${quantity}</p>
                            <p id = "${type}${provider}date" class="text-muted"><small>${lastModifiedDate}</small></p>
                        </div>
                     </div>
                </div>`;
        }else{
            element = `
                <div id = "${type}${provider}" class="supply-list supply-list--element">
                    <div class="supply-list_content">
                        <div class="col-1 display-5 text-secondary font-weight-bolder align-self-top">${firstLetter} ${supplyTypeIcon}</div>
                        <div class="supply-list_detail mx-2">
                            <p><b id = "${type}${providerId}name">${provider}</b> share some ${type}!</p>
                            <p id = "${type}${provider}quantity" class="text-muted">Quantity : ${quantity}</p>
                            <input type="text" id="${type}${providerId}" maxlength="2" size="2" placeholder="${quantity}">
                            <button type="button" class="btn btn-primary mb-2" value = "${providerId}">Request</button>
                            <p id = "${type}${provider}date" class="text-muted"><small>${lastModifiedDate}</small></p>
                        </div>
                     </div>
                </div>`;
        }
        return element;
    }

    let composeSelfEmergencySupply = (provider, providerId, type, quantity, lastModifiedDate) => {
        let supplyTypeIconImage = getSupplyTypeIconImage(type);
        let supplyTypeIcon = '';
        if (supplyTypeIconImage !== '') {
            supplyTypeIcon = `<img src=${supplyTypeIconImage} width="35" height="35"/>`
        };
        let element = `
                    <div id = "self${type}${provider}"class="row border-bottom">
                        <div class="col-sm-9">
                            <li ><a class="dropdown-item" href="#">${supplyTypeIcon} ${type}</a></li>
                            <div class="row">
                                <div class="col-4 col-sm-6">
                                Quantity:
                                <input type="text" id="${type}_quantity" maxlength="2" size="2" placeholder=${quantity}>
                                </div>
                                <div class="col-3 col-sm-6">
                                    <button type="button" id="${type}_update" class="btn btn-primary mb-2">Update</button>
                                </div>
                                <div class="col-1 col-sm-6">
                                    <button type="button" id="${type}_delete" class="btn btn-primary mb-2">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
        return element;
    }

    let getSortByQuantity = () => {
        return (supply1,supply2) =>
            (parseInt(supply1.quantity,10) - parseInt(supply2.quantity,10))
    }


})
let username = new String();
let userId = new String();
let userStatus = new String();
let error_add = $("#invalid-addition");
let error_input = $("#invalid-input-quantity");
let main_error_box = $("#main_error_page");
let main_error_input = $("#main_invalid-input-quantity");
let main_error_exceed_limit = $("#main_limit");
let supplyTypes = ["food","water","medkit","blanket","clothes"]

let initialDeleteFunction=()=>{
    for (let i = 0; i < supplyTypes.length; i++){
        $(document).on('click','#'+supplyTypes[i]+'_delete',function(e) {
            postDelete(supplyTypes[i]);
        });
    }
}

let initialUpdateFunction=()=>{
    for (let i = 0; i < supplyTypes.length; i++){
        $(document).on('click','#'+supplyTypes[i]+'_update',function(e) {
            if (($("#"+supplyTypes[i]+"_quantity").val())&&(!isNaN($("#"+supplyTypes[i]+"_quantity").val()))&&(parseInt($("#"+supplyTypes[i]+"_quantity").val(),10)>0)){
                postEmergencySupplyUpdate(supplyTypes[i],$("#"+supplyTypes[i]+"_quantity").val());
            }else{
                validInputAlert();
                error_input.show();
            }
        })
    }
}

let initialPostRequestFunction=()=>{
    for (let i = 0; i < supplyTypes.length; i++){
        $(document).on('click',"#"+supplyTypes[i]+"-container div div div button",function(e) {
            if (($("#"+supplyTypes[i]+this.value).val())&&(!isNaN($("#"+supplyTypes[i]+this.value).val()))&&(parseInt($("#"+supplyTypes[i]+this.value).val(),10)>0)){
                if(parseInt($("#"+supplyTypes[i]+this.value).attr('placeholder'),10) < parseInt($("#"+supplyTypes[i]+this.value).val(),10)){
                    exceedLimitInputAlert();
                    return;
                }
                let providerId = this.value
                postEmergencySupplyRequest(username,userId,$("#"+supplyTypes[i]+providerId+"name").text(),providerId,supplyTypes[i],$("#"+supplyTypes[i]+providerId).val())
            }else{
                validInputAlert();
                main_error_box.show();
                main_error_input.show();
                window.scrollTo(0, 0);
            }
        });
    }
}

initialDeleteFunction();
initialUpdateFunction();
initialPostRequestFunction();

let validInputAlert=()=>{
    alert("The number entered is not valid! Please enter a valid number!");
}
let exceedLimitInputAlert=()=>{
    alert("The number entered exceeds the provider's limit! Please enter a valid number!");
    main_error_box.show();
    main_error_exceed_limit.show();
    window.scrollTo(0, 0);
}

let updateHelperAlert=()=>{
    alert("Please use Update instead of Adding!");
}

let sendRequestMessage = (request)=>{
    let requestAf = JSON.parse(request);
    let requesterId = requestAf.requesterId;
    let providerId = requestAf.providerId;
    let provider = requestAf.provider;
    let requestId = requestAf.id;
    $.ajax({
        type: "GET",
        url: "/chatroom/private/"+requesterId+"/"+providerId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result){
            let jsonObj = JSON.parse(result);
            if (jsonObj){
                postRequestMessage(jsonObj.id,requesterId,provider,providerId,requestId,requestAf.type,requestAf.quantity)
            }else{
                let jsonObject = {
                    userIds: [requesterId,providerId]
                };
                $.ajax({
                    type: "POST",
                    url: "/chatroom/private/"+requesterId+"/"+providerId,
                    headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
                    data: jsonObject,
                    success: function(result){
                        jsonObj = JSON.parse(result);
                        postRequestMessage(jsonObj.id,requesterId,provider,providerId,requestId,requestAf.type,requestAf.quantity)
                    }
                }).fail(function(jqXHR, textStatus, error) {
                    console.log("error occur when chatting privately: " + error);
                });
            }
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when chatting privately: " + error);
    });
}

let postEmergencySupplyRequest=(requester,reqeusterId,provider,providerId,type,quantity)=>{
    let jsonObj = {
        requester: requester,
        requesterId: reqeusterId,
        provider: provider,
        providerId:providerId,
        type: type,
        quantity: quantity,
        response: "None",
    }
    $.ajax({
        type: "POST",
        url: "/emergencySupplyRequest/",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            sendRequestMessage(result)
        }
    });
}

let postRequestMessage = (chatRoomId,requesterId,provider,providerId,requestId,type,quantity) =>{
    let jsonObject = {
        roomId: chatRoomId,
        name: username,
        senderId: requesterId,
        receiver: provider,
        receiverId: providerId,
        readOrNot: false,
        requestId: requestId,
        content: username + " requests for "+type + " with quantity : "+quantity,
        status: userStatus
    }
    $.ajax({
        type: "POST",
        url: "/messages/" + chatRoomId,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObject,
        success: function(result){
            window.location.href="/chatroom";
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("error occur when sending a message: " + error);
    });
}

let postEmergencySupplyUpdate = (type,quantity) =>{
    let jsonObj = {
        provider: username,
        type: type,
        quantity: quantity
    }
    $.ajax({
        type: "PUT",
        url: "/emergencySupplies/",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            console.log(result)
        }
    });
}

let postDelete = (type)=>{
    let jsonObj = {
        provider: username,
        type: type,
    }
    $.ajax({
        type: "Delete",
        url: "/emergencySupplies/",
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        data: jsonObj,
        success: function(result){
            console.log(result)
        }
    });
}