import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Navigator from './containers/Navigator';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigator />
      </div>
    </BrowserRouter>
  );
}

export default App;
