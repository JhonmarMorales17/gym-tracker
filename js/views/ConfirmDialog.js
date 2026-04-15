class ConfirmDialog extends HTMLElement {
    constructor() {
        super();
        this.style.display = 'none';
        this.callback = null;
        this.render();
    }
    
    render() {
        this.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <h3>⚠️ Confirmar acción</h3>
                    <p class="dialog-message"></p>
                    <div class="dialog-buttons">
                        <button class="btn-cancel">Cancelar</button>
                        <button class="btn-confirm">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
        
        this.querySelector('.btn-cancel').onclick = () => this.hide();
        this.querySelector('.btn-confirm').onclick = () => {
            if (this.callback) this.callback();
            this.hide();
        };
    }
    
    show(message, onConfirm) {
        this.style.display = 'flex';
        this.querySelector('.dialog-message').textContent = message;
        this.callback = onConfirm;
    }
    
    hide() {
        this.style.display = 'none';
        this.callback = null;
    }
}

customElements.define('confirm-dialog', ConfirmDialog);