import { getRepository } from 'typeorm';
import signale from 'signale';

import { Url } from '../entity/Url.entity';

/**
 * Urls
 * ----
 * This acts as a controller for our url table in the database
 */
class Urls {

  /**
   * Save a new url row
   */
  static save = async (id: string, url: string, data: string): Promise<Urls.ReturnValue> => {
    
    // Create an empty row
    const urlRow = new Url();

    // Set the row values
    urlRow.id = id;
    urlRow.url = url;
    urlRow.data = data;

    try {
      // Save the row
      return getRepository(Url).save(urlRow);
    } catch (error) {
      // If it errors, log it and throw the error
      signale.error('[UrlsOperationError :: save]');
      throw error;
    }

  }

  /**
   * Find a url row by its id
   */
  static find = async (id: string): Promise<Urls.ReturnValue> => {

    try {
      // Get the row
      return getRepository(Url).findOne({ id });
    } catch (error) { 
      // If it errors, log it and throw the error
      signale.error('[UrlsOperationError :: find]');
      throw error;
    }

  }

}

export default Urls;
