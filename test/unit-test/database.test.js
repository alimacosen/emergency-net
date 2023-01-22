
beforeAll(async () => {

});

beforeEach(() => {
});

test('Should be able to connect to prod db', ()=>{
    process.env['NODE_ENV'] = "prod";
    const database = require("../../models/database.js");
    expect(database.normalConnection._connectionString).toBe("mongodb+srv://fse-s22-esn-sb1:1qaz2wsx@cluster0.jya2l.mongodb.net/ESN?retryWrites=true&w=majority");
});



