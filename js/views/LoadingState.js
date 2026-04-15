class LoadingState extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    
    render() {
        this.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        `;
    }
    
    show() {
        this.style.display = 'flex';
    }
    
    hide() {
        this.style.display = 'none';
    }
}

customElements.define('loading-state', LoadingState);