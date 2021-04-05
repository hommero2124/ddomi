const passport = require('passport');
const pasportLocal = require('passport-local').Strategy;

const helpers = require('./helpers');
const fetch = require("node-fetch");

passport.use('loginSesion', new pasportLocal({
    usernameField:'username',
    passwordField:'password',
    passReqToCallback:true
}, async(req, user, password, done )=>{
    //consultamos con el servidro que el usuario y la clave sean las requeridas
    const newPassword = await helpers.crearSha1(password);
    const newPassword2 = await helpers.crearSha1(newPassword);

    await fetch('http://3.16.160.182:8010/apidash/login', {
        method: 'POST',
        body: JSON.stringify({
            UserN: user,
            UserP: newPassword2
        }),
        headers: {
            'Content-Type': 'application/json',
            'User-Agent':'Domicompras App'
        },
    })
    .then(function(response) {
        return response.json();            
    })
    .then(function(data) {
        //respuesta del servidor
        var usuarios;
        const io = req.app.get('socketio');
        if (data.response === 'Ok') {
            const newAliado={
                idAliado:   data.data1.id_aliado,
                idSede:     data.data1.id_sede,
                idId:       data.data2[0].id,
                sedes:      data.data2,
                productos:  data.data3,
                token:      data.token,
                socketIo:   ''
            }
            req.session.data=newAliado;
            req.app.locals.user=newAliado;

            const user = newAliado;

            done(null,user,req.flash('successFormulario','Bienvenido '+ newAliado.sedes[0].nom_sede))
        } else {
            return done(null,false, req.flash('dangerFormulario','Revisa tus credenciales de acceso'))
        }

    })
    .catch(function(err) {
        console.error(err.name + ' : '+err.message);
    });

}));


passport.serializeUser((user, done)=>{
    done(null, user);
});

passport.deserializeUser( async (id, done)=>{
    done(null,id);
})