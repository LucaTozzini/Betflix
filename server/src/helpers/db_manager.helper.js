import { update_movies, update_shows } from "./db_maintenance.helper.js";
import { status_socket } from "./web_sockets.helpers.js";

/**
 * @param {string} ACTIVE_TASK
 * @param {string} ACTIVE_SUBTASK
 * @param {number} TASK_PROGRESS
 * @param {number} SUBTASK_PROGRESS
 */
export function updateStatus(
  ACTIVE_TASK,
  ACTIVE_SUBTASK,
  TASK_PROGRESS,
  SUBTASK_PROGRESS
) {
  STATUS.ACTIVE_TASK = ACTIVE_TASK;
  STATUS.ACTIVE_SUBTASK = ACTIVE_SUBTASK;
  STATUS.TASK_PROGRESS = TASK_PROGRESS;
  STATUS.SUBTASK_PROGRESS = SUBTASK_PROGRESS;
  status_socket.notify(STATUS);
}

export const STATUS = {
  ACTIVE_TASK: null,
  ACTIVE_SUBTASK: null,
  TASK_PROGRESS: 0,
  SUBTASK_PROGRESS: 0,
};

/**
 * @param {number} task 0 = update_movies, 1 = update_shows
 * @returns {Promise}
 */
export default async function (task) {
  if (STATUS.ACTIVE_TASK !== null) {
    return false;
  }
  if (task === 0) {
    STATUS.ACTIVE_TASK = "update movies";
    updateStatus("update movies", null, 0, 0);
    await update_movies();
  } else if (task === 1) {
    updateStatus("update shows", null, 0, 0);
    await update_shows();
  }
  updateStatus(null, null, 0, 0);
  return true;
}
