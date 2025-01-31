import { ExerciseWithSets, type Exercise } from "@/types/models";
import { cleanSets, createSet, getSetTotalWeight } from "@/services/setService";
import * as Crypto from "expo-crypto";
import { deleteExercise, saveExercise } from "@/db/exercises";
import { getSets } from "@/db/sets";
export const getExerciseTotalWeight = (exercise: ExerciseWithSets) => {
  return exercise.sets.reduce(
    (totalSetWeight, set) => totalSetWeight + getSetTotalWeight(set),
    0
  );
};

export const createExercise = (name: string, workoutId: string) => {
  const newExercise: ExerciseWithSets = {
    id: Crypto.randomUUID(),
    name,
    workoutId,
    sets: [],
  };
  // save to db
  saveExercise(newExercise);

  // add one empty set

  newExercise.sets.push(createSet(newExercise.id));

  return newExercise;
};

export const cleanExercise = (exercise: ExerciseWithSets) => {
  const cleanedSets = cleanSets(exercise.sets);

  if (cleanedSets.length === 0) {
    deleteExercise(exercise.id);
    return null;
  }
  return {
    ...exercise,
    sets: cleanedSets,
  };
};
export const addSetsToExercise = async (
  exercise: Exercise
): Promise<ExerciseWithSets> => {
  const sets = await getSets(exercise.id);

  return {
    ...exercise,
    sets,
  };
};
