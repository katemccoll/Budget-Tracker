let db;

const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    db = event.target.result;

    db.createObjectStore("budget", { autoIncrement: true });
};

request.onsuccess = event => {
    db = event.target.result;

    if (navigator.onLine) {
        collectData();
    }
};

request.onerror = (error) => {
    console.error(error);
};

function collectData() {
    let transaction = db.transaction(["budget"], "readwrite");
    const budgetStore = transaction.objectStore("budget");
    const getAll = budgetStore.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
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
