// Routines View - CRUD Completo
class RoutinesView {
    constructor(container) {
        this.container = container;
        this.routines = [];
        this.exercises = [];
        this.currentRoutine = null;
    }
    
    async render() {
        await this.loadData();
        this.renderHTML();
        this.attachEvents();
    }
    
    async loadData() {
        this.routines = await dbManager.getAll('routines');
        this.exercises = await dbManager.getAll('exercises');
    }
    
    renderHTML() {
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>📋 Rutinas</h2>
                    <button class="btn-primary" id="addRoutineBtn">+ Nueva Rutina</button>
                </div>
                
                <div class="filters">
                    <input type="text" id="searchRoutine" placeholder="🔍 Buscar rutina...">
                </div>
                
                <div id="routinesList" class="routines-grid">
                    ${this.renderRoutines()}
                </div>
            </div>
        `;
    }
    
    renderRoutines() {
        if (this.routines.length === 0) {
            return '<p class="empty-state">📭 No hay rutinas. ¡Crea una nueva!</p>';
        }
        
        return this.routines.map(routine => `
            <div class="routine-card" data-id="${routine.id}">
                <div class="exercise-image">
                    📋
                </div>
                <div class="routine-info">
                    <h3>${this.escapeHtml(routine.name)}</h3>
                    ${routine.description ? `<p class="description">${this.escapeHtml(routine.description)}</p>` : ''}
                    <p style="color: #999; font-size: 0.85rem; margin-top: 0.5rem;">
                        📅 Creada: ${new Date(routine.createdAt).toLocaleDateString()}<br>
                        💪 Ejercicios: ${routine.exercises?.length || 0}
                    </p>
                </div>
                <div class="routine-actions">
                    <button class="btn-view" data-id="${routine.id}">👁️ Ver</button>
                    <button class="btn-edit" data-id="${routine.id}">✏️ Editar</button>
                    <button class="btn-delete" data-id="${routine.id}">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }
    
    attachEvents() {
        this.container.querySelector('#addRoutineBtn')?.addEventListener('click', () => this.showForm());
        this.container.querySelector('#searchRoutine')?.addEventListener('input', () => this.filterRoutines());
        
        this.container.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.showDetail(id);
            });
        });
        
        this.container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const routine = this.routines.find(r => r.id === id);
                this.showForm(routine);
            });
        });
        
        this.container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const routine = this.routines.find(r => r.id === id);
                this.deleteRoutine(routine);
            });
        });
    }
    
    async filterRoutines() {
        const searchTerm = this.container.querySelector('#searchRoutine')?.value.toLowerCase() || '';
        
        let filtered = this.routines.filter(r => 
            r.name.toLowerCase().includes(searchTerm)
        );
        
        const container = this.container.querySelector('#routinesList');
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">📭 No se encontraron rutinas</p>';
        } else {
            container.innerHTML = filtered.map(routine => `
                <div class="routine-card" data-id="${routine.id}">
                    <div class="exercise-image">
                        📋
                    </div>
                    <div class="routine-info">
                        <h3>${this.escapeHtml(routine.name)}</h3>
                        ${routine.description ? `<p class="description">${this.escapeHtml(routine.description)}</p>` : ''}
                        <p style="color: #999; font-size: 0.85rem; margin-top: 0.5rem;">
                            📅 Creada: ${new Date(routine.createdAt).toLocaleDateString()}<br>
                            💪 Ejercicios: ${routine.exercises?.length || 0}
                        </p>
                    </div>
                    <div class="routine-actions">
                        <button class="btn-view" data-id="${routine.id}">👁️ Ver</button>
                        <button class="btn-edit" data-id="${routine.id}">✏️ Editar</button>
                        <button class="btn-delete" data-id="${routine.id}">🗑️ Eliminar</button>
                    </div>
                </div>
            `).join('');
            
            // Reasignar eventos
            this.container.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    this.showDetail(id);
                });
            });
            this.container.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    const routine = this.routines.find(r => r.id === id);
                    this.showForm(routine);
                });
            });
            this.container.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    const routine = this.routines.find(r => r.id === id);
                    this.deleteRoutine(routine);
                });
            });
        }
    }
    
    showForm(routine = null) {
        this.currentRoutine = routine;
        
        // Eliminar modal existente
        const existing = document.querySelector('.modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h3>${routine ? '✏️ Editar Rutina' : '➕ Nueva Rutina'}</h3>
                <form id="routineForm">
                    <div class="form-group">
                        <label>Nombre de la rutina *</label>
                        <input type="text" id="name" value="${routine ? this.escapeHtml(routine.name) : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea id="description" rows="2">${routine ? this.escapeHtml(routine.description || '') : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Ejercicios de la rutina</label>
                        <div id="exercisesList" style="border: 1px solid #ddd; border-radius: 10px; padding: 0.5rem; max-height: 300px; overflow-y: auto;">
                            ${this.renderExerciseSelector(routine)}
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelBtn">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar Rutina</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => modal.remove();
        modal.querySelector('#cancelBtn').onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
        
        modal.querySelector('#routineForm').onsubmit = async (e) => {
            e.preventDefault();
            await this.saveRoutine(modal);
            closeModal();
            await this.render();
        };
    }
    
    renderExerciseSelector(routine) {
        if (this.exercises.length === 0) {
            return '<p style="color: #999; text-align: center;">No hay ejercicios. Crea algunos ejercicios primero.</p>';
        }
        
        const selectedExercises = routine?.exercises || [];
        
        return this.exercises.map(ex => {
            const isSelected = selectedExercises.some(e => e.id === ex.id);
            return `
                <div style="display: flex; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee;">
                    <input type="checkbox" id="ex_${ex.id}" value="${ex.id}" ${isSelected ? 'checked' : ''} style="margin-right: 1rem;">
                    <label for="ex_${ex.id}" style="flex: 1; cursor: pointer;">
                        <strong>${this.escapeHtml(ex.name)}</strong><br>
                        <small style="color: #666;">${ex.muscleGroup} - ${ex.type}</small>
                    </label>
                    ${isSelected ? `
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="number" placeholder="Series" value="${selectedExercises.find(e => e.id === ex.id)?.suggestedSets || ''}" 
                                   style="width: 70px; padding: 0.25rem;" id="sets_${ex.id}">
                            <input type="number" placeholder="Reps" value="${selectedExercises.find(e => e.id === ex.id)?.suggestedReps || ''}" 
                                   style="width: 70px; padding: 0.25rem;" id="reps_${ex.id}">
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    async saveRoutine(modal) {
        const name = modal.querySelector('#name').value;
        const description = modal.querySelector('#description').value;
        
        if (!name) {
            alert('Por favor ingrese un nombre para la rutina');
            return;
        }
        
        // Obtener ejercicios seleccionados
        const exercises = [];
        for (const ex of this.exercises) {
            const checkbox = modal.querySelector(`#ex_${ex.id}`);
            if (checkbox && checkbox.checked) {
                const setsInput = modal.querySelector(`#sets_${ex.id}`);
                const repsInput = modal.querySelector(`#reps_${ex.id}`);
                exercises.push({
                    id: ex.id,
                    name: ex.name,
                    muscleGroup: ex.muscleGroup,
                    type: ex.type,
                    suggestedSets: setsInput ? parseInt(setsInput.value) || 3 : 3,
                    suggestedReps: repsInput ? parseInt(repsInput.value) || 10 : 10
                });
            }
        }
        
        const routineData = {
            name: name,
            description: description,
            exercises: exercises,
            createdAt: this.currentRoutine ? this.currentRoutine.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentRoutine) {
            await dbManager.update('routines', this.currentRoutine.id, routineData);
            alert('Rutina actualizada');
        } else {
            await dbManager.add('routines', routineData);
            alert('Rutina creada');
        }
    }
    
    async showDetail(id) {
        const routine = await dbManager.getById('routines', id);
        if (!routine) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h3>📋 ${this.escapeHtml(routine.name)}</h3>
                ${routine.description ? `<p style="color: #666; margin-bottom: 1rem;">${this.escapeHtml(routine.description)}</p>` : ''}
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 1rem;">
                    📅 Creada: ${new Date(routine.createdAt).toLocaleDateString()}
                </p>
                <h4>💪 Ejercicios (${routine.exercises?.length || 0})</h4>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${routine.exercises?.map((ex, index) => `
                        <div style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                            <strong>${index + 1}. ${this.escapeHtml(ex.name)}</strong><br>
                            <small style="color: #666;">${ex.muscleGroup} - ${ex.type}</small><br>
                            <small style="color: #4CAF50;">📊 ${ex.suggestedSets} series × ${ex.suggestedReps} reps</small>
                        </div>
                    `).join('') || '<p>No hay ejercicios en esta rutina</p>'}
                </div>
                <div class="form-actions" style="margin-top: 1rem;">
                    <button class="btn-primary" id="closeModal">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('#closeModal').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    async deleteRoutine(routine) {
        if (confirm(`¿Eliminar la rutina "${routine.name}"?`)) {
            await dbManager.delete('routines', routine.id);
            await this.render();
            alert('Rutina eliminada');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}