const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');

// MQTT broker details (AWS IoT)
const mqttOptions = {
  host: 'your-iot-endpoint.amazonaws.com', // Replace with your AWS IoT endpoint
  port: 8883,
  protocol: 'mqtts',
  username: 'your-username', // If you have one, otherwise remove
  password: 'your-password', // If you have one, otherwise remove
  clientId: 'mqtt_client_id', // Set a unique client ID
};

// MongoDB connection details
const uri = 'mongodb://localhost:27017'; // Your MongoDB connection string
const dbName = 'helmet_data_db'; // Database name
const collectionName = 'sensor_data'; // Collection name

// Connect to MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Connect to the MQTT broker
    const mqttClient = mqtt.connect(mqttOptions);

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe('helmet/data', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log('Subscribed to helmet/data topic');
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === 'helmet/data') {
        // Parse the JSON data received
        const payload = JSON.parse(message.toString());
        console.log('Received data:', payload);

        // Store the data in MongoDB
        collection.insertOne(payload, (err, res) => {
          if (err) {
            console.error('Error inserting data into MongoDB:', err);
          } else {
            console.log('Data inserted into MongoDB:', res.ops);
          }
        });
      }
    });

  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

