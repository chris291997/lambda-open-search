// AUTHOR           : Chris Benosa
// DATE             : 28/12/2021
// IMPORTANT NOTE   : "Please do not change anything to this file. Ongoing updates and upgrades c/o author"


import yargs, { Arguments } from 'yargs';
import { HandlerTemplate, Type } from './template/HandlerTemplate';
import { SwaggerRequestTemplate } from './template/SwaggerRequestTemplate';
import { SwaggerPathTemplate } from './template/SwaggerPathTemplate';
import { SwaggerResponseTemplate } from './template/SwaggerResponseTemplate';

const commands = yargs(process.argv.slice(2)).options({
    docs: { type: 'boolean', default: false, describe: 'Generate Swagger request, response & path' }, 
});
//! set as true if your ready to use swagger: will generate swaager files kapag set to true


try {

    commands.command(
        'construct:api <name>',
        'Create a new api handler',
        () => {},
        (argv: Arguments) => {
            const template = new HandlerTemplate(<string>argv.name, Type.API);
            template.generate();
            console.log('API Handler successfully created');

            if (argv.docs) {
                const request = new SwaggerRequestTemplate(<string>argv.name);
                request.generate();
                console.log('Swagger definition successfully created');

                const response = new SwaggerResponseTemplate(<string>argv.name);
                response.generate();
                console.log('Swagger definition successfully created');

                const path = new SwaggerPathTemplate(<string>argv.name);
                path.generate();
                console.log('Swagger path successfully created');

            
            }
        },
    );


    commands.strictCommands();
    commands.argv;
} catch (error) {
    console.log(error.message);
}
