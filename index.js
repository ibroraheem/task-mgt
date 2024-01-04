const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('./middlewares/passportConfig');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const connectDb = require('./config/db');

const app = express();

app.use(morgan('dev'));
app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'x-access-token', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Headers', 'Access-Control-Request-Headers', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Credentials'],
    }
));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

connectDb();

app.get('/', (req, res) => {
    res.status(200).send("Hello World")
})
app.use('/', authRoutes);
app.use('/', taskRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
