import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';

const isProd = process.env.NODE_ENV === 'production';

const server = express();

/**
 * Express Server
 * --------------
 * Here we lay out our Express Server middlware and routes
 */
server
  .disable('x-powered-by')
  .disable('X-Powered-By')
  .use(cors())
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR as string))
  .use(morgan(isProd ? 'combined' : 'dev'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use('/api/v1', routes.api)
  .all('*', (req: express.Request, res: express.Response) => {
    res
      .status(404)
      .end({ message: `'${req.url}' is 2fake4us.` });
  });

export default server;
