// carregar módulos
var path = require('path');
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

// Exportar a função que gere os roteamentos
module.exports = function(app, passport) {

	// =====================================
	// ROTEAMENTO ==========================
	// =====================================
	
	// os roteamentos feitos terão sempre uma callback associada que será despoletada quando a página for acedida. É representa principalmente por 2 argumentos: o pedido (cliente) e a resposta (servidor).
	app.get('/', function(req, res) {
	
				//renderizar a página home
				res.render('indexs.ejs');
		
	});

	app.get('/contact', function(req, res){
		res.render('contact.ejs');
	});

	app.get('/tech', function(req, res){
		res.render('tech.ejs');
	});

	app.get('/garagem', function(req, res){

		/*

		var obj;
		connection.query('SELECT valor FROM registovalores WHERE ID_SENSOR = 2 ORDER BY registovalores.TIMESTAMP DESC LIMIT 1;', function(err, result) {

			if(err){
				throw err;
			} else {

		connection.query('SELECT valor FROM registovalores WHERE ID_SENSOR = 1 ORDER BY registovalores.TIMESTAMP DESC LIMIT 1;', function(err, result2) {

			if(err){
				throw err;
			} else {
				obj = {port: result2, luz: result};
				console.log(obj.result.data);
				res.render('casa.ejs', obj);
			}
		});
		connection.end();
	}
	
});*/

		//var obj;
});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// mostrar o formulário de login
	app.get('/login', function(req, res) {

		// renderizar a página de login. O flash serve para indicar que poderá haver uma mensagem futura nesta página (guardado em sessão)
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// processar o formulário de login quando se faz submit
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/form', // ao realizar o login com sucesso irá redirecionar para a página de perfil
            failureRedirect : '/login', // redirecionar novamente para a página de login caso falhe
            failureFlash : true // permitir mensagens do módulo connect-flash quando se falha o login
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 30; // 30 minutos 
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// REGISTO ==============================
	// =====================================
	// mostrar o formulário de registo
	app.get('/signup', function(req, res) {
		// renderizar a página de registo. O flash serve para indicar que poderá haver uma mensagem futura nesta página (guardado em sessão)
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// processar o formulário de registo quando se faz submit
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/form', // ao criar a conta com sucesso irá redirecionar para a página de perfil e mostrar a conta criada
		failureRedirect : '/signup', // redirecionar novamente para a página de registo caso falhe
		failureFlash : true // permitir mensagens do módulo connect-flash quando se falha o registo
	}));

	// =====================================
	// PERFIL =========================
	// =====================================
	// esta página estará protegida uma vez que apenas poderá ser acedida com o login feito
	// a utilização da função isLoggedIn é para verificar se o utilizador está ou não autenticado
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // ir buscar o utilizador à sessão e mandá-lo para o template
		});
	});
	// Renderizar o form.ejs

	app.get('/form', isLoggedIn, function(req, res) {
		connection.query('SELECT mix_descricao, mix_dep1, mix_dep2 FROM mixtures WHERE id = ?', [req.user.id], function(err, result) {

			if(err){
				throw err;
			} else {
				var obj = {rows: result, nomeUser: req.user.username, displayedNone: !req.isAuthenticated()};
				
				res.render('form.ejs', obj);                
			}
		});
	});

	app.post('/form', function(req, res) {
		
        console.log(req.body);
        console.log(req.user);
		var insertQuery = "INSERT INTO mixtures (mix_descricao, mix_dep1, mix_dep2, id ) values (?,?,?,?)";

                    connection.query(insertQuery,[req.body.descricao, req.body.deposito_1, req.body.deposito_2, req.user.id],function(err, rows) {
                     connection.query('SELECT mix_descricao, mix_dep1, mix_dep2 FROM mixtures WHERE id = ?', [req.user.id], function(err, result) {

			if(err){
				throw err;
			} else {
				var obj = {rows: result, nomeUser: req.user.username, displayedNone: !req.isAuthenticated()};
				res.render('form.ejs', obj);                
			}
		});
	});
		
});

	// =====================================
	// Contacts
	// =====================================

	// =====================================
	// LISTAR UTILIZADORES =================
	// =====================================
	app.get('/users', isLoggedIn, function(req, res){

		connection.query('SELECT * FROM users', function(err, result) {

			if(err){
				throw err;
			} else {
				var obj = {rows: result};
				res.render('users.ejs', obj);                
			}
		});

	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	app.get('/calculadora', function(req, res) {
		var p = path.join(__dirname + '/../views/calculadora.html');
		res.sendFile(p);
	});


	

	app.post('/json', isLoggedIn, function(req, res) {
		var myObj =
{    "name":"John",    "age":30,    "cars": [        	{ 
	"name":"Ford", 
	"models":[ "Fiesta", "Focus", "Mustang" ] 
	},        	{ 
	"name":"BMW", 
	"models":[ "320", "X3", "X5" ] 
	},        	{ 
	"name":"Fiat", 
	"models":[ "500", "Panda" ] 
	}    ] };

		res.send(myObj);
	});
	app.get('/json', function(req, res) {
			var myObj =
{    "name":"John",    "age":30,    "cars": [        	{ 
	"name":"Ford", 
	"models":[ "Fiesta", "Focus", "Mustang" ] 
	},        	{ 
	"name":"BMW", 
	"models":[ "320", "X3", "X5" ] 
	},        	{ 
	"name":"Fiat", 
	"models":[ "500", "Panda" ] 
}    ] };

	res.send(myObj);
	});

	app.post('/pedidoajax', function(req, res) {
		console.log(req.body);
		console.log(req.body.nome);
		console.log(req.body.uc);

		connection.query('SELECT * FROM users', function(err, result) {

			if(err){
				throw err;
			} else {
				res.send(result);              
			}
		});
	});
};

// verificar se o utilizador está ou não autenticado
function isLoggedIn(req, res, next) {

	// se estiver então avançar no pedido
	if (req.isAuthenticated())
		return next();

	// se não estiver autenticado redirecionar para a home
	res.redirect('/');
}
