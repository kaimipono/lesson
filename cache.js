const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect('mongodb://admin:password@localhost:27017', { useNewUrlParser: true }, function(err, client) {
    if (err) return console.log(err); 
    db = client.db('mytestingdb');
});

async function isDirtyRecord(key) {
    const doc = await getRecord(key);
    return happensAfter(doc.createdDate, 10000);
}

async function getRecord(key) {
    const docs = await db.collection('cities').find({ city: key }).toArray();
    return docs[0];
}

async function hasRecord(key) {
    const docs = await db.collection('cities').find({ city: key }).toArray();
    return docs.length > 0;
}

async function setRecord(key, getValue) {
    let value = await getValue(key);
    db.collection('cities').insertOne({
        city: key,
        temperature: value,
        createdDate: new Date()
    });
}

function happensAfter(date, ms) {
    const d2 = new Date();
    const diff = - date.getTime() + d2.getTime();
    return diff > ms;
}

const DBapi = {
    isDirtyRecord,
    getRecord,
    hasRecord,
    setRecord
};

module.exports = DBapi;