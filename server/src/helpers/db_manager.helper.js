import { update_movies, update_shows } from "./db_maintenance.helper.js";

export const STATUS = {
  ACTIVE_TASK: null,
  ACTIVE_SUBTASK: null,
  TASK_PROGRESS: null,
  SUBTASK_PROGRESS: null,
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
    await update_movies();
  } else if (task === 1) {
    STATUS.ACTIVE_TASK = "update shows";
    await update_shows();
  }
  STATUS.ACTIVE_TASK = null;
  STATUS.ACTIVE_SUBTASK = null;
  STATUS.TASK_PROGRESS = null;
  STATUS.SUBTASK_PROGRESS = null;
  return true;
}
