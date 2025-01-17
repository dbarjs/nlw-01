import { Request, Response } from 'express';
import ip from 'ip';
import knex from '../database/connection';

class PointsController {
  async create(request: Request, response: Response) {
    if (request.body.items) {
      const pointData = {
        ...request.body,
        image: request.file.filename,
      };
      delete pointData.items;
      const trx = await knex.transaction();
      const pointIdList = await trx('points').insert(pointData);
      const point_id = pointIdList[0];
      const pointItems = request.body.items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: Number) => ({
          item_id,
          point_id,
        }));
      await trx('point_items').insert(pointItems);
      await trx.commit();
      return response.json({
        id: point_id,
        ...pointData,
      });
    }
  }

  async index(request: Request, response: Response) {
    const { city = '', uf = '', items = '' } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    try {
      const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');

      const serializedPoints = points.map((point) => {
        return {
          ...points,
          image_url: `http://${ip.address()}:3333/uploads/${point.image}`,
        };
      });

      return response.json(serializedPoints);
    } catch (e) {
      console.log(e);
      return response.status(400).json({ message: 'Unexpected error. ' });
    }
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    try {
      const point = await knex('points').where('id', id).first();
      if (!point) {
        return response.status(400).json({ message: 'Point not found. ' });
      }

      const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', '=', id);

      const serializedPoint = {
        ...point,
        image_url: `http://${ip.address()}:3333/uploads/${point.image}`,
      };

      return response.json({ point: serializedPoint, items });
    } catch (e) {
      console.log(e);
      return response.status(400).json({ message: 'Unexpected error. ' });
    }
  }
}

export default PointsController;
