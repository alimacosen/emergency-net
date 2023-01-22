const logger = require("../loggers/logger");

exports.getFilter = (query) => {
    const filter = {};
    if (query.searchRule && query.searchArg) {
        let filterAttribute = mapSearchRuleInfo(query.searchRule);
        filter[filterAttribute] = getRegexForSearchArg(query.searchArg);
    }
    return filter
}

/**
 *  Get regex pattern for mongoose search filter
 *  Reference: https://www.mongodb.com/docs/manual/reference/operator/query/regex
 *  options: i stands for case-insensitive filtering
 * @param searchArg search argument
 * @returns {{}} ex. { $regex: <regex-pattern>, $options: <filter-option> }
 */
getRegexForSearchArg = (searchArg) => {
    const regex = {};
    regex.$regex = getPartialWordMatchRegex(searchArg);
    regex.$options = 'i';
    return regex;
}

/**
 * Build up regex supports match multiple words with any order
 * example for word1 and word2: '^(?=.*word1)(?=.*word2).*$'
 * @param searchArg search argument
 * @returns {string} regex
 */
getPartialWordMatchRegex = (searchArg) => {
    const wordList = searchArg.split(" ");
    let regex = '^';
    wordList.forEach( word => {
        regex += partialMatchRegex(word);
    });
    regex += '.*$';
    return regex;
}

partialMatchRegex = (word) => {
    return `(?=.*${word})`;
}

/**
 * Mapping from query search rule => data scheme attribute and whether isExactMatch
 * @param searchRule query param we use in searching
 * @returns filterAttribute
 */
mapSearchRuleInfo = (searchRule) => {
    let filterAttribute;
    switch (searchRule) {
        case 'username':
            filterAttribute = 'username';
            break;
        case 'userStatus':
            filterAttribute = 'userStatus';
            break;
        case 'announcement':
        case 'message':
            filterAttribute = 'content';
            break;
        default:
            filterAttribute = 'content';
            logger.warn("Unexpected search rule criteria");
    }
    return filterAttribute;
}
