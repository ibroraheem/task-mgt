const express = require('express');
const passport = require('passport');
const tasksController = require('../controllers/task');

const router = express.Router();


router.post('/tasks', passport.authenticate('jwt', { session: false }), tasksController.createTask);


router.get('/tasks', passport.authenticate('jwt', { session: false }), tasksController.getAllTasks);


router.patch('/tasks/:taskId', passport.authenticate('jwt', { session: false }), tasksController.updateTask);


router.delete('/tasks/:taskId', passport.authenticate('jwt', { session: false }), tasksController.deleteTask);

module.exports = router;
