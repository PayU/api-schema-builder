/// <reference path="./index.js" />

/**
 * Build schema validation for each endpoint by
 * providing it with the swagger file path and
 * configuration options. This function should be called
 * @param {string} swaggerPath - the path for the swagger file
 * @param {ajvValidatorOptions} options - ajv swagger validator options
 */
export function buildSchema(swaggerPath: string, options?: ajvValidatorOptions): Promise<void>

export interface format {
    name: string;
    pattern: string;
}

export interface ajvValidatorOptions {
    ajvConfigBody?: object;
    ajvConfigParams?: object;
    contentTypeValidation?: boolean;
    expectFormFieldsInBody?: boolean;
    formats?: Array<format>;
    keywords?: any;
    makeOptionalAttributesNullable?: boolean;
}
export let AjvValidatorOptions: AjvValidatorOptionsStatic;
export interface AjvValidatorOptionsStatic {
    new(options?: ajvValidatorOptions): AjvValidatorOptions;
}
