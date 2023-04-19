importScripts("/src/js/idb.js");

let dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { KeyPath: "id" });
  }
});

const addToDb = async (dbPromise, storeName, operation, item, key) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(storeName, operation);
    const store = tx.objectStore(storeName);
    console.log(store);
    store.put(item, key);
    await tx.complete;
    return db;
  } catch (error) {
    console.log(error);
  }
};

export { dbPromise, addToDb };
