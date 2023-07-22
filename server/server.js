
import bonjour from 'bonjour';
import express from 'express';
import cors from 'cors';

import database_routes from './src/routes/database.routes.js';
import users_routes from './src/routes/users.routes.js';
import browse_routes from './src/routes/browse.routes.js';
import watchlist_routes from './src/routes/watchlist.routes.js';
import player_router from './src/routes/player.routes.js'

const PORT = 80;
const app = express();
const service = bonjour();

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Routes
app.use('/database', database_routes);
app.use('/users', users_routes);
app.use('/browse', browse_routes);
app.use('/watchlist', watchlist_routes);
app.use('/player', player_router);

// 
app.get('/ciao', (req, res) => res.send('yellow'));

// Start Server
app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`);
});

service.publish({ name: 'Betflix API', type: 'http', port: 3000 });