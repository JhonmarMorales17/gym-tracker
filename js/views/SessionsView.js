// Sessions View (Placeholder)
class SessionsView {
    constructor(container) {
        this.container = container;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>📅 Sesiones</h2>
                    <button class="btn-primary" id="addSessionBtn">+ Nueva Sesión</button>
                </div>
                <div class="empty-state">
                    📭 Funcionalidad en desarrollo<br>
                    Próximamente podrás registrar tus entrenamientos
                </div>
            </div>
        `;
        
        this.container.querySelector('#addSessionBtn')?.addEventListener('click', () => {
            alert('Funcionalidad en desarrollo. Próximamente disponible.');
        });
    }
}