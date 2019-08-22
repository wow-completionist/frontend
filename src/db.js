// Backward compatibility
if (!window.indexedDB) {
    window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
}

export async function getData(blobName) {
    return new Promise((resolve) => {
        if (!window.indexedDB) {
            console.log('No browser memory available. Please update your web browser.');
            resolve(null);
        }
    
        const request = window.indexedDB.open('CompletionistDatabase', 1);
        let db;
        let tx;
        let store;
        // let index;
        let finalResult;
        
        request.onupgradeneeded = function dbUpgradeNeeded() {
            db = request.result;
            store = db.createObjectStore('CompletionistStore', { keyPath: 'blobName' });
            // index = db.createIndex(blobName, blobName, { unique: true });
        };
        
        request.onerror = function dbOpenError(event) {
            console.log(`There was an error opening the database: ${event.target.errorCode}`);
            resolve(false);
        };
    
        request.onsuccess = function dbOpenSuccess() {
            db = request.result;
            tx = db.transaction('CompletionistStore', 'readwrite');
            store = tx.objectStore('CompletionistStore');
            // index = store.index(blobName);
                    
            db.onerror = function dbError(event) {
                console.log(`DB error: ${event.target.errorCode}`);
                resolve(false);
            };
        
            // transaction example
            // store.put({qID: 1, questionText: 'The sky is blue.', correctAnser: true});
            // store.put({qID: 2, questionText: 'The grass is green.', correctAnser: true});
            
            // const q1 = store.get(1);
            // q1.onsuccess = function () {
            //     console.log(q1.result);
            // };
        
            const query = store.get(blobName);
            query.onsuccess = function onQuerySuccess() {
                const { result } = query;
                finalResult = result;
            };
        
            tx.oncomplete = function dbClose() {
                db.close();
                resolve(finalResult);
            };
        };
    });
}


export function putData(blobName, data) {
    return new Promise((resolve) => {
        if (!window.indexedDB) {
            console.log('No browser memory available. Please update your web browser.');
            resolve();
        }
    
        const request = window.indexedDB.open('CompletionistDatabase', 1);
        let db;
        let tx;
        let store;
        let innerstore;
        
        request.onupgradeneeded = function dbUpgradeNeeded(event) {
            db = event.target.result;

            store = db.createObjectStore('CompletionistStore', { keyPath: 'blobName' });
            
            db.createIndex(blobName, blobName, { unique: true });
            
            store.transaction.oncomplete = function storeComplete() {
                // Store values in the newly created objectStore.
                innerstore = db.transaction('CompletionistStore', 'readwrite').objectStore('CompletionistStore');
                innerstore.add({ blobName, data });
                db.close();
                resolve();
            };
        };
        
        request.onerror = function dbOpenError(event) {
            console.log(`There was an error opening the database: ${event.target.errorCode}`);
            resolve();
        };
    
        request.onsuccess = function dbOpenSuccess() {
            db = request.result;
            tx = db.transaction('CompletionistStore', 'readwrite');
            store = tx.objectStore('CompletionistStore');
            // store.index(blobName);
        
            db.onerror = function dbError(event) {
                console.log(`DB error: ${event.target.errorCode}`);
            };
        
            // transaction example
            const dataObject = { blobName, data };
            store.put(dataObject);
            // store.put({qID: 2, questionText: 'The grass is green.', correctAnser: true});
            
            // const q1 = store.get(1);
            // q1.onsuccess = function () {
            //     console.log(q1.result);
            // };
        
            // const qs = store.get('The grass is green.');
            // qs.onsuccess = function () {
            //     console.log(qs.result.questionText);
            // };
        
        
            tx.oncomplete = function dbClose() {
                db.close();
                resolve();
            };
        };
    });
}
