import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TableComponent from './components/TableComponent';
import SheetDetail from './components/SheetDetail';

import { ToastContainer } from "react-toastify";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<TableComponent />} />
          <Route path="/sheet-id/:id" element={<SheetDetail />} />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" />
    </>
  );
};

export default App;
