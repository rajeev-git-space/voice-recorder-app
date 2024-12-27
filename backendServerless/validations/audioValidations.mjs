import Joi from 'joi';

export const validateAddAudio = (input) => {
    const schema = Joi.object({
        chunk_uuid: Joi.string().required(),
        blob_data: Joi.string().required(),
    });
    return schema.validate(input);
};

export const validateMergeAudio = (input) => {
    const schema = Joi.object({
        chunk_uuid: Joi.string().required(),
        recording_name: Joi.string().required(),
    });
    return schema.validate(input);
};

export const validateRemoveAudio = (input) => {
    const schema = Joi.object({
        recording_name: Joi.string().required(),
    });
    return schema.validate(input);
};
