import dotenv from 'dotenv';
import { app } from './index.js';

dotenv.config();

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`CineSense API listening on http://localhost:${port}`);
});