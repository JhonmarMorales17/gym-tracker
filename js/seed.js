// Default exercises data
const defaultExercises = [
    { name: 'Press de banca', muscleGroup: 'Pecho', type: 'Máquina', description: 'Ejercicio fundamental para el desarrollo del pecho, hombros y tríceps' },
    { name: 'Sentadilla', muscleGroup: 'Piernas', type: 'Peso propio', description: 'Ejercicio compuesto para piernas, glúteos y core' },
    { name: 'Peso muerto', muscleGroup: 'Espalda', type: 'Máquina', description: 'Ejercicio para espalda baja, glúteos y femoral' },
    { name: 'Press militar', muscleGroup: 'Hombros', type: 'Máquina', description: 'Desarrollo de hombros y tríceps' },
    { name: 'Curl de bíceps', muscleGroup: 'Brazos', type: 'Máquina', description: 'Aislamiento de bíceps' },
    { name: 'Extensiones de tríceps', muscleGroup: 'Brazos', type: 'Máquina', description: 'Aislamiento de tríceps' },
    { name: 'Jalones dorsales', muscleGroup: 'Espalda', type: 'Máquina', description: 'Desarrollo de espalda ancha' },
    { name: 'Prensa de piernas', muscleGroup: 'Piernas', type: 'Máquina', description: 'Ejercicio para cuádriceps y glúteos' },
    { name: 'Elevaciones laterales', muscleGroup: 'Hombros', type: 'Máquina', description: 'Aislamiento del deltoides lateral' },
    { name: 'Remo con barra', muscleGroup: 'Espalda', type: 'Máquina', description: 'Desarrollo de espalda media' },
    { name: 'Fondos en paralelas', muscleGroup: 'Pecho', type: 'Peso propio', description: 'Ejercicio para pecho y tríceps' },
    { name: 'Dominadas', muscleGroup: 'Espalda', type: 'Peso propio', description: 'Desarrollo de espalda y bíceps' }
];

// Default routines data
const defaultRoutines = [
    {
        name: 'Día de Pecho y Tríceps',
        description: 'Rutina enfocada en el desarrollo del pecho y tríceps',
        exercises: [],
        createdAt: new Date().toISOString()
    },
    {
        name: 'Día de Espalda y Bíceps',
        description: 'Rutina para espalda y bíceps',
        exercises: [],
        createdAt: new Date().toISOString()
    },
    {
        name: 'Día de Piernas',
        description: 'Rutina completa de piernas',
        exercises: [],
        createdAt: new Date().toISOString()
    }
];

async function seedDatabase() {
    try {
        // Check if exercises already exist
        const existingExercises = await dbManager.getAll('exercises');
        if (existingExercises.length === 0) {
            console.log('Seeding exercises...');
            for (const exercise of defaultExercises) {
                await dbManager.add('exercises', exercise);
            }
            console.log(`${defaultExercises.length} exercises added`);
        }
        
        // Check if routines already exist
        const existingRoutines = await dbManager.getAll('routines');
        if (existingRoutines.length === 0) {
            console.log('Seeding routines...');
            for (const routine of defaultRoutines) {
                await dbManager.add('routines', routine);
            }
            console.log(`${defaultRoutines.length} routines added`);
        }
        
        console.log('Database seeding completed');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}