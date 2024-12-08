const { MongoClient } = require('mongodb');
// Connection URL
const url = process.env.DB_URL;
const client = new MongoClient(url);

// Database Name
async function ConnectMongo(dbname)
{
    await client.connect();
    console.log('Connected successfully to server');
}

module.exports={ConnectMongo , client}