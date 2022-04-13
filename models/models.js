const Joi = require('joi')

module.exports = {
    authModel: Joi.object().options({ abortEarly: false }).keys({
        username: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string().required()
    }).xor('username', 'email'),

    accountModel: Joi.object().options({ abortEarly: false }).keys({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(3).max(30).required(),
        name: Joi.string().min(3).max(30).required(),
        surname: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        type: Joi.valid('student', 'profesor').required()
    }),

    classModel: Joi.object().options({ abortEarly: false }).keys({
        className: Joi.string().required(),
        classDate: Joi.string().required(),
        classHourStart: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/).required(),
        classHourEnd: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/).required(),
        classLink: Joi.string().required(),
        classComponents: Joi.number().min(1).max(5).required(),
        classFormula: Joi.string().required(),
        classOtherPlatforms: Joi.string().required()
    }),

    updateAccountModel: Joi.object().options({ abortEarly: false }).keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().allow(null, ''),
        email: Joi.string().email().required()
    }),

    newsModel: Joi.object().options({ abortEarly: false }).keys({
        newsTitle: Joi.string().required(),
        newsBodyInput: Joi.string().required(),
    }),

    assignmentModel: Joi.object().options({ abortEarly: false }).keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        deadline_date: Joi.string().regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/).required(),
        deadline_hour: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    })
}