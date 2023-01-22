const Joi = require('joi') 

const schemas = { 
  rescuePost: Joi.object().keys({ 
    place: Joi.string().required(),
    citizenLongitude: Joi.number().required(),
    citizenLatitude: Joi.number() .required()
  }),

  updateRescueStatus: Joi.object().keys({ 
    rescueStatus: Joi.number().greater(-1).less(4).required(),
  }),

  confirmRescue: Joi.object().keys({ 
    rescueStatus: Joi.number().greater(-1).less(4).required(),
  }),

  updateRescuerLocation: Joi.object().keys({ 
    rescuerLongitude: Joi.number().required(),
    rescuerLatitude: Joi.number().required()
  }),

}; 
module.exports = schemas;