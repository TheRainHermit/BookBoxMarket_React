import specs from '../swagger.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(specs);
}