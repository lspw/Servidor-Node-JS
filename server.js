// carregar módulos necessários
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 8080;

var passport = require('passport');
var flash    = require('connect-flash');
var path = require('path');

// passar o módulo passport para a configuração (module.exports do ficheiro passport.js)
require('./config/passport')(passport); 



// configuração do express
app.use(morgan('dev')); // fazer logs na consola de todos os pedidos
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser()); // ler cookies (necessário para autenticação)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // configurar o ejs para templates

// necessário configurar a sessão para o módulo passport
app.use(session({
	secret: '123456789', //'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); 
app.use(passport.initialize()); // inicializar o módulo de gestão de logins
app.use(passport.session()); 
app.use(flash()); // utilizar connect-flash para as mensagens flash guardadas em sessão


// roteamento ======================================================================
require('./app/routes.js')(app, passport); // carregar os roteamentos mandando o servidor já configurado (app) e o gestor de sessões (passport)

// servidor à escuta na porta ======================================================================
app.listen(port);
console.log('http://localhost:' + port);
