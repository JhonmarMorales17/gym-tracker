class ErrorState extends HTMLElement {
    constructor() {
        super();
        this.message = this.getAttribute('message') || 'Ocurrió un error';
        this.render();
    }
    
    render() {
        this.innerHTML = `
            <div class="error-container">
                <div style="font-size: 3rem;">⚠️</div>
                <p>${this.message}</p>
            </div>
        `;
    }
    
    show(message) {
        this.message = message;
        this.render();
        this.style.display = 'flex';
    }
    
    hide() {
        this.style.display = 'none';
    }
}

customElements.define('error-state', ErrorState);