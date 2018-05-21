'use strict';

const Hapi = require('hapi');
 
 const server  = Hapi.Server({
 	port: 8000,
 	host: 'localhost'
 });


server.route({
	method: 'GET',
	path: '/',
	handler: (request, h) =>{
		return "Hello, World !";
	}
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});

 const init = async () => {
 	
	await server.start();

	console.log('Server started at', server.info.uri);
 };

 process.on('unhandledRejection', (err) =>{
 	console.log(err);
 	process.exit(1);
 });

 init();