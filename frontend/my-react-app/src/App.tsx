import React from 'react';
// import ExampleComponent from './components/DataQuality';
import DataQuality from './components/DataQuality';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import NRCI from './NRCI'; // this is your new page
import NRCI from './components/NRCI'; // this is your new page
// const App: React.FC = () => {
//     return (
//         <div>
//             {/* <h1>Welcome to My React App</h1> */}
//             <DataQuality />
//         </div>
//     );
// };

// export default App;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DataQuality />} />
        <Route path="/NRCI" element={<NRCI />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;