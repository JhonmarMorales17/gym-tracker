// Exercises View with full CRUD
class ExercisesView {
    constructor(container) {
        this.container = container;
        this.exercises = [];
    }
    
    async render() {
        await this.loadExercises();
        this.renderHTML();
        this.attachEvents();
    }
    
    async loadExercises() {
        this.exercises = await dbManager.getAll('exercises');
    }
    
    renderHTML() {
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>💪 Ejercicios</h2>
                    <button class="btn-primary" id="addExerciseBtn">+ Nuevo Ejercicio</button>
                </div>
                
                <div class="filters">
                    <input type="text" id="searchInput" placeholder="🔍 Buscar ejercicio...">
                    <select id="muscleFilter">
                        <option value="">Todos los grupos</option>
                        <option value="Pecho">Pecho</option>
                        <option value="Espalda">Espalda</option>
                        <option value="Piernas">Piernas</option>
                        <option value="Hombros">Hombros</option>
                        <option value="Brazos">Brazos</option>
                    </select>
                </div>
                
                <div id="exercisesList" class="exercises-grid">
                    ${this.renderExercises()}
                </div>
            </div>
        `;
    }
    
    renderExercises() {
        if (this.exercises.length === 0) {
            return '<p class="empty-state">📭 No hay ejercicios. ¡Crea uno nuevo!</p>';
        }
        
        return this.exercises.map(ex => `
            <div class="exercise-card" data-id="${ex.id}">
                <div class="exercise-image">
                    ${this.getMuscleIcon(ex.muscleGroup)}
                </div>
                <div class="exercise-info">
                    <h3>${this.escapeHtml(ex.name)}</h3>
                    <div>
                        <span class="muscle-group">${ex.muscleGroup}</span>
                        <span class="type">${ex.type}</span>
                    </div>
                    ${ex.description ? `<p class="description">${this.escapeHtml(ex.description)}</p>` : ''}
                </div>
                <div class="exercise-actions">
                    <button class="btn-edit" data-id="${ex.id}">✏️ Editar</button>
                    <button class="btn-delete" data-id="${ex.id}">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }
    
    getMuscleIcon(muscle) {
        const icons = {
            'Pecho': '💪',
            'Piernas': '🦵',
            'Espalda': '🔙',
            'Hombros': '🎯',
            'Brazos': '💪'
        };
        return icons[muscle] || '🏋️';
    }
    
    attachEvents() {
        this.container.querySelector('#addExerciseBtn')?.addEventListener('click', () => this.showForm());
        this.container.querySelector('#searchInput')?.addEventListener('input', () => this.filterExercises());
        this.container.querySelector('#muscleFilter')?.addEventListener('change', () => this.filterExercises());
        
        this.container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const exercise = this.exercises.find(ex => ex.id === id);
                this.showForm(exercise);
            });
        });
        
        this.container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const exercise = this.exercises.find(ex => ex.id === id);
                this.deleteExercise(exercise);
            });
        });
    }
    
    async filterExercises() {
        const searchTerm = this.container.querySelector('#searchInput')?.value.toLowerCase() || '';
        const muscleFilter = this.container.querySelector('#muscleFilter')?.value || '';
        
        let filtered = await dbManager.getAll('exercises');
        
        filtered = filtered.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchTerm);
            const matchesMuscle = !muscleFilter || ex.muscleGroup === muscleFilter;
            return matchesSearch && matchesMuscle;
        });
        
        this.exercises = filtered;
        const container = this.container.querySelector('#exercisesList');
        container.innerHTML = this.renderExercises();
        this.attachEvents();
    }
    
    showForm(exercise = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${exercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}</h3>
                <form id="exerciseForm">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="name" value="${exercise ? this.escapeHtml(exercise.name) : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Grupo muscular *</label>
                        <select id="muscleGroup" required>
                            <option value="">Seleccionar...</option>
                            <option value="Pecho" ${exercise?.muscleGroup === 'Pecho' ? 'selected' : ''}>Pecho</option>
                            <option value="Espalda" ${exercise?.muscleGroup === 'Espalda' ? 'selected' : ''}>Espalda</option>
                            <option value="Piernas" ${exercise?.muscleGroup === 'Piernas' ? 'selected' : ''}>Piernas</option>
                            <option value="Hombros" ${exercise?.muscleGroup === 'Hombros' ? 'selected' : ''}>Hombros</option>
                            <option value="Brazos" ${exercise?.muscleGroup === 'Brazos' ? 'selected' : ''}>Brazos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select id="type" required>
                            <option value="">Seleccionar...</option>
                            <option value="Máquina" ${exercise?.type === 'Máquina' ? 'selected' : ''}>Máquina</option>
                            <option value="Peso propio" ${exercise?.type === 'Peso propio' ? 'selected' : ''}>Peso propio</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea id="description" rows="3">${exercise ? this.escapeHtml(exercise.description || '') : ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelBtn">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#cancelBtn').onclick = () => modal.remove();
        modal.querySelector('#exerciseForm').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                name: modal.querySelector('#name').value,
                muscleGroup: modal.querySelector('#muscleGroup').value,
                type: modal.querySelector('#type').value,
                description: modal.querySelector('#description').value
            };
            
            if (exercise) {
                await dbManager.update('exercises', exercise.id, data);
            } else {
                await dbManager.add('exercises', data);
            }
            
            modal.remove();
            await this.render();
        };
    }
    
    async deleteExercise(exercise) {
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'dialog-overlay';
        confirmDialog.innerHTML = `
            <div class="dialog-content">
                <h3>⚠️ Confirmar</h3>
                <p>¿Eliminar "${exercise.name}"?</p>
                <div class="dialog-buttons">
                    <button class="btn-secondary" id="cancelDel">Cancelar</button>
                    <button class="btn-delete" id="confirmDel">Eliminar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        confirmDialog.querySelector('#cancelDel').onclick = () => confirmDialog.remove();
        confirmDialog.querySelector('#confirmDel').onclick = async () => {
            await dbManager.delete('exercises', exercise.id);
            confirmDialog.remove();
            await this.render();
        };
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}