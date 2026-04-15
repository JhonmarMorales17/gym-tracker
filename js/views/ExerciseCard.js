class ExerciseCard extends HTMLElement {
    constructor() {
        super();
        this.exercise = null;
        this.onEdit = null;
        this.onDelete = null;
    }
    
    setData(exercise, onEdit, onDelete) {
        this.exercise = exercise;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
        this.render();
    }
    
    getMuscleIcon(muscleGroup) {
        const icons = {
            'Pecho': '💪',
            'Piernas': '🦵',
            'Espalda': '🔙',
            'Hombros': '🎯',
            'Brazos': '💪'
        };
        return icons[muscleGroup] || '🏋️';
    }
    
    render() {
        if (!this.exercise) return;
        
        this.innerHTML = `
            <div class="exercise-card">
                <div class="exercise-image">
                    ${this.getMuscleIcon(this.exercise.muscleGroup)}
                </div>
                <div class="exercise-info">
                    <h3>${this.escapeHtml(this.exercise.name)}</h3>
                    <div>
                        <span class="muscle-group">${this.escapeHtml(this.exercise.muscleGroup)}</span>
                        <span class="type">${this.escapeHtml(this.exercise.type)}</span>
                    </div>
                    ${this.exercise.description ? `<p class="description">${this.escapeHtml(this.exercise.description)}</p>` : ''}
                </div>
                <div class="exercise-actions">
                    <button class="btn-edit" data-action="edit">✏️ Editar</button>
                    <button class="btn-delete" data-action="delete">🗑️ Eliminar</button>
                </div>
            </div>
        `;
        
        this.querySelector('[data-action="edit"]').onclick = () => this.onEdit?.(this.exercise);
        this.querySelector('[data-action="delete"]').onclick = () => this.onDelete?.(this.exercise);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('exercise-card', ExerciseCard);