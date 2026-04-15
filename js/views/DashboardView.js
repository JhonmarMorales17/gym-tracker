// Dashboard View
class DashboardView {
    constructor(container) {
        this.container = container;
    }
    
    async render() {
        const exercises = await dbManager.getAll('exercises');
        const routines = await dbManager.getAll('routines');
        const sessions = await dbManager.getAll('sessions');
        
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>📊 Dashboard</h2>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${exercises.length}</div>
                        <div class="stat-label">Ejercicios</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${routines.length}</div>
                        <div class="stat-label">Rutinas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${sessions.length}</div>
                        <div class="stat-label">Sesiones</div>
                    </div>
                </div>
                
                <div class="recent-sessions">
                    <h3>Estado del Proyecto</h3>
                    <ul>
                        <li> todavia falta un poco mas de info en el dashboard, pero se esta trabajando en eso</li>
                    </ul>
                </div>
            </div>
        `;
    }
}