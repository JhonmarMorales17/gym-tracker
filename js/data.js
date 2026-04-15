// Default exercises data
const defaultExercises = [
    { name: 'Press de banca', muscleGroup: 'Pecho', type: 'Máquina', description: 'Ejercicio fundamental para el pecho' },
    { name: 'Sentadilla', muscleGroup: 'Piernas', type: 'Peso propio', description: 'Ejercicio para piernas' },
    { name: 'Peso muerto', muscleGroup: 'Espalda', type: 'Máquina', description: 'Ejercicio para espalda' },
    { name: 'Press militar', muscleGroup: 'Hombros', type: 'Máquina', description: 'Desarrollo de hombros' },
    { name: 'Curl de bíceps', muscleGroup: 'Brazos', type: 'Máquina', description: 'Aislamiento de bíceps' },
    { name: 'Extensiones de tríceps', muscleGroup: 'Brazos', type: 'Máquina', description: 'Aislamiento de tríceps' },
    { name: 'Jalones dorsales', muscleGroup: 'Espalda', type: 'Máquina', description: 'Desarrollo de espalda' },
    { name: 'Prensa de piernas', muscleGroup: 'Piernas', type: 'Máquina', description: 'Para cuádriceps' }
];

async function seedDatabase() {
    const existing = await dbManager.getAll('exercises');
    if (existing.length === 0) {
        for (const exercise of defaultExercises) {
            await dbManager.add('exercises', exercise);
        }
        console.log('Database seeded with default exercises');
    }
}