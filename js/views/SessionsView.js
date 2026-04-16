// Sessions View - Registro de Sesiones
class SessionsView {
    constructor(container) {
        this.container = container;
        this.sessions = [];
        this.routines = [];
        this.currentSession = null;
    }
    
    async render() {
        await this.loadData();
        this.renderHTML();
        this.attachEvents();
    }
    
    async loadData() {
        this.sessions = await dbManager.getAll('sessions');
        this.routines = await dbManager.getAll('routines');
    }
    
    renderHTML() {
        this.container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>📅 Sesiones de Entrenamiento</h2>
                    <button class="btn-primary" id="addSessionBtn">+ Nueva Sesión</button>
                </div>
                
                <div class="filters">
                    <input type="text" id="searchSession" placeholder="🔍 Buscar sesión...">
                    <select id="routineFilter">
                        <option value="">Todas las rutinas</option>
                        ${this.routines.map(r => `<option value="${r.id}">${this.escapeHtml(r.name)}</option>`).join('')}
                    </select>
                </div>
                
                <div id="sessionsList" class="sessions-list">
                    ${this.renderSessions()}
                </div>
            </div>
        `;
    }
    
    renderSessions() {
        if (this.sessions.length === 0) {
            return '<p class="empty-state">📭 No hay sesiones registradas. ¡Inicia tu primera sesión!</p>';
        }
        
        // Ordenar por fecha descendente
        const sorted = [...this.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return sorted.map(session => {
            const routine = this.routines.find(r => r.id === session.routineId);
            return `
                <div class="session-card">
                    <div class="exercise-image">
                        🏋️
                    </div>
                    <div class="session-info">
                        <h3>📅 ${new Date(session.date).toLocaleDateString()} - ${new Date(session.date).toLocaleTimeString()}</h3>
                        <p><strong>Rutina:</strong> ${routine ? this.escapeHtml(routine.name) : 'Rutina eliminada'}</p>
                        <p><strong>Ejercicios:</strong> ${session.exercises?.length || 0}</p>
                        <p><strong>Duración:</strong> ${session.duration || 'No registrada'}</p>
                        ${session.notes ? `<p><strong>Notas:</strong> ${this.escapeHtml(session.notes)}</p>` : ''}
                    </div>
                    <div class="session-actions">
                        <button class="btn-view" data-id="${session.id}">👁️ Ver</button>
                        <button class="btn-edit" data-id="${session.id}">✏️ Editar</button>
                        <button class="btn-delete" data-id="${session.id}">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    attachEvents() {
        this.container.querySelector('#addSessionBtn')?.addEventListener('click', () => this.startSession());
        this.container.querySelector('#searchSession')?.addEventListener('input', () => this.filterSessions());
        this.container.querySelector('#routineFilter')?.addEventListener('change', () => this.filterSessions());
        
        this.container.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.viewSession(id);
            });
        });
        
        this.container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.editSession(id);
            });
        });
        
        this.container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.deleteSession(id);
            });
        });
    }
    
    async filterSessions() {
        const searchTerm = this.container.querySelector('#searchSession')?.value.toLowerCase() || '';
        const routineFilter = this.container.querySelector('#routineFilter')?.value || '';
        
        let filtered = this.sessions;
        
        if (searchTerm) {
            filtered = filtered.filter(s => {
                const routine = this.routines.find(r => r.id === s.routineId);
                return routine?.name.toLowerCase().includes(searchTerm);
            });
        }
        
        if (routineFilter) {
            filtered = filtered.filter(s => s.routineId == routineFilter);
        }
        
        const container = this.container.querySelector('#sessionsList');
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">📭 No se encontraron sesiones</p>';
        } else {
            const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
            container.innerHTML = sorted.map(session => {
                const routine = this.routines.find(r => r.id === session.routineId);
                return `
                    <div class="session-card">
                        <div class="exercise-image">🏋️</div>
                        <div class="session-info">
                            <h3>📅 ${new Date(session.date).toLocaleDateString()} - ${new Date(session.date).toLocaleTimeString()}</h3>
                            <p><strong>Rutina:</strong> ${routine ? this.escapeHtml(routine.name) : 'Rutina eliminada'}</p>
                            <p><strong>Ejercicios:</strong> ${session.exercises?.length || 0}</p>
                        </div>
                        <div class="session-actions">
                            <button class="btn-view" data-id="${session.id}">👁️ Ver</button>
                            <button class="btn-edit" data-id="${session.id}">✏️ Editar</button>
                            <button class="btn-delete" data-id="${session.id}">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Reasignar eventos
            this.container.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', (e) => this.viewSession(parseInt(btn.dataset.id)));
            });
            this.container.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => this.editSession(parseInt(btn.dataset.id)));
            });
            this.container.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteSession(parseInt(btn.dataset.id)));
            });
        }
    }
    
    async startSession() {
        if (this.routines.length === 0) {
            alert('Primero debes crear una rutina');
            return;
        }
        
        // Seleccionar rutina primero
        const routine = await this.selectRoutine();
        if (!routine) return;
        
        this.currentSession = {
            date: new Date().toISOString(),
            routineId: routine.id,
            exercises: routine.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                sets: []
            }))
        };
        
        this.showSessionForm();
    }
    
    async selectRoutine() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Seleccionar Rutina</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${this.routines.map(routine => `
                            <div style="padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer;" class="routine-option" data-id="${routine.id}">
                                <strong>${this.escapeHtml(routine.name)}</strong><br>
                                <small>${routine.exercises?.length || 0} ejercicios</small>
                                ${routine.description ? `<br><small style="color:#666;">${this.escapeHtml(routine.description)}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="form-actions" style="margin-top: 1rem;">
                        <button class="btn-secondary" id="cancelSelect">Cancelar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelectorAll('.routine-option').forEach(opt => {
                opt.onclick = () => {
                    const id = parseInt(opt.dataset.id);
                    const routine = this.routines.find(r => r.id === id);
                    modal.remove();
                    resolve(routine);
                };
            });
            
            modal.querySelector('#cancelSelect').onclick = () => {
                modal.remove();
                resolve(null);
            };
        });
    }
    
    showSessionForm() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <h3>🏋️ Registrar Entrenamiento</h3>
                <form id="sessionForm">
                    <div class="form-group">
                        <label>Fecha y Hora</label>
                        <input type="datetime-local" id="date" value="${new Date().toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label>Duración (opcional)</label>
                        <input type="text" id="duration" placeholder="Ej: 1 hora 30 min">
                    </div>
                    <div class="form-group">
                        <label>Notas (opcional)</label>
                        <textarea id="notes" rows="2" placeholder="Observaciones del entrenamiento..."></textarea>
                    </div>
                    
                    <h4>💪 Ejercicios</h4>
                    <div id="exercisesContainer">
                        ${this.currentSession.exercises.map((ex, idx) => `
                            <div style="border: 1px solid #ddd; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
                                <h5>${this.escapeHtml(ex.name)}</h5>
                                <div id="sets_${idx}">
                                    ${this.renderSetsInput(idx, ex.sets)}
                                </div>
                                <button type="button" class="btn-secondary add-set" data-idx="${idx}" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem;">+ Agregar Serie</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelSession">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar Sesión</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Agregar eventos para botones "Agregar Serie"
        modal.querySelectorAll('.add-set').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                this.currentSession.exercises[idx].sets.push({ weight: '', reps: '' });
                this.renderExercisesInModal(modal);
            };
        });
        
        modal.querySelector('#cancelSession').onclick = () => modal.remove();
        
        modal.querySelector('#sessionForm').onsubmit = async (e) => {
            e.preventDefault();
            await this.saveSession(modal);
            modal.remove();
            await this.render();
        };
    }
    
    renderSetsInput(exerciseIdx, sets) {
        if (sets.length === 0) {
            return '<p style="color: #999;">No hay series registradas. Agrega una serie.</p>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr><th style="text-align: left;">Serie</th><th>Peso (kg)</th><th>Repeticiones</th><th></th></tr>
                </thead>
                <tbody>
                    ${sets.map((set, setIdx) => `
                        <tr>
                            <td style="width: 60px;">${setIdx + 1}</td>
                            <td><input type="number" class="set-weight" data-ex="${exerciseIdx}" data-set="${setIdx}" value="${set.weight}" style="width: 80px; padding: 0.25rem;"></td>
                            <td><input type="number" class="set-reps" data-ex="${exerciseIdx}" data-set="${setIdx}" value="${set.reps}" style="width: 80px; padding: 0.25rem;"></td>
                            <td><button type="button" class="remove-set" data-ex="${exerciseIdx}" data-set="${setIdx}">❌</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    renderExercisesInModal(modal) {
        const container = modal.querySelector('#exercisesContainer');
        if (container) {
            container.innerHTML = this.currentSession.exercises.map((ex, idx) => `
                <div style="border: 1px solid #ddd; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
                    <h5>${this.escapeHtml(ex.name)}</h5>
                    <div id="sets_${idx}">
                        ${this.renderSetsInput(idx, ex.sets)}
                    </div>
                    <button type="button" class="btn-secondary add-set" data-idx="${idx}" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem;">+ Agregar Serie</button>
                </div>
            `).join('');
            
            // Reasignar eventos
            modal.querySelectorAll('.add-set').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    this.currentSession.exercises[idx].sets.push({ weight: '', reps: '' });
                    this.renderExercisesInModal(modal);
                };
            });
            
            modal.querySelectorAll('.set-weight').forEach(input => {
                input.onchange = (e) => {
                    const exIdx = parseInt(input.dataset.ex);
                    const setIdx = parseInt(input.dataset.set);
                    this.currentSession.exercises[exIdx].sets[setIdx].weight = input.value;
                };
            });
            
            modal.querySelectorAll('.set-reps').forEach(input => {
                input.onchange = (e) => {
                    const exIdx = parseInt(input.dataset.ex);
                    const setIdx = parseInt(input.dataset.set);
                    this.currentSession.exercises[exIdx].sets[setIdx].reps = input.value;
                };
            });
            
            modal.querySelectorAll('.remove-set').forEach(btn => {
                btn.onclick = () => {
                    const exIdx = parseInt(btn.dataset.ex);
                    const setIdx = parseInt(btn.dataset.set);
                    this.currentSession.exercises[exIdx].sets.splice(setIdx, 1);
                    this.renderExercisesInModal(modal);
                };
            });
        }
    }
    
    async saveSession(modal) {
        const date = modal.querySelector('#date').value;
        const duration = modal.querySelector('#duration').value;
        const notes = modal.querySelector('#notes').value;
        
        // Validar que todos los ejercicios tengan al menos una serie
        for (const ex of this.currentSession.exercises) {
            if (ex.sets.length === 0) {
                alert(`El ejercicio "${ex.name}" no tiene series registradas`);
                return;
            }
        }
        
        const sessionData = {
            date: date || new Date().toISOString(),
            routineId: this.currentSession.routineId,
            exercises: this.currentSession.exercises,
            duration: duration || null,
            notes: notes || null,
            createdAt: new Date().toISOString()
        };
        
        if (this.currentSession.id) {
            await dbManager.update('sessions', this.currentSession.id, sessionData);
            alert('Sesión actualizada');
        } else {
            await dbManager.add('sessions', sessionData);
            alert('Sesión guardada');
        }
    }
    
    async viewSession(id) {
        const session = await dbManager.getById('sessions', id);
        if (!session) return;
        
        const routine = this.routines.find(r => r.id === session.routineId);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <h3>📋 Detalle de Sesión</h3>
                <p><strong>📅 Fecha:</strong> ${new Date(session.date).toLocaleDateString()} - ${new Date(session.date).toLocaleTimeString()}</p>
                <p><strong>📋 Rutina:</strong> ${routine ? this.escapeHtml(routine.name) : 'Rutina eliminada'}</p>
                ${session.duration ? `<p><strong>⏱️ Duración:</strong> ${session.duration}</p>` : ''}
                ${session.notes ? `<p><strong>📝 Notas:</strong> ${this.escapeHtml(session.notes)}</p>` : ''}
                
                <h4>💪 Ejercicios Realizados</h4>
                ${session.exercises.map(ex => `
                    <div style="border: 1px solid #ddd; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
                        <h5>${this.escapeHtml(ex.name)}</h5>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr><th>Serie</th><th>Peso (kg)</th><th>Repeticiones</th></tr>
                            </thead>
                            <tbody>
                                ${ex.sets.map((set, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td>${set.weight || 0}</td>
                                        <td>${set.reps || 0}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
                
                <div class="form-actions">
                    <button class="btn-primary" id="closeModal">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('#closeModal').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    async editSession(id) {
        const session = await dbManager.getById('sessions', id);
        if (session) {
            this.currentSession = session;
            this.showSessionForm();
        }
    }
    
    async deleteSession(id) {
        if (confirm('¿Eliminar esta sesión?')) {
            await dbManager.delete('sessions', id);
            await this.render();
            alert('Sesión eliminada');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}