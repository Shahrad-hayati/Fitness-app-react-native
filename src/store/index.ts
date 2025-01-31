import type { ExerciseSet, WorkoutWithExercises } from "@/types/models";
import { create } from "zustand";
import {
  finishWorkout,
  getCurrentWorkoutWithExercises,
  getWorkoutsWithExercises,
  newWorkout,
} from "@/services/workoutService";
import { createExercise } from "@/services/exerciseService";
import { immer } from "zustand/middleware/immer";
import { createSet } from "@/services/setService";
import { deleteSet } from "@/db/sets";

type State = {
  currentWorkout: WorkoutWithExercises | null;
  workouts: WorkoutWithExercises[];
};
type Actions = {
  loadWorkouts: () => Promise<void>;
  startWorkout: () => void;
  finishWorkout: () => void;

  addExercise: (name: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (
    setId: string,
    updatedFields: Partial<Pick<ExerciseSet, "reps" | "weight">>
  ) => void;

  deleteSet: (setId: string) => void;
};

export const useWorkouts = create<State & Actions>()(
  immer((set, get) => ({
    //State
    currentWorkout: null,
    workouts: [],
    //Actions
    loadWorkouts: async () => {
      set({
        currentWorkout: await getCurrentWorkoutWithExercises(),
        workouts: await getWorkoutsWithExercises(),
      });
    },
    startWorkout: () => {
      set({ currentWorkout: newWorkout() });
    },
    finishWorkout: () => {
      const { currentWorkout } = get();

      if (!currentWorkout) {
        return;
      }

      const finishedWorkout = finishWorkout(currentWorkout);

      set((state) => {
        state.currentWorkout = null;
        state.workouts.unshift(finishedWorkout);
      });

      // set((state) => ({
      //   currentWorkout: null,
      //   workouts: [finishedWorkout, ...state.workouts],
      // }));
    },
    addExercise: (name: string) => {
      const { currentWorkout } = get();

      if (!currentWorkout) {
        return;
      }

      const newExercise = createExercise(name, currentWorkout.id);

      set((state) => {
        state.currentWorkout?.exercises.push(newExercise);
      });

      // set((state) => ({
      //   currentWorkout: state.currentWorkout && {
      //     ...state.currentWorkout,
      //     exercises: [...state.currentWorkout?.exercises, newExercise],
      //   },
      // }));
    },
    addSet: async (exerciseId) => {
      const newSet = createSet(exerciseId);

      set(({ currentWorkout }) => {
        const exercise = currentWorkout?.exercises.find(
          (e) => e.id === exerciseId
        );
        exercise?.sets?.push(newSet);
      });
    },
    updateSet: (setId, updatedFields) => {
      set(({ currentWorkout }) => {
        const exercise = currentWorkout?.exercises.find((exercise) =>
          exercise.sets.some((set) => set.id === setId)
        );
        if (!exercise) {
          return;
        }

        const setIndex = exercise.sets.findIndex((set) => set.id === setId);

        if (!exercise || setIndex === undefined || setIndex === -1) {
          return;
        }

        const currentSet = exercise.sets[setIndex];
        Object.assign(currentSet, updatedFields);
        // const updatedSet = updateSet(
        //   current(exercise.sets[setIndex]),
        //   updatedFields
        // );

        // exercise.sets[setIndex] = updatedSet;
      });
    },
    deleteSet: (setId) => {
      deleteSet(setId); // delete at the databse layer
      set(({ currentWorkout }) => {
        if (!currentWorkout) {
          return;
        }
        const exercise = currentWorkout?.exercises.find((exercise) =>
          exercise.sets.some((set) => set.id === setId)
        );
        if (!exercise) {
          return;
        }
        exercise.sets = exercise.sets.filter((set) => set.id !== setId);
        if (exercise.sets.length === 0) {
          // that was the last set
          currentWorkout.exercises = currentWorkout.exercises.filter(
            (ex) => ex.id !== exercise.id
          );
        }
      });
    },
  }))
);
