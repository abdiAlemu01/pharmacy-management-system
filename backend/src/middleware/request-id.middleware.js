import { v4 as uuidv4 } from 'uuid';

export const requestId = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};
