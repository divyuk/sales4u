const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });

class Loader {
  constructor() {
    this.DB = process.env.DATABASE_CONNECTION_STRING.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );
    this.client = null;
    this.dbname = process.env.DATABASE_NAME;
    this.collection = process.env.DATABASE_COLLECTION;
    this.dbcollection = null;
  }

  async fetchData() {
    try {
      const respose = await fetch('https://dummyjson.com/products');
      const data = await respose.json();
      return data.products;
    } catch (err) {
      console.log('Error in loading the file');
      throw err;
    }
  }

  async connectToDB() {
    try {
      this.client = new MongoClient(this.DB, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await this.client.connect();
      const myDB = await this.client.db(this.dbname);
      this.dbcollection = await myDB.collection(this.collection);
      console.log('Connected to MongoDB successfully');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    }
  }

  async insertData(data) {
    try {
      await this.connectToDB();
      await this.dbcollection.insertMany(data);
      console.log('Successfully Inserted');
    } catch (error) {
      console.log('Error', error);
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

  async deleteAll() {
    try {
      await this.connectToDB();
      const deleteManyResult = await this.dbcollection.drop();
      console.log('Successfully Deleted', deleteManyResult);
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }
}
const loader = new Loader();
(async () => {
  try {
    const data = await loader.fetchData();
    await loader.insertData(data);
    // await loader.deleteAll(data);
  } catch (error) {
    console.log('Cant Load', error);
  }
})();
