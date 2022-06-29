module.exports = (app, db) => {
    const controller = require("../controllers/usuarioController")(app, db);
    
    app.route("/usuario").get(controller.getUsuario);

    app.route("/usuario/login").post(controller.login);

    app.route("/usuario").post(controller.criaUsuario);

    app.route("/usuario/trocar-senha").post(controller.trocarSenha);
}