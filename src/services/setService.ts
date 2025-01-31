import { deleteSet, saveSet } from "@/db/sets";
import { ExerciseSet } from "@/types/models";
import * as Crypto from "expo-crypto";
export const getBestSet = (sets: ExerciseSet[]) => {
  return sets.reduce((bestSet: ExerciseSet | null, set) => {
    return (set?.oneRM || 0) > (bestSet?.oneRM || 0) ? set : bestSet;
  }, null);
};

export const getSetTotalWeight = (set: ExerciseSet) => {
  return (set.weight || 0) * (set.reps || 0);
};

export const createSet = (exerciseId: string) => {
  const newSet: ExerciseSet = {
    id: Crypto.randomUUID(),
    exerciseId,
  };
  saveSet(newSet);
  return newSet;
};

export const updateSet = (
  set: ExerciseSet,
  updatedField: Pick<ExerciseSet, "reps" | "weight">
) => {
  const updatedSet = { ...set };
  if (updatedField.reps !== undefined) {
    updatedSet.reps = updatedField.reps;
  }
  if (updatedField.weight !== undefined) {
    updatedSet.weight = updatedField.weight;
  }
  if (updatedSet.weight !== undefined && updatedSet.reps !== undefined) {
    updatedSet.oneRM = updatedSet.weight * (36.0 / (37.0 - updatedSet.reps));
  }
  saveSet(updatedSet);
  return updatedSet;
};

const isComplete = (set: ExerciseSet) => {
  return set.reps && set.reps > 0;
};

export const cleanSets = (sets: ExerciseSet[]) => {
  const completeSets = sets.filter(isComplete);
  const incompleteSet = sets.filter((s) => !isComplete(s));

  incompleteSet.forEach(({ id }) => deleteSet(id));

  return completeSets;
};
