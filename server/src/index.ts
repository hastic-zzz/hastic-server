import * as express from 'express';
import * as bodyParser from 'body-parser';

import { router as anomaliesRouter } from './routes/anomalies';
import { router as segmentsRouter } from './routes/segments';
import { router as alertsRouter } from './routes/alerts';
import { tgBotInit } from './services/notification';

const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/anomalies', anomaliesRouter);
app.use('/segments', segmentsRouter);
app.use('/alerts', alertsRouter);
app.use('/', (req, res) => { res.send('Analytic unit works') });

app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`)
});

tgBotInit();
