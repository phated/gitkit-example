'use strict';

const hapi = require('hapi');
const boom = require('boom');
const GitkitClient = require('gitkitclient');

const server = new hapi.Server();

const gitkitConfig = require('./gitkit-config');

const gitkitClient = new GitkitClient(gitkitConfig);

server.connection({ port: 1337 });

function gitkitScheme(server, options){

  return {
    authenticate(request, reply){

      if(!request.state.gtoken){
        reply(boom.unauthorized(null, 'Gitkit'));
        return;
      }

      gitkitClient.verifyGitkitToken(request.state.gtoken, function (err, credentials) {
        if(err){
          reply(err);
          return;
        }

        reply.continue({ credentials });
      });
    }
  };
}

server.auth.scheme('gitkit', gitkitScheme);
server.auth.strategy('gitkit', 'gitkit');

server.route({
  method: 'GET',
  path: '/',
  handler(request, reply){
    console.log(request.auth.credentials);
    reply('Hello world');
  },
  config: {
    auth: {
      mode: 'optional',
      strategy: 'gitkit'
    }
  }
});

server.start((err) => {
  if(err){
    console.log(err);
    return;
  }

  console.log('server started');
});
