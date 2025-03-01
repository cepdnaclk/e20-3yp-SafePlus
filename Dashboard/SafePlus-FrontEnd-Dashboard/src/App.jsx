// src/App.js
import React from 'react';
import IotCoreComponent from './IotCoreComponent';
import Header from './components/Header/Header';
import './index.css'
const App = () => {
  return (
    <div className='container'>
      <Header />
      <IotCoreComponent />
    </div>
  );
};

export default App;
