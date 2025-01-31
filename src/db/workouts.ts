import type { Workout } from "@/types/models";
import { getDB } from ".";
import type { DbWorkout } from "@/types/db";
export const saveWorkout = async (workout: Workout) => {
  try {
    const db = await getDB();

    await db.runAsync(
      "INSERT OR REPLACE INTO workouts (id, created_at, finished_at) VALUES (?, ?, ?);",
      workout.id,
      workout.createdAt.toISOString(),
      workout.finishedAt?.toISOString() || null
    );
  } catch (error) {
    console.error(error);
  }
};
const parseWorkout = (workout: DbWorkout): Workout => {
  return {
    id: workout.id,
    createdAt: new Date(workout.created_at),
    finishedAt: workout.finished_at ? new Date(workout.finished_at) : null,
  };
};

export const getCurrentWorkout = async (): Promise<Workout | null> => {
  try {
    const db = await getDB();

    const workout = await db.getFirstAsync<DbWorkout>(`SELECT * FROM workouts
      WHERE finished_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `);
    if (!workout) {
      return null;
    }
    console.log("RES:", workout);
    return parseWorkout(workout);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const db = await getDB();
    const workout = await db.getAllAsync<DbWorkout>(`
      SELECT * FROM workouts
      WHERE finished_at IS NOT NULL
      ORDER BY created_at DESC
      `);
    return workout.map(parseWorkout);
  } catch (error) {
    console.log(error);
    return [];
  }
};
