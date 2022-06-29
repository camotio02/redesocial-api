const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const moment = require('moment-timezone');

function conectaBancoDados(filename) {
  return open({
    filename,
    driver: sqlite3.Database,
  });
}

module.exports = (app) => {
  const controller = {};

  controller.retornaTodasMensagens = async (req, res) => {
    const db = await conectaBancoDados('database.sqlite');

    const msgs = await db.all(`SELECT 
                                m.mensagem_id, 
                                m.usuario_id, 
                                m.mensagem_data, 
                                m.mensagem, 
                                u.usuario_nome 
                                FROM mensagens m 
                                INNER JOIN usuario u ON u.usuario_id = m.usuario_id
                                ORDER BY mensagem_data DESC`);

    res.status(200).send(msgs);
  };

  controller.criaMensagem = async (req, res) => {
    let usuarioId = req.body.usuario_id;
    let mensagem = req.body.mensagem;

    if (usuarioId == undefined) {
      res.status(400).send({
        error: 'usuário inválido.',
      });
      return;
    }
    if (mensagem == undefined) {
      res.status(400).send({
        error: 'Mensagem inválida.',
      });
      return;
    }

    let mensagemData = moment().tz('America/Sao_paulo').format('YYYY-MM-DD HH:mm:ss');;

    const db = await conectaBancoDados('database.sqlite');

    let sql = `INSERT INTO mensagens (usuario_id, mensagem, mensagem_data) 
                VALUES ('${usuarioId}', '${mensagem}', '${mensagemData}')`;

    try {
      let resultado = await db.run(sql);
      res.status(200).send({
        resultado: resultado,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        error: 'Não foi possível criar a mensagem',
      });
    }
  };

  return controller;
};
