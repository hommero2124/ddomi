require('dotenv').config();
const express = require('express');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const morgan = require('morgan');
const session = require('express-session');

const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');

var cors = require ('cors');


//inicialización
//app.set('socketio', io);
require('./lib/passport');

//configuracion
app.set('port', process.env.PORT || 3250);

//archivos publicos
app.use(express.static(path.join(__dirname,'public'))); //carpetas y archivos estaticos

app.set('views',path.join(__dirname,'views'));//declaramos la ubicacion de la carpeta donde estaran todos los archivos

app.engine('.hbs', exphbs({
    defaultLayout:'main',
    layoutsDir:path.join(app.get('views'),'layouts'),
    partialsDir:path.join(app.get('views'),'partials'),
    extname:'.hbs',
    helpers:require('./lib/funciones')
}));

app.set('view engine','.hbs');


//middlewares
app.use(session({
    secret: 'd@mic@mpr@s',
    name: 'foo', // Default is connect.sid
    store: this.store, 
    resave: false,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: process.env.protocol === 'https',
        maxAge: (60 * 60 * 1000), // 60 minutes,
        sameSite: 'strict', // THIS is the config you are looing for.
    },
    saveUninitialized: true,
    rolling: true
}))

app.use(flash());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());



//variables golbales
app.use((req, res, next)=>{
    app.locals.successFormulario=req.flash('successFormulario');
    app.locals.dangerFormulario=req.flash('dangerFormulario');
    app.locals.warningFormulario=req.flash('warningFormulario');
    app.locals.successGenerales=req.flash('successGenerales');
    app.locals.dangerGenerales=req.flash('dangerGenerales');
    app.locals.warningGenerales=req.flash('warningGenerales');
    app.locals.reqq=req;
    //app.locals.user=req.user;
    next()
})


//var allowedOrigins = ['http: // localhost: 4000', 'http://yourapp.com'];
/*var allowedOrigins = 'http://localhost:'+app.get('port');
app.use(cors({
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg =   'La política de CORS para este sitio no' + 
                    'permite el acceso desde el origen especificado.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  }));*/

//rutas
app.use(require('./routes/routes'));


//iniciar servidor
server.listen(app.get('port'),()=>{
    console.log('Servidor corriendo en el puero ',app.get('port'));
})


//iniciar sockect.io
require('./public/socketio')(io,app);