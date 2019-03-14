let _ =require('lodash');
const Tester = require('./Tester');

class TesterFactory {
    constructor(schemas, options){
        this.schemas = schemas
        this.options = options;
    }
    createTester(){
        return new Tester( this.schemas, this.options )
    }
}

module.exports = TesterFactory
