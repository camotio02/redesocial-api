module.exports = (app, db) => {
    const controller = require("../controllers/mensagemController")(app, db);


    app.route("/mensagens").get(controller.retornaTodasMensagens);

    app.route("/mensagem").post(controller.criaMensagem);
}