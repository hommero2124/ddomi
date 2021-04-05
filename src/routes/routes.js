const { Router } = require('express');
const routes = Router();
const webpush = require('web-push');
const dateFormat = require('dateformat');
const fetch = require("node-fetch");
const moment = require('moment');


var passport = require('passport');
let pushSubcripcion=[];


routes.post('/enviarPedido',(req,res)=>{
    const { numeroPedido, socket, descripcion } = req.body;
    const io = req.app.get('socketio');
    try {
        //permite enviar el socket a un cliente conectado en tiempo real
        io.to(socket).emit('pedido',{ numeroPedido, socket, descripcion })
        res.status(200).json('ok')
    } catch (e) {
        res.status(200).json('bad')
        console.error(e);
    }
});


//hay una nota tempral
routes.post('/consultarPedido',async (req,res)=>{
    const { numeroPedido } = req.body;
    var fecha= dateFormat(new Date(), "dd-mm-yyyy");
    fecha="30/03/2021"; //temporal solo pra pruebas
    await fetch('http://3.16.160.182:8010/apidash/monitorP', {
        method: 'POST',
        body: JSON.stringify({
            aliado: req.session.data.idAliado,
            id: req.session.data.sedes[0].id,
            fecha: fecha
        }),
        headers: {
            'Content-Type': 'application/json',
            'User-Agent':'Domicompras App',
            'Authorization':'Bearer '+ req.session.data.token
        },
    })
    .then(function(response) {
        return response.json();            
    })
    .then(function(data) {
        //console.log(data)
        res.status(200).json({data:data})
    })
})

//hay una nota tempral
routes.post('/aceptarPedido',async (req,res)=>{
    //aqui llegan los pedidos aceptando el pedido, y rechanazo el pedido
    var { orden, fecha, hora, estado, notas, tiempoPreparacion} = req.body;
    var fecha= dateFormat(fecha, "yyyy-mm-dd");
    if (typeof tiempoPreparacion === 'undefined' || tiempoPreparacion === undefined) {
        tiempoPreparacion=0;
    }
    var mins = tiempoPreparacion;
    if (mins >= 24 * 60 || mins < 0) {
        var travelTime=0;
        res.status(200).json({message:'bad'})
    }else{
        var h = mins / 60 | 0,
        m = mins % 60 | 0;
        var travelTime = moment(fecha+' '+hora).add({hours:h,minutes:m}).format('hh:mm')

        // console.log('########');
        // console.log('orden:',orden);
        // console.log('hora:',hora);
        // console.log('estado:',estado);
        // console.log('notas:',notas);
        // console.log('minute_time:',tiempoPreparacion);
        // console.log('estimated_time:',travelTime);
        // console.log('########');

        await fetch('http://3.16.160.182:8010/apidash/AceptOrder', {
            method: 'POST',
            body: JSON.stringify({
                orden:          orden,
                hora:           hora, 
                estado:         estado,
                notas:          notas,
                minute_time:    tiempoPreparacion,
                estimated_time: travelTime, 
                aliado: req.session.data.idAliado,
                id: req.session.data.sedes[0].id,                          
            }),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent':'Domicompras App',
                'Authorization':'Bearer '+ req.session.data.token
            },
        })
        .then(function(response) {
            return response.json();            
        })
        .then(function(data) {
            console.log(data)
            res.status(200).json({data:data})
        })

        //res.status(200).json({message:'ok'})
    }
    
});

//hay una nota tempral
routes.post('/entregadoPedido',async (req,res)=>{
    //aqui llegan los pedidos aceptando el pedido, y rechanazo el pedido
    var { orden, hora, estado} = req.body;

    // console.log('########');
    // console.log('orden:',orden);
    // console.log('hora:',hora);
    // console.log('estado:',estado);
    // console.log('########');

    await fetch('http://3.16.160.182:8010/apidash/AceptOrder', {
        method: 'POST',
        body: JSON.stringify({
            orden:          orden,
            hora:           hora, 
            estado:         estado,
            notas:          notas,
            minute_time:    tiempoPreparacion,
            estimated_time: travelTime,
            aliado: req.session.data.idAliado,
            id: req.session.data.sedes[0].id,                
        }),
        headers: {
            'Content-Type': 'application/json',
            'User-Agent':'Domicompras App',
            'Authorization':'Bearer '+ req.session.data.token
        },
    })
    .then(function(response) {
        return response.json();            
    })
    .then(function(data) {
        console.log(data)
        res.status(200).json({data:data})
    })
    //res.status(200).json({message:'ok'})
    
});

routes.get('/dashboard',(req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login')
    }
},(req,res)=>{
    //console.log('data Session',req.session.data)
    res.render('layouts/dashboard',{title:'Dashboard'})
});

routes.get('/',(req,res,next)=>{
    if(req.isAuthenticated()){
        res.redirect('/dashboard')
    }else{
        next();
    }
},async(req,res)=>{
    res.render('index',{title:'Inicio de Sesión .::. DOMICOMPRAS'});
});

routes.get('/login',(req,res,next)=>{
    //console.log(req.isAuthenticated())
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/dashboard')
    }
},(req,res)=>{
    res.render('index',{title:'Inicio de Sesión .::. DOMICOMPRAS'});
});

routes.post('/login',async (req,res,next)=>{
    //console.log(req.body)
    const respuest = await passport.authenticate('loginSesion',{
        successRedirect:'/dashboard',
        failureRedirect:'/login',
        failureFlash: true
    })(req,res,next);
});

routes.get('/logout', (req, res) => {
    //console.log('Cerrar Sesion')
    req.logOut();
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        // Don't redirect, just print text
        res.redirect('/login')
    });
});

routes.get('/productos',(req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login')
    }
},(req,res)=>{
    res.render('layouts/productos',{title:'Productos'});
});

routes.get('/perfil',(req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login')
    }
},(req,res)=>{
    res.render('layouts/perfil',{
        title:'Perfil de Cliente'});
});


/*============================= 
Metodo para mejorlo y enlazarlo a la bd
----------------------------------*/
routes.post('/suscripcion', async(req, res)=>{///este metodo debe ser modificado para ser guardado en la bd
    //console.log(pushSubcripcion.length)
    for (const key in pushSubcripcion) {
        if (pushSubcripcion[key].endpoint!= req.body.endpoint) {
            //console.log(pushSubcripcion[key].endpoint);
            pushSubcripcion.push(req.body);
            //pushSubcripcion=(req.body);
        }
    }

    if (pushSubcripcion.length === 0) {
        pushSubcripcion.push(req.body);
        //pushSubcripcion=(req.body);
        //console.log(req.body)
    }else{
        let sinRepetidos = pushSubcripcion.filter((valorActual, indiceActual, arreglo) => {
            //Podríamos omitir el return y hacerlo en una línea, pero se vería menos legible
            return arreglo.findIndex(valorDelArreglo => JSON.stringify(valorDelArreglo) === JSON.stringify(valorActual)) === indiceActual
        });
        pushSubcripcion = sinRepetidos;
    }
    res.status(200).json();
});


/*============================= 
Solo necesarias para desarrollo
----------------------------------*/

routes.post('/newMessage', async(req, res)=>{
    const { message } = req.body
    webpush.setVapidDetails(
        'mailto:'+process.env.EMAIL,
        process.env.PUBLICKEY,
        process.env.PRIVATEKEY
    )
    //obtener las variables de inicio de seion
    const payload = JSON.stringify({
        title: req.user,
        message: message
    });
    console.log('inicio',req.session.views, 'Terminador', req.session.someField)

    try {
        for (const key in pushSubcripcion) {
            //console.log(pushSubcripcion[key].endpoint);
            await webpush.sendNotification(pushSubcripcion[key].subscirpcion,payload);
        }
        
        res.status(200).json();
    } catch (error) {
        res.status(400).json({error:error});
        console.error('Error ' + error)
    }
    
});

routes.post('/newMessageEndPoint', async(req, res)=>{
    webpush.setVapidDetails(
        'mailto:'+process.env.EMAIL,
        process.env.PUBLICKEY,
        process.env.PRIVATEKEY
    )
    //obtener las variables de inicio de seion
    const payload = JSON.stringify({
        title: 'Titulo empresa',
        message: req.body.subscirpcion.message
    });

    try {
        await webpush.sendNotification(req.body.subscirpcion,payload);
        res.status(200).json();
    } catch (error) {
        res.status(400).json({error:error});
        console.error('Error ' + error)
    }
    
});

routes.get('/cargarTodosPoint',(req,res)=>{
    res.send(pushSubcripcion)
 });

 routes.post('/cargarTodosPoint',(req,res)=>{
    res.status(200).json({datos:pushSubcripcion});
 });

 routes.get('/borrarTodosPoint',(req,res)=>{
    pushSubcripcion=[];
    res.status(200).json({datos:pushSubcripcion});
 });


 routes.get('**',(req,res)=>{
    res.redirect('/login');
 })
module.exports=routes;