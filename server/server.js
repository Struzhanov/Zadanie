const express = require('express');
const cors = require('cors');
const session = require('express-session');
const sessionStore = require('session-file-store');
const postRouter = require('./routes/postRouter');

const Fstore = sessionStore(session);

const PORT = process.env.PORT || 3001;

const app = express();

const sessionParser = session({
  name: 'sId',
  store: new Fstore({}),
  secret: 'mkdfjfsdngjknljpeaaj',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12,
    httpOnly: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(sessionParser);

app.use('/api/posts', postRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
