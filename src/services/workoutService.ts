import {
  WorkoutWithExercises,
  type ExerciseWithSets,
  type Workout,
} from "@/types/models";
import {
  addSetsToExercise,
  cleanExercise,
  getExerciseTotalWeight,
} from "@/services/exerciseService";
import * as Crypto from "expo-crypto";
import { getCurrentWorkout, getWorkouts, saveWorkout } from "@/db/workouts";
import { getExercises } from "@/db/exercises";

export const getWorkoutTotalWeight = (workout: WorkoutWithExercises) => {
  return workout.exercises.reduce(
    (total, exercise) => total + getExerciseTotalWeight(exercise),
    0
  );
};
export const newWorkout = () => {
  const newWorkout: WorkoutWithExercises = {
    id: Crypto.randomUUID(),
    createdAt: new Date(),
    finishedAt: null,
    exercises: [],
  };
  //save to databse
  saveWorkout(newWorkout);
  return newWorkout;
};

export const finishWorkout = (workout: WorkoutWithExercises) => {
  const cleanedWorkout = cleanWorkout(workout);

  const finishedWorkout: WorkoutWithExercises = {
    ...cleanedWorkout,
    finishedAt: new Date(),
  };
  saveWorkout(finishedWorkout);
  return finishedWorkout;
};

export const cleanWorkout = (workout: WorkoutWithExercises) => {
  const cleanedExercises = workout.exercises
    .map(cleanExercise)
    .filter((e) => e !== null);
  return {
    ...workout,
    exercises: cleanedExercises,
  };
};

const addExercisesToWorkout = async (
  workout: Workout
): Promise<WorkoutWithExercises> => {
  const exercises = await getExercises(workout.id);
  const exercisesWithSets = await Promise.all(exercises.map(addSetsToExercise));
  return {
    ...workout,
    exercises: exercisesWithSets,
  };
};

export const getCurrentWorkoutWithExercises =
  async (): Promise<WorkoutWithExercises | null> => {
    const workout = await getCurrentWorkout();
    if (workout) {
      return await addExercisesToWorkout(workout);
    }
    return null;
  };
export const getWorkoutsWithExercises = async (): Promise<
  WorkoutWithExercises[]
> => {
  const workouts = await getWorkouts();

  return await Promise.all(workouts.map(addExercisesToWorkout));
};
