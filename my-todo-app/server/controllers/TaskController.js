import { selectAllTasks, insertTask, deleteTaskById } from "../models/Task.js";
import { ApiError } from "../helper/ApiError.js";

const getTasks = async (req, res, next) => {
  try {
    const result = await selectAllTasks();
    return res.status(200).json(result.rows || []);
  } catch (error) {
    return next(error);
  }
};

const postTask = async (req, res, next) => {
  const { description } = req.body; // HUOM: frontend lähettää { description }
  try {
    if (!description || description.trim().length === 0) {
      return next(new ApiError("Task description is required", 400));
    }

    const result = await insertTask(description.trim());
    const created = result.rows[0];

    return res.status(201).json({
      id: created.id,
      description: created.description
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return next(new ApiError("Invalid task id", 400));
    }

    const result = await deleteTaskById(numericId);
    if (result.rowCount === 0) {
      return next(new ApiError("Task not found", 404));
    }

    return res.status(200).json({
      message: "Task deleted",
      id: numericId
    });
  } catch (error) {
    return next(error);
  }
};

export { getTasks, postTask, deleteTask };