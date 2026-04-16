// Dashboard View with Charts - Versión Corregida
class DashboardView {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }
    
    async render() {
        await this.loadData();
        this.renderHTML();
        
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            this.initCharts();
        }, 100);
    }
    
    async loadData() {
        this.exercises = await dbManager.getAll('exercises');
        this.routines = await dbManager.getAll('routines');
        this.sessions = await dbManager.getAll('sessions');
        this.calculateStats();
    }
    
    calculateStats() {
        this.totalSessions = this.sessions.length;
        
        const uniqueDays = new Set();
        this.sessions.forEach(session => {
            const date = new Date(session.date).toDateString();
            uniqueDays.add(date);
        });
        this.daysTrained = uniqueDays.size;
        
        this.streak = this.calculateStreak();
        this.bestExercise = this.getBestProgressExercise();
        this.totalExercises = this.exercises.length;
        this.totalRoutines = this.routines.length;
    }
    
    calculateStreak() {
        if (this.sessions.length === 0) return 0;
        
        const dates = this.sessions.map(s => new Date(s.date).toDateString());
        const uniqueDates = [...new Set(dates)].sort();
        
        let streak = 1;
        let currentStreak = 1;
        
        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1]);
            const currDate = new Date(uniqueDates[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                currentStreak++;
                streak = Math.max(streak, currentStreak);
            } else if (diffDays > 1) {
                currentStreak = 1;
            }
        }
        
        return streak;
    }
    
    getBestProgressExercise() {
        const exerciseProgress = {};
        
        this.sessions.forEach(session => {
            session.exercises?.forEach(ex => {
                if (!exerciseProgress[ex.name]) {
                    exerciseProgress[ex.name] = { weights: [] };
                }
                const maxWeight = Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0));
                if (maxWeight > 0) {
                    exerciseProgress[ex.name].weights.push(maxWeight);
                }
            });
        });
        
        let bestExercise = null;
        let bestProgress = 0;
        
        for (const [name, data] of Object.entries(exerciseProgress)) {
            if (data.weights.length >= 2) {
                const first = data.weights[0];
                const last = data.weights[data.weights.length - 1];
                const progress = ((last - first) / first) * 100;
                
                if (progress > bestProgress) {
                    bestProgress = progress;
                    bestExercise = { name, progress: progress.toFixed(1) };
                }
            }
        }
        
        return bestExercise || { name: 'Crea sesiones', progress: 0 };
    }
    
    renderHTML() {
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>📊 Dashboard</h2>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${this.totalSessions}</div>
                        <div class="stat-label">Sesiones totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.daysTrained}</div>
                        <div class="stat-label">Días entrenados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.streak}</div>
                        <div class="stat-label">Racha actual</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.totalExercises}</div>
                        <div class="stat-label">Ejercicios</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.totalRoutines}</div>
                        <div class="stat-label">Rutinas</div>
                    </div>
                </div>
                
                <div class="stats-grid" style="margin-bottom: 2rem;">
                    <div class="stat-card">
                        <div class="stat-number">🏆</div>
                        <div class="stat-label">Mejor progreso</div>
                        <div style="margin-top: 0.5rem;">
                            <strong>${this.escapeHtml(this.bestExercise.name)}</strong><br>
                            <small>+${this.bestExercise.progress}%</small>
                        </div>
                    </div>
                </div>
                
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>📈 Frecuencia de entrenamiento</h3>
                        <canvas id="frequencyChart" style="max-height: 300px;"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>📊 Progreso de peso</h3>
                        <select id="exerciseSelector" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border-radius: 10px;">
                            <option value="">Selecciona un ejercicio</option>
                            ${this.getExerciseOptions()}
                        </select>
                        <canvas id="progressChart" style="max-height: 300px;"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>🎯 Distribución por grupo muscular</h3>
                        <canvas id="muscleChart" style="max-height: 300px;"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>📊 Volumen total</h3>
                        <canvas id="volumeChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>
                
                <div class="recent-sessions" style="margin-top: 2rem;">
                    <h3>📝 Sesiones recientes</h3>
                    <ul>
                        ${this.renderRecentSessions()}
                    </ul>
                </div>
            </div>
        `;
    }
    
    getExerciseOptions() {
        const exercisesSet = new Set();
        this.sessions.forEach(session => {
            session.exercises?.forEach(ex => {
                exercisesSet.add(ex.name);
            });
        });
        
        if (exercisesSet.size === 0) {
            return '<option value="">No hay ejercicios registrados</option>';
        }
        
        return Array.from(exercisesSet).map(name => 
            `<option value="${this.escapeHtml(name)}">${this.escapeHtml(name)}</option>`
        ).join('');
    }
    
    renderRecentSessions() {
        const recent = [...this.sessions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recent.length === 0) {
            return '<li>No hay sesiones registradas. ¡Crea tu primera sesión!</li>';
        }
        
        return recent.map(session => {
            const totalSets = session.exercises?.reduce((sum, ex) => sum + ex.sets.length, 0) || 0;
            return `
                <li>
                    📅 ${new Date(session.date).toLocaleDateString()} - 
                    ${session.exercises?.length || 0} ejercicios, 
                    ${totalSets} series
                </li>
            `;
        }).join('');
    }
    
    initCharts() {
        console.log('Iniciando gráficos...');
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            return;
        }
        
        this.createFrequencyChart();
        this.setupProgressChart();
        this.createMuscleChart();  // ← Versión corregida
        this.createVolumeChart();
    }
    
    createFrequencyChart() {
        const ctx = document.getElementById('frequencyChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }
        
        let labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
        let data = [0, 0, 0, 0, 0, 0, 0, 0];
        
        if (this.sessions.length > 0) {
            const weeksData = this.getWeeksData();
            labels = weeksData.labels;
            data = weeksData.data;
        }
        
        this.charts.frequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sesiones',
                    data: data,
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
    
    getWeeksData() {
        const now = new Date();
        const weeks = [];
        const sessionCount = [];
        
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            weeks.push(`Sem ${8 - i}`);
            
            const count = this.sessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= weekStart && sessionDate <= weekEnd;
            }).length;
            
            sessionCount.push(count);
        }
        
        return { labels: weeks, data: sessionCount };
    }
    
    setupProgressChart() {
        const selector = document.getElementById('exerciseSelector');
        if (!selector) return;
        
        selector.addEventListener('change', (e) => {
            const exerciseName = e.target.value;
            if (exerciseName) {
                this.createProgressChart(exerciseName);
            }
        });
        
        const firstOption = selector.querySelector('option:not([value=""])');
        if (firstOption && firstOption.value) {
            this.createProgressChart(firstOption.value);
        }
    }
    
    createProgressChart(exerciseName) {
        const ctx = document.getElementById('progressChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.progress) {
            this.charts.progress.destroy();
        }
        
        const progress = this.getExerciseProgress(exerciseName);
        
        if (progress.dates.length === 0) {
            this.charts.progress = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        label: 'No hay datos de progreso',
                        data: [0],
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderColor: '#2196F3',
                        borderWidth: 2
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true }
            });
            return;
        }
        
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progress.dates,
                datasets: [{
                    label: `Progreso - ${exerciseName}`,
                    data: progress.weights,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderColor: '#2196F3',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { title: { display: true, text: 'Peso (kg)' } },
                    x: { title: { display: true, text: 'Fecha' } }
                }
            }
        });
    }
    
    getExerciseProgress(exerciseName) {
        const progress = [];
        
        const sessionsWithExercise = this.sessions.filter(session => {
            return session.exercises?.some(ex => ex.name === exerciseName);
        });
        
        sessionsWithExercise.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sessionsWithExercise.forEach(session => {
            const exercise = session.exercises?.find(ex => ex.name === exerciseName);
            if (exercise && exercise.sets.length > 0) {
                const maxWeight = Math.max(...exercise.sets.map(s => parseFloat(s.weight) || 0));
                if (maxWeight > 0) {
                    progress.push({
                        date: new Date(session.date).toLocaleDateString(),
                        weight: maxWeight
                    });
                }
            }
        });
        
        return {
            dates: progress.map(p => p.date),
            weights: progress.map(p => p.weight)
        };
    }
    
    // ========== FUNCIÓN CORREGIDA DEL GRÁFICO MUSCULAR ==========
    createMuscleChart() {
        const ctx = document.getElementById('muscleChart')?.getContext('2d');
        if (!ctx) {
            console.error('No se encontró el canvas muscleChart');
            return;
        }
        
        if (this.charts.muscle) {
            this.charts.muscle.destroy();
        }
        
        // Contar ejercicios por grupo muscular
        const muscleCount = {};
        
        console.log('Procesando sesiones para gráfico muscular:', this.sessions.length);
        
        // Recorrer todas las sesiones
        this.sessions.forEach(session => {
            if (session.exercises && session.exercises.length > 0) {
                session.exercises.forEach(ex => {
                    // Verificar que el ejercicio tiene grupo muscular
                    let muscle = ex.muscleGroup;
                    
                    // Si no tiene muscleGroup, intentar obtenerlo de la base de datos
                    if (!muscle && ex.id) {
                        // Buscar el ejercicio original
                        const originalEx = this.exercises.find(e => e.id === ex.id);
                        if (originalEx) {
                            muscle = originalEx.muscleGroup;
                        }
                    }
                    
                    if (muscle) {
                        muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
                        console.log(`Contado: ${muscle} - Total: ${muscleCount[muscle]}`);
                    } else {
                        console.log('Ejercicio sin grupo muscular:', ex.name);
                    }
                });
            }
        });
        
        // Si no hay datos de sesiones, usar los ejercicios de la base de datos
        if (Object.keys(muscleCount).length === 0) {
            console.log('No hay datos de sesiones, usando ejercicios disponibles');
            
            // Usar los ejercicios de la base de datos
            this.exercises.forEach(ex => {
                if (ex.muscleGroup) {
                    muscleCount[ex.muscleGroup] = (muscleCount[ex.muscleGroup] || 0) + 1;
                }
            });
        }
        
        // Si todavía no hay datos, mostrar datos de ejemplo
        if (Object.keys(muscleCount).length === 0) {
            console.log('No hay datos, mostrando ejemplo');
            muscleCount['Pecho'] = 25;
            muscleCount['Espalda'] = 20;
            muscleCount['Piernas'] = 30;
            muscleCount['Hombros'] = 15;
            muscleCount['Brazos'] = 10;
        }
        
        // Colores para cada grupo muscular
        const muscleColors = {
            'Pecho': '#FF6384',
            'Espalda': '#36A2EB',
            'Piernas': '#FFCE56',
            'Hombros': '#4BC0C0',
            'Brazos': '#9966FF'
        };
        
        console.log('Datos para gráfico muscular:', muscleCount);
        
        // Crear el gráfico
        this.charts.muscle = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(muscleCount),
                datasets: [{
                    data: Object.values(muscleCount),
                    backgroundColor: Object.keys(muscleCount).map(m => muscleColors[m] || '#CCCCCC'),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Gráfico muscular creado correctamente');
    }
    // ========== FIN DE LA FUNCIÓN CORREGIDA ==========
    
    createVolumeChart() {
        const ctx = document.getElementById('volumeChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.volume) {
            this.charts.volume.destroy();
        }
        
        let labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
        let data = [0, 0, 0, 0, 0, 0, 0, 0];
        
        if (this.sessions.length > 0) {
            const volumeData = this.getWeeklyVolume();
            labels = volumeData.labels;
            data = volumeData.data;
        }
        
        this.charts.volume = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Volumen total (kg)',
                    data: data,
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderColor: '#FF6384',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#FF6384',
                    pointBorderColor: '#fff',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        title: { display: true, text: 'Volumen (kg)' },
                        ticks: { callback: function(value) { return value.toLocaleString(); } }
                    },
                    x: { title: { display: true, text: 'Semana' } }
                }
            }
        });
    }
    
    getWeeklyVolume() {
        const weeks = [];
        const volumes = [];
        
        const now = new Date();
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            weeks.push(`Sem ${8 - i}`);
            
            let weeklyVolume = 0;
            
            this.sessions.forEach(session => {
                const sessionDate = new Date(session.date);
                if (sessionDate >= weekStart && sessionDate <= weekEnd) {
                    session.exercises?.forEach(exercise => {
                        exercise.sets?.forEach(set => {
                            const weight = parseFloat(set.weight) || 0;
                            const reps = parseFloat(set.reps) || 0;
                            weeklyVolume += weight * reps;
                        });
                    });
                }
            });
            
            volumes.push(weeklyVolume);
        }
        
        return { labels: weeks, data: volumes };
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}