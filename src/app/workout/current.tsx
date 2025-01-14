import { View, Text } from '@/components/general/Themed';
import WorkoutExerciseItem from '@/components/logger/WorkoutExerciseItem';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import CustomButton from '@/components/general/CustomButton';
import WorkoutHeader from '@/components/logger/WorkoutHeader';
import SelectExerciseModal from '@/components/logger/SelectExerciseModal';

export default function CurrentWorkoutScreen() {
  const headerHeight = useHeaderHeight();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <CustomButton
              onPress={() => console.warn('Finish workout')}
              title="Finish"
              style={{ padding: 7, paddingHorizontal: 15, width: 'auto' }}
            />
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          data={[1, 2, 3]}
          contentContainerStyle={{ gap: 10, padding: 10 }}
          renderItem={() => <WorkoutExerciseItem />}
          ListHeaderComponent={<WorkoutHeader />}
          ListFooterComponent={
            <SelectExerciseModal
              onSelectExercise={(name) =>
                console.warn('Exercise seleted: ', name)
              }
            />
          }
        />
      </KeyboardAvoidingView>
    </>
  );
}
