const Task = require('../models/task');

const createTask = async (req, res) => {
    const { title, description } = req.body;
    try {
        const newTask = await Task.create({ title, description, createdBy: req.user._id });
        res.status(201).json(newTask);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user._id });
        res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.taskId, createdBy: req.user._id },
            { $set: req.body },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to update it' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.taskId, createdBy: req.user._id });

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask };