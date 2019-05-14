import express from 'express';
import * as handlers from './api.handlers';

/**
 * API Router
 * ----------
 * This router handles calls made to our API
 */
export default express.Router()
  .get('/url/:url', handlers.url)
  .get('/result/:id', handlers.result)
  .all('*', (req, res) => {
    res
      .status(404)
      .end({ message: `'${req.url}' is 2fake4us.` });
  });
  