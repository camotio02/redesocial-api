const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const crypto = require('crypto');

function conectaBancoDados(filename) {
  return open({
    filename,
    driver: sqlite3.Database,
  });
}

const segredo = 'dfgfhjhvgfdchhdfcghdhgfm';

module.exports = (app) => {
  const controller = {};

  controller.getUsuario = async (req, res) => {
    const db = await conectaBancoDados('database.sqlite');

    const usuario = await db.get('SELECT * FROM usuario');

    res.status(200).send(usuario);
  };

  controller.login = async (req, res) => {
    let email = req.body.usuario_email;
    let senha = req.body.usuario_senha;

    if (email == undefined) {
      res.status(400).send({ erro: 'O e-mail não foi informado.' });
      return;
    }

    if (senha == undefined) {
      res.status(400).send({ erro: 'A senha não foi informada.' });
      return;
    }

    const senhaCriptografada = crypto
    .createHmac('sha512', segredo)
    .update(senha)
    .digest('hex');

    const db = await conectaBancoDados('database.sqlite');
    
    let sql =  `SELECT usuario_id, usuario_nome, usuario_email 
    FROM usuario 
    WHERE usuario_email = '${email}' AND usuario_senha = '${senhaCriptografada}'`;
    
    console.log(sql)
    
    const usuario = await db.get(sql);

    if (usuario == undefined) {
      res.status(400).send({ erro: 'Email e/ou senha incorretos' });
      return;
    }

    console.log(usuario);

    res.status(200).send(usuario);
  };

  controller.criaUsuario = async (req, res) => {
    let usuarioNome = req.body.usuario_nome;
    let usuarioEmail = req.body.usuario_email;
    let usuarioSenha = req.body.usuario_senha;

    if (usuarioNome == undefined) {
      res.status(400).send({
        error: 'Nome inválido.',
      });
      return;
    }
    if (usuarioEmail == undefined) {
      res.status(400).send({
        error: 'E-mail inválido.',
      });
      return;
    }
    if (usuarioSenha == undefined) {
      res.status(400).send({
        error: 'Senha inválida.',
      });
      return;
    }


    const senhaCriptografada = crypto
      .createHmac('sha512', segredo)
      .update(usuarioSenha)
      .digest('hex');

    const db = await conectaBancoDados('database.sqlite');

    let sql = `INSERT INTO usuario (usuario_nome, usuario_email, usuario_senha) 
                VALUES ('${usuarioNome}', '${usuarioEmail}', '${senhaCriptografada}')`;

    try {
      let resultado = await db.run(sql);
      res.status(200).send({
        resultado: resultado,
      });
    } catch (error) {
      res.status(400).send({
        error: 'Não foi possível criar o usuário',
      });
    }
  };

  controller.trocarSenha = async (req, res) => {
    let usuarioId = req.body.usuario_id;
    let senhaAtual = req.body.usuario_senha;
    let novaSenha = req.body.nova_senha;

    if (usuarioId == undefined) {
      res.status(400).send({ erro: 'O ID do usuário não foi informado.' });
      return;
    }

    if (senhaAtual == undefined) {
      res.status(400).send({ erro: 'A senha não foi informada.' });
      return;
    }

    if (novaSenha == undefined) {
      res.status(400).send({ erro: 'A nova senha não foi informada.' });
      return;
    }    

    const senhaCriptografada = crypto
    .createHmac('sha512', segredo)
    .update(senhaAtual)
    .digest('hex');

    const novaSenhaCriptografada = crypto
    .createHmac('sha512', segredo)
    .update(novaSenha)
    .digest('hex');


    const db = await conectaBancoDados('database.sqlite');
    
    let sql = `SELECT usuario_id, usuario_nome, usuario_email FROM usuario 
    WHERE usuario_id = '${usuarioId}' AND usuario_senha = '${senhaCriptografada}'`;
    
    const usuario = await db.get(sql);

    if (usuario == undefined) {
      res.status(400).send({ erro: 'Senha atual inválida' });
      return;
    }

    sql = `UPDATE usuario SET usuario_senha = '${novaSenhaCriptografada}' WHERE usuario_id = ${usuarioId}`;

    await db.get(sql);

    res.status(200).send(usuario);
  };


  return controller;
};


