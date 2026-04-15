class ExerciseForm extends HTMLElement {
    constructor() {
        super();
        this.exercise = null;
        this.onSave = null;
        this.onCancel = null;
        this.render();
    }
    
    setData(exercise, onSave, onCancel) {
        this.exercise = exercise;
        this.onSave = onSave;
        this.onCancel = onCancel;
        this.render();
        if (this.exercise) {
            this.fillForm();
        }
    }
    
    render() {
        this.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <h3>${this.exercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}</h3>
                    <form id="exerciseForm">
                        <div class="form-group">
                            <label>Nombre del ejercicio *</label>
                            <input type="text" id="name" required>
                        </div>
                        <div class="form-group">
                            <label>Grupo muscular *</label>
                            <select id="muscleGroup" required>
                                <option value="">Seleccionar...</option>
                                <option value="Pecho">Pecho</option>
                                <option value="Espalda">Espalda</option>
                                <option value="Piernas">Piernas</option>
                                <option value="Hombros">Hombros</option>
                                <option value="Brazos">Brazos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select id="type" required>
                                <option value="">Seleccionar...</option>
                                <option value="Máquina">Máquina</option>
                                <option value="Peso propio">Peso propio</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Descripción (opcional)</label>
                            <textarea id="description" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelBtn">Cancelar</button>
                            <button type="submit" class="btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.querySelector('#exerciseForm').onsubmit = (e) => {
            e.preventDefault();
            this.save();
        };
        
        this.querySelector('#cancelBtn').onclick = () => this.onCancel?.();
    }
    
    fillForm() {
        this.querySelector('#name').value = this.exercise.name || '';
        this.querySelector('#muscleGroup').value = this.exercise.muscleGroup || '';
        this.querySelector('#type').value = this.exercise.type || '';
        this.querySelector('#description').value = this.exercise.description || '';
    }
    
    save() {
        const exerciseData = {
            name: this.querySelector('#name').value,
            muscleGroup: this.querySelector('#muscleGroup').value,
            type: this.querySelector('#type').value,
            description: this.querySelector('#description').value
        };
        
        if (!exerciseData.name || !exerciseData.muscleGroup || !exerciseData.type) {
            alert('Por favor complete los campos requeridos');
            return;
        }
        
        this.onSave?.(exerciseData);
    }
}

customElements.define('exercise-form', ExerciseForm);