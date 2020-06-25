/* eslint-disable import/prefer-default-export */
import Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('items').insert([
    { title: 'Lamps', image: 'lamps.svg' },
    { title: 'Batteries', image: 'batteries.svg' },
    { title: 'Papers', image: 'papers.svg' },
    { title: 'Electronic Waste', image: 'electronic.svg' },
    { title: 'Organics', image: 'organics.svg' },
    { title: 'Kitchen Oil', image: 'oil.svg' },
  ]);
}
