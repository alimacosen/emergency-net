const Joi = require('joi') 

const schemas = { 
  setAck: Joi.object().keys({ 
    ackStatement: Joi.string().required()
  }),

  setActStatus: Joi.object().keys({ 
    activeStatus: Joi.string().required()
  }),

  setCurrentStatus: Joi.object().keys({ 
    username: Joi.string().required(),
    userStatus: Joi.string().required()
  }),

  setZipcodeLocation: Joi.object().keys({ 
    zipcode: Joi.string().required()
  }),
}; 

module.exports = schemas;