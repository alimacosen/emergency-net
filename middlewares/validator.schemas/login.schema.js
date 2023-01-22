const Joi = require('joi') 

const schemas = { 
  login: Joi.object().keys({ 
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),

  resgistration: Joi.object().keys({ 
    username: Joi.string().required(),
    password: Joi.string().required(),
  })
}; 

module.exports = schemas;