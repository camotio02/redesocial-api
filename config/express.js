const express = require('express');
const bodyParser = require('body-parser');
const consign = require('consign');
const cors = require('cors');

module.exports = () => {
  const app = express();

  var corsOptions = {
    credentials: true,
    origin: true,
    methods: 'GET,POST,PUT,DELETE',
    exposedHeaders: '*',
    allowedHeaders: '*',
  };

  app.use(cors(corsOptions));

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
      parameterLimit: 50000,
      preflightContinue: true,
      optionsSuccessStatus: 200,
    })
  );

  consign({ cwd: 'api' }).then('routes').into(app);

  return app;
};
