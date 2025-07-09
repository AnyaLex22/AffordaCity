import { getUserCalculations, updateCalculation, deleteCalculation } from './api/client';

const handleUpdate = async () => {
  const timestamp = '2024-07-08T12:00:00Z';
  const salary = 50000;
  await updateCalculation(timestamp, salary);
};

const handleDelete = async () => {
  const timestamp = '2024-07-08T12:00:00Z';
  await deleteCalculation(timestamp);
};

const loadCalculations = async () => {
  const history = await getUserCalculations();
  console.log(history);
};
