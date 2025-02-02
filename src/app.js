import express from 'express';
import handlebars from 'express-handlebars';
import routerApp from './routes/index.js';
import { connectDB } from './config/index.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Servir archivos estáticos

// Configuración de Handlebars
app.engine('hbs', handlebars.engine({
    extname: '.hbs'
}));
app.set('views', './src/views');
app.set('view engine', 'hbs');
app.use((req, res, next) => {
    res.locals.error = req.query.error || null;
    next();
});
// Conectar a la base de datos y arrancar el servidor
connectDB().then(() => {
    app.use(routerApp);

    app.listen(PORT, () => {
        console.log(`Server en puerto ${PORT}`);
    });
}).catch(error => {
    console.error("Error conectando a la base de datos:", error);
});
