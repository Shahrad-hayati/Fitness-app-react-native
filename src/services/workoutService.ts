import { WorkoutWithExercises } from '@/types/models';
import { getExerciseTotalWeight } from '@/services/exerciseService';

export const getWorkoutTotalWeight = (workout: WorkoutWithExercises) => {
  return workout.exercises.reduce(
    (total, exercise) => total + getExerciseTotalWeight(exercise),
    0
  );
};
