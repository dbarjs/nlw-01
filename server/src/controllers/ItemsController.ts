import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');

    return response.json(
      // serialize
      items.map((item) => ({
        ...item,
        image_url: `http://192.168.1.144:3333/uploads/${item.image}`,
      }))
    );
  }
}

export default ItemsController;
