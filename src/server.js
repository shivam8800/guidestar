'use strict';

const Hapi = require('hapi');
import routes from './routes'
 
 const server  = Hapi.Server({
 	port: 8000,
 	host: 'localhost'
 });


server.route(routes)

 const init = async () => {
 	
	await server.start();

	console.log('Server started at', server.info.uri);
 };

 process.on('unhandledRejection', (err) =>{
 	console.log(err);
 	process.exit(1);
 });

 init();