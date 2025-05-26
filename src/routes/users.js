import { Router } from 'express';
import {
  checkSchema,
  matchedData,
  query,
  validationResult,
} from 'express-validator';
import { mockUsers } from '../utils/constants.js';
import { createUserValidationSchema } from '../utils/validationSchemas.js';
import { resolveIndexByUserId } from '../utils/middlewares.js';
import { User } from '../mongoose/schemas/user.js';
import { hashPassword } from '../utils/helpers.js';

const router = Router();

router.get(
  '/api/users',
  query('filter')
    .isString()
    .notEmpty()
    .withMessage('Must not be empty')
    .isLength({ min: 3, max: 10 })
    .withMessage('Must be at least 3-10 characters'),
  (request, response) => {
    const result = validationResult(request);
    console.log(result);
    const {
      query: { filter, value },
    } = request;
    if (filter && value)
      return response.send(
        mockUsers.filter((user) => user[filter].includes(value))
      );
    return response.send(mockUsers);
  }
);

router.get('/api/users/:id', resolveIndexByUserId, (request, response) => {
  const { findUserIndex } = request;
  const findUser = mockUsers[findUserIndex];
  if (!findUser) return response.sendStatus(404);
  return response.send(findUser);
});

router.post(
  '/api/users',
  checkSchema(createUserValidationSchema),
  async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send(result.array());
    }
    const data = matchedData(request);

    data.password = hashPassword(data.password);
    const newUser = new User(data);
    try {
      const savedUser = await newUser.save();
      return response.status(201).send(savedUser);
    } catch (error) {
      return response.sendStatus(400);
    }
  }
);

router.put('/api/users/:id', resolveIndexByUserId, (request, response) => {
  const { body, findUserIndex } = request;
  mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };
  return response.sendStatus(200);
});

router.patch('/api/users/:id', resolveIndexByUserId, (request, response) => {
  const { body, findUserIndex } = request;
  mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };
  return response.sendStatus(200);
});

router.delete('/api/users/:id', resolveIndexByUserId, (request, response) => {
  const { findUserIndex } = request;
  mockUsers.splice(findUserIndex, 1);
  return response.sendStatus(200);
});

export default router;
