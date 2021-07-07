let db;
let budgetVersion

const request = window.indexedDB.open("budget", budgetVersion || 3);

request.onupgradeneeded = event => {
    event.target.result.createObjectStore("budget", {keyPath: "_id"});
};

request.onsuccess = event => {
    db = event.target.result;

    if (navigator.onLine) {
        collectData();
    }
};

function collectData() {
    let transaction = db.transaction(["budget"], "readwrite");
    const budgetStore = transaction.objectStore("budget");
    const getAll = budgetStore.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    if (res.length !== 0) {
                        transaction = db.transaction(["budget"], "readwrite");
                        const currentStore = transaction.objectStore("budget");
                        currentStore.clear();
                    }
                });
        }
    }
}

const saveRecord = (record) => {
    const transaction = db.transaction(["budget"], "readwrite");
    const store = transaction.objectStore("budget");
    store.add(record);
};

window.addEventListener("online", collectData);
