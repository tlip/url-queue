import crypto from 'crypto';
import express from 'express';
import signale from 'signale';

import UrlQueue from '../../lib/UrlQueue';
import RedisCache from '../../cache/RedisCache';
import db from '../../db';


/**
 * GET /api/v1/url/:url
 * --------------------
 * This handler:
 *   1) Takes a URL param
 *   2) If there's been a recent call for this URL, it gets the job from the cache
 *   3) Else, it creates a job to fetch it and store it,
 *   4) Returns the job id
 */
export const url = async (req: express.Request, res: express.Response, next: Function) => {
  
  // Get the url from the params
  const { url } = req.params;
  // Generate a job id
  const id = crypto.randomBytes(16).toString('hex');
  // Set empty statusCode and data response
  let statusCode: number;
  let data: { [idOrError: string]: string };
  // Set empty cache value
  let existingId: string | null;
  

  try {
    // Try seeing if there's a recent job that was run for this url
    existingId = await RedisCache.get(`url:${url}`);
  } catch (error) {
    // If it errors out, throw the error and set existingId to null
    signale.error(`ApiUrlError :: Retrieving from Cache:\n${error}`);
    existingId = null;
  }

  if (existingId) {
    // If there *was* a recent job, send its job id back to the client
    [statusCode, data] = [200, { id: existingId }];
  } else {
    // Else...
    try {
      // Try to push a new job and send back the id to the client
      UrlQueue.push({ id, url });
      [statusCode, data] = [200, { id }];
    } catch (error) {
      // If it errors out, throw the error and send an error to the client
      signale.error(`ApiUrlError :: Pushing Job To Queue:\n${error}`);
      [statusCode, data] = [500, { error: 'Something went wrong' }];
    }
  }

  // Send the response
  res.status(statusCode).json(data);
};


/**
 * GET /api/v1/result/:id
 * --------------------
 * This handler:
 *   1) Takes a job id as a param
 *   2) If the job was recent, it gets the HTML from the cache
 *   3) Else, it gets the HTML from the database
 *   4) Returns the HTML
 */
export const result = async (req: express.Request, res: express.Response, next: Function) => {
  
  // Get the ID from the params
  const { id } = req.params;
  // Set empty statusCode and data response
  let statusCode: number;
  let data: string | { error: string };
  // Set empty result just in case it's in the cache
  let resultInCache: string | null;
  
  try {
    // First see if this url has been requested recently
    resultInCache = await RedisCache.get(`id:${id}`);
  } catch (error) {
    // If it errors out, throw the error and set existingId to null    
    signale.error(`ApiResultError :: Retrieving from Cache:\n${error}`);
    resultInCache = null;
  }

  if (resultInCache) {
    // If there *was* a recent result, send its HTML id back to the client
    [statusCode, data] = [200, resultInCache];
  } else {
    // Else...
    try {
      // Try to find the job in the database
      const resultInDb = await db.Urls.find(id);
      [statusCode, data] = resultInDb
        // If the job *does* exist, send the HTML back
        ? [200, resultInDb.data]
        // If the job *doesn't* exist, send an error back
        : [404, JSON.stringify({ error: 'Job doesn\'t exist' })]; 
    } catch (error) {
      // If it errors out, throw the error and send an error to the client
      signale.error(`ApiResultError :: Retrieving from Database: \n${error}`);
      [statusCode, data] = [500, JSON.stringify({ error: 'Something went wrong' })];
    }
  }

  // Send the response
  res.status(statusCode).end(data);
};
