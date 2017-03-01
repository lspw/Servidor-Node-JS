// carregar o módulo necessário para a gestão do login em sessão dos utilizadores
var LocalStrategy   = require('passport-local').Strategy;

// carregar módulos de base de dados
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// exportar a função
module.exports = function(passport) {

    // =========================================================================
    // configuração da sessão do módulo passport ===============================
    // =========================================================================
    // o módulo de passport precisa de serializar o utilizador para o gravar na sessão

    // serializar utilizador para a sessão
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserializar utilizador na sessão
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // REGISTO LOCAL ===========================================================
    // =========================================================================
    // como aqui se tem 2 estratégias uma para o registo e outra para o login irá se utilizar nomes diferentes, caso contrário era só utilizar local

    passport.use(
        'local-signup',
        new LocalStrategy({
            // por default a estratégia local usa o username e password
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // permite enviar de volta todo o pedido através do callback
        },
        function(req, username, password, done) {
            // procurar um utilizador com o username inserido
            // verificar na base de dados se o utilizador que está a tentar criar conta já existe (username únicos)
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'Username already exists.')); // mostra mensagem na página signup de que o utilizador já existe
                } else {
                    // se não existir nenhum utilizador com esse username
                    // criar utilizador
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // utilizar a hash gerada para gravar na base de dados
                    };

                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOGIN LOCAL =============================================================
    // =========================================================================

    passport.use(
        'local-login',
        new LocalStrategy({
            // por default a estratégia local usa o username e password
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // permite enviar de volta todo o pedido através do callback
        },
        function(req, username, password, done) { // callback com o username e password vindos do formulário
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Username doesn\'t exist.')); // req.flash é uma das forma de mandarmos a mensagem para o formulário
                }

                // verifica se a password na base de dados é igual à password colocada pelo utilizador aplicando o mesmo algoritmo de cifra
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password.')); 

                // Devolve o utilizador autenticado
                return done(null, rows[0]);
            });
        })
    );
};
