// Database Manager for IndexedDB
class DatabaseManager {
    constructor() {
        this.dbName = 'GymTrackerDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('exercises')) {
                    const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
                    exerciseStore.createIndex('muscleGroup', 'muscleGroup', { unique: false });
                    console.log('Exercises store created');
                }
                
                if (!db.objectStoreNames.contains('routines')) {
                    db.createObjectStore('routines', { keyPath: 'id', autoIncrement: true });
                    console.log('Routines store created');
                }
                
                if (!db.objectStoreNames.contains('sessions')) {
                    db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                    console.log('Sessions store created');
                }
            };
        });
    }

    async add(store, data) {
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve, reject) => {
            const request = objectStore.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(store) {
        const transaction = this.db.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // MÉTODO AGREGADO - getById
    async getById(store, id) {
        const transaction = this.db.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve, reject) => {
            const request = objectStore.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(store, id, data) {
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve, reject) => {
            const request = objectStore.put({ ...data, id });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(store, id) {
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve, reject) => {
            const request = objectStore.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(store) {
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve, reject) => {
            const request = objectStore.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

const dbManager = new DatabaseManager();