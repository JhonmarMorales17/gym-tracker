// Main Application
class App {
    constructor() {
        this.currentView = null;
        this.init();
    }
    
    async init() {
        await dbManager.init();
        await seedDatabase();
        this.setupNavigation();
        this.showView('dashboard');
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const view = link.getAttribute('data-view');
                this.showView(view);
            });
        });
    }
    
    async showView(viewName) {
        const mainContainer = document.querySelector('#main-content');
        mainContainer.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Cargando...</p></div>';
        
        let view;
        switch(viewName) {
            case 'dashboard':
                view = new DashboardView(mainContainer);
                break;
            case 'exercises':
                view = new ExercisesView(mainContainer);
                break;
            case 'routines':
                view = new RoutinesView(mainContainer);
                break;
            case 'sessions':
                view = new SessionsView(mainContainer);
                break;
            default:
                view = new DashboardView(mainContainer);
        }
        
        await view.render();
        this.updateActiveNav(viewName);
    }
    
    updateActiveNav(activeView) {
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-view') === activeView) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});