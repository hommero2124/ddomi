const { updateLocale } = require("moment");

module.exports = function(io, app) {

    const fetch = require("node-fetch");

    let allClients = [];
    io.on('connection',(socket)=>{
        //socket.join('victor');//agregar una sala
        allClients.push(socket);
        app.set('socketio', io);
        
        app.set('socketsocketPropio', socket);
        console.log('coneccion nuevo ',socket.id);
        app.set('socketsocket', socket.id);
        //cada vez que se conecta un cliente se activa el registro
        //en la bd
        updateBd(socket.id);

        
        socket.on("disconnect", () => {
            console.log('usuario desconetado. ')
            //desconectamos el usuario y borramos el socket
            updateDesconectar();
            var i = allClients.indexOf(socket);
            allClients.splice(i, 1);
        });
        
    });

    function updateBd(socket){
        //console.log('Function',socket)
        //console.log('Time:', app.locals.reqq.session.data.token);
        if(typeof app.locals.reqq.session !== 'undefined'){
            const idAliado = app.locals.reqq.session.data.idAliado;
            const idId = app.locals.reqq.session.data.idId;
            const ttoken = 'Bearer ' + app.locals.reqq.session.data.token;
            const socketio = socket;
            console.log('IdAliado:', idAliado);
            console.log('Idid:', idId);
            console.log('sockect:', socketio);
            console.log('token:', ttoken);

            //actualizamos el token dentro de la memoria del servidor
            app.locals.reqq.session.data.socketIo=socketio;

            //actualizamos el usuario
            fetch('http://3.16.160.182:8010/apidash/upsert',{
                method:'POST',
                body:JSON.stringify({
                    aliado: idAliado,
                    id: idId,
                    webtoken: socketio                    
                }),
                headers:{
                    "content-Type":"application/json",
                    "User-Agent":"Domicompras App",
                    "Authorization": ttoken
                }
            })
            .then(function(response) {
                return response.json();            
            })
            .then(function(data) {
                console.log('actualizacion de sokectid',data)
            }) 
            .catch(function(error){
                console.error(error)
            })
        }
    }

    function updateDesconectar(socket){
        //console.log('Function',socket)
        //console.log('Time:', app.locals.reqq.session.data.token);
        if(typeof app.locals.reqq.session !== 'undefined'){
            const idAliado = app.locals.reqq.session.data.idAliado;
            const idId = app.locals.reqq.session.data.idId;
            const ttoken = 'Bearer ' + app.locals.reqq.session.data.token;
            const socketio = '';
            console.log('IdAliado:', idAliado);
            console.log('Idid:', idId);
            console.log('sockect:', socketio);
            console.log('token:', ttoken);

            //actualizamos el token dentro de la memoria del servidor
            app.locals.reqq.session.data.socketIo=socketio;

            //actualizamos el usuario
            fetch('http://3.16.160.182:8010/apidash/upsert',{
                method:'POST',
                body:JSON.stringify({
                    aliado: idAliado,
                    id: idId,
                    webtoken: socketio                    
                }),
                headers:{
                    "content-Type":"application/json",
                    "User-Agent":"Domicompras App",
                    "Authorization": ttoken
                }
            })
            .then(function(response) {
                return response.json();            
            })
            .then(function(data) {
                console.log('actualizacion de sokectid',data)
            }) 
            .catch(function(error){
                console.error(error)
            })
        }
    }
}
