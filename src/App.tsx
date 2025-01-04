import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TableComponent from './components/TableComponent';
import SheetDetail from './components/SheetDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TableComponent />} />
        <Route path="/sheet-id/:id" element={<SheetDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
