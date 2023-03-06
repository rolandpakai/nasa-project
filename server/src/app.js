import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import api from './routes/api.js';
const __dirname = path.resolve();

const app = express();

app.use(cors({ 
  origin: 'http://localhost:3000'
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/v1', api);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

export default app;