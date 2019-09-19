require('dotenv').config();

const express           = require("express"),
    helmet              = require('helmet'),
    cors                = require('cors'),
    app                 = express(),
    bodyParser          = require("body-parser"),
    cluster             = require('cluster'),
    flash               = require("connect-flash"),
    LocalStrategy       = require("passport-local"),
    mongoose            = require("mongoose"),
    methodOverride      = require("method-override"),
    middleware          = require('./middleware'),
    numCPUs             = require('os').cpus().length,
    passport            = require("passport"),
    session             = require("express-session"),
    MongoStore          = require("connect-mongo")(session),
    cookieParser        = require("cookie-parser"),
    User                = require("./models/user"),
    Posts               = require('./models/Blog/post'),
    indexRoutes         = require("./routes/index"),
    expressSanitizer    = require('express-sanitizer'),
    ID                  = require("./resources/hash.js"),
    checkDb             = require('./seed');

//Colocar https
                                                          // CLUSTER
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
  });
} else {
  
serverConfig();

// app.listen(process.env.PORT, process.env.IP,function(){
//   console.log('Iniciado worker / Server');
// });
// }
app.listen('8080','localhost',function(){
  console.log('Iniciado worker / Server');
});
}

function serverConfig() {

  mongoose.connect(process.env.uri,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

  var whitelist = ['https://code.jquery.com',
                   'https://stackpath.bootstrapcdn.com/',
                   'https://cdnjs.cloudflare.com/',
                   'https://maxcdn.bootstrapcdn.com/bootstrap/',
                   'https://use.fontawesome.com/',
                   'https://fonts.googleapis.com/'
                  ]
  var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
  }

  app.use(cors(corsOptionsDelegate));
  app.use(helmet());
  app.use(bodyParser.urlencoded({limit: '50mb',extended: true}));
  app.use(bodyParser.json({limit: '50mb', extended: true}));
  app.use(expressSanitizer());
  app.use(methodOverride("_method"));
  app.use(express.static(__dirname + "/public"));
  app.use(flash({ locals: 'flash' }));
  app.set("view engine", "ejs");

    app.use(session({
      secret: process.env.MONGOPW,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
      session: {
        expires: new Date(Date.now() + 1200000),
        maxAge: 1200000
      }
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser('secret'));

  app.locals.moment = require('moment');

  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  app.use(function(req,res,next){
  res.locals.currentUser  = req.user;
  res.locals.error        = req.flash("error");
  res.locals.success      = req.flash("success");
  next();
  });
  checkDb();

  var blogRoutesP = [
    '/blog/*/comment/new',
    '/blog/*/comentario/*',
    '/blog/post/edit/*'
  ]
  app.all(blogRoutesP,middleware.isLoggedIn,middleware.blogRole);
  // app.all('/blog/*/comment/new',middleware.isLoggedIn,middleware.blogRole);
  // app.all('/blog/*/comentario/*',middleware.isLoggedIn,middleware.blogRole);
  // app.all('/blog/post/edit/*', middleware.isLoggedIn, middleware.blogRole);
  app.all('/blog/post/new', middleware.isLoggedIn,middleware.blogRole);
  app.all('/blog/post/delete/*', middleware.isLoggedIn, middleware.blogRole);
  app.all('/js/admin/*', middleware.isLoggedIn);
  app.all('/admin/*', middleware.isLoggedIn, middleware.adminRole);
  app.all('/admin/dever', middleware.hasPermissionDever, middleware.adminRole);
  app.all('/admin/dever/*', middleware.hasPermissionDever, middleware.adminRole);
  app.all('/admin/contato', middleware.hasPermissionContato, middleware.adminRole);
  app.all('/admin/edit/contato', middleware.hasPermissionContato, middleware.adminRole);
  app.all('/admin/diferencial/*', middleware.hasPermissionDiferenciais, middleware.adminRole);
  app.all('/admin/edit/diferencial/*', middleware.hasPermissionDiferenciais, middleware.adminRole);
  app.all('/admin/edit/diferencial', middleware.hasPermissionDiferenciais, middleware.adminRole);
  app.all('/admin/ensino/*', middleware.hasPermissionEnsino, middleware.adminRole);
  app.all('/admin/edit/ensino/*', middleware.hasPermissionEnsino, middleware.adminRole);
  app.all('/admin/edit/ensino', middleware.hasPermissionEnsino, middleware.adminRole);
  app.all('/admin/edit/evento/*', middleware.hasPermissionEventos, middleware.adminRole);
  app.all('/admin/evento/*', middleware.hasPermissionEventos, middleware.adminRole);
  app.all('/admin/eventos/*', middleware.hasPermissionEventos, middleware.adminRole);
  app.all('/admin/edit/eventos/*', middleware.hasPermissionEventos, middleware.adminRole);
  app.all('/admin/edit/eventos', middleware.hasPermissionEventos, middleware.adminRole);
  app.all('/admin/home/*', middleware.hasPermissionHome, middleware.adminRole);
  app.all('/admin/home', middleware.hasPermissionHome, middleware.adminRole);
  app.all('/admin/edit/instituicao', middleware.hasPermissionInstitucional, middleware.adminRole);
  app.all('/admin/edit/instituicao/*', middleware.hasPermissionInstitucional, middleware.adminRole);
  app.all('/admin/mensagem', middleware.hasPermissionMensagens, middleware.adminRole);
  app.all('/admin/mensagem/*', middleware.hasPermissionMensagens, middleware.adminRole);
  app.all('/admin/mensagens', middleware.hasPermissionMensagens, middleware.adminRole);
  app.all('/admin/mensagens/*', middleware.hasPermissionMensagens, middleware.adminRole);
  app.all('/admin/paginas/*', middleware.hasPermissionPaginas, middleware.adminRole);
  app.all('/admin/pagina/*', middleware.hasPermissionPaginas, middleware.adminRole);
  app.all('/admin/edit/paginas/*', middleware.hasPermissionPaginas, middleware.adminRole);
  app.all('/admin/pagina', middleware.hasPermissionPaginas, middleware.adminRole);
  app.all('/admin/edit/paginas', middleware.hasPermissionPaginas, middleware.adminRole);
  app.all('/admin/new/pagina', middleware.hasPermissionPaginas, middleware.adminRole);
  app.all('/admin/usuario/*', middleware.hasPermissionUsuarios, middleware.adminRole);
  app.all('/admin/edit/usuarios/*', middleware.hasPermissionUsuarios, middleware.adminRole);
  app.all('/admin/*/mudarNome', middleware.hasPermissionUsuarios, middleware.adminRole);
  app.all('/admin/*/recuperarSenha', middleware.hasPermissionUsuarios, middleware.adminRole);
  app.all('/admin/*/permissoes', middleware.hasPermissionUsuarios, middleware.adminRole);
  app.all('/admin/blog',middleware.hasPermissionBlog, middleware.adminRole);
  app.all('/admin/blog/*',middleware.hasPermissionBlog, middleware.adminRole);

  app.use(indexRoutes);
}