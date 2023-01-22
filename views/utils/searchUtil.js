const STOP_WORDS = ['a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and',
    'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do',
    'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers',
    'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like',
    'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on',
    'only', 'or', 'other', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some',
    'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us',
    'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
    'would', 'yet', 'you', 'your']

let filterSearchInput = (searchInput) => {
    const whitespace = " ";
    let words = searchInput.split(whitespace);
    let cleanedSearchInput = "";
    words.forEach( word => {
        if (!STOP_WORDS.includes(word) && word.length > 0) {
            cleanedSearchInput += word;
            cleanedSearchInput += whitespace;
        }
    });
    return cleanedSearchInput.trim();
}

let cleanSearchCheck = (searchInput) => {
    let cleanSearchInput = filterSearchInput(searchInput);
    if (cleanSearchInput.length === 0) {
        alert("Search input is either empty or all words are stop-words");
    }
    return cleanSearchInput;
}

let getSearchAPIusername = (searchInput) => {
    return '/users' + '?searchRule=username&searchArg=' + searchInput;
}

let getSearchAPIstatus = (searchInput) => {
    return '/users' + '?searchRule=userStatus&searchArg=' + searchInput;
}

let getSearchAPIannouce = (searchInput) => {
    searchInput = cleanSearchCheck(searchInput)
    if (searchInput.length === 0){
        return;
    }
    return '/announcements' + '?searchRule=announcement&searchArg=' + searchInput;
}

let getSearchAPIpublic = (roomId, searchInput) =>{
    searchInput = cleanSearchCheck(searchInput)
    if (roomId == null || searchInput.length === 0){
        return;
    }
    return "/messages/" + roomId + "?searchRule=message&searchArg=" + searchInput;
}

let getSearchAPIprivate = (roomId, searchInput) =>{
    if (isSearchUserStatusHistory(searchInput)) {
        return "/messages/" + roomId;
    }
    return getSearchAPIpublic(roomId, searchInput);
}

let isSearchUserStatusHistory = (searchInput) => {
    return searchInput.toUpperCase() === 'status'.toUpperCase();
}

let getSearchAPIUrl = (searchInput, mainOption, roomId) => {
    switch (mainOption) {
        case 'username':
            return getSearchAPIusername(searchInput);
        case 'userstatus':
            return getSearchAPIstatus(searchInput);
        case 'announcement':
            return getSearchAPIannouce(searchInput);
        case 'private':
            return getSearchAPIprivate(roomId, searchInput);
        case 'public':
            return getSearchAPIpublic(roomId, searchInput);
        default:
            alert("Invalid search option");
            return;
    }
}

let callSearchAPI = (searchInput, searchUrl, searchUIHandler) => {
    if (searchUrl == null) {
        return searchUIHandler({});
    }
    $.ajax({
        type: "get",
        url: searchUrl,
        headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
        success: function(result) {
            let searchResultJson = JSON.parse(result);
            searchUIHandler(searchResultJson, searchInput);
        }
    }).fail(function(jqXHR, textStatus, error) {
        console.log("Search error occur: " + error);
    });
}
