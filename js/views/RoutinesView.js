// Routines View (Placeholder)
class RoutinesView {
    constructor(container) {
        this.container = container;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>📋 Rutinas</h2>
                    <button class="btn-primary" id="addRoutineBtn">+ Nueva Rutina</button>
                </div>
                <div class="empty-state">
                    📭 Funcionalidad en desarrollo<br>
                    Próximamente podrás crear y gestionar rutinas
                </div>
            </div>
        `;
        
        this.container.querySelector('#addRoutineBtn')?.addEventListener('click', () => {
            alert('Funcionalidad en desarrollo. Próximamente disponible.');
        });
    }
}