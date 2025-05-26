import express from 'express';
import routes from './routes/index.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { mockUsers } from './utils/constants.js';
import passport from 'passport';
import './strategies/local-strategy.js';

const app = express();

app.use(express.json());
app.use(cookieParser('helloworld'));
app.use(
  session({
    secret: 'aqzsha',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});

app.get('/', (request, response) => {
  console.log(request.session);
  console.log(request.session.id);
  request.session.visited = true;
  response.cookie('hello', 'world', { maxAge: 30000, signed: true });
  response.status(201).send({ msg: 'Hello!' });
});

app.post('/api/auth', passport.authenticate('local'), (request, response) => {
  response.sendStatus(200);
});

app.get('/api/auth/status', (request, response) => {
  return request.user ? response.send(request.user) : response.sendStatus(401);
});

app.post('/api/auth/logout', (request, response) => {
  if (!request.user) return response.sendStatus(401);
  request.logout((err) => {
    if (err) return response.sendStatus(400);
    response.send(200);
  });
});

// app.post('/api/auth', (request, response) => {
//   const {
//     body: { username, password },
//   } = request;

//   const findUser = mockUsers.find((user) => user.username === username);
//   if (!findUser || findUser.password !== password) {
//     return response.status(401).send({ msg: 'BAD CREDENTIALS' });
//   }

//   request.session.user = findUser;
//   return response.status(200).send(findUser);
// });

// app.get('/api/auth/status', (request, response) => {
//   return request.session.user
//     ? response.status(200).send(request.session.user)
//     : response.status(401).send({ msg: 'Not Authenticated' });
// });
