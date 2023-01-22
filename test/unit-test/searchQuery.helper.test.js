const getFilter = require('../../controllers/searchQuery.helper.js').getFilter;

test('System can get username search filter', () => {
    let mockQuery = {
        searchRule: 'username',
        searchArg: 'aa'
    }
    let filter = getFilter(mockQuery);
    expect(filter.username.$regex).toEqual(`^(?=.*${mockQuery.searchArg}).*$`);
    expect(filter.username.$options).toEqual('i');
});

test('System can get userStatus search filter', () => {
    let mockQuery = {
        searchRule: 'userStatus',
        searchArg: 'OK'
    }
    let filter = getFilter(mockQuery);
    expect(filter.userStatus.$regex).toEqual(`^(?=.*OK).*$`);
    expect(filter.userStatus.$options).toEqual('i');
});

test('System can get message search filter', () => {
    let mockQuery = {
        searchRule: 'message',
        searchArg: 'word1'
    }
    let filter = getFilter(mockQuery);
    expect(filter.content.$regex).toEqual(`^(?=.*word1).*$`);
    expect(filter.content.$options).toEqual('i');
});

test('System can get announcement search filter', () => {
    let mockQuery = {
        searchRule: 'announcement',
        searchArg: 'word1'
    }
    let filter = getFilter(mockQuery);
    expect(filter.content.$regex).toEqual(`^(?=.*word1).*$`);
    expect(filter.content.$options).toEqual('i');
});