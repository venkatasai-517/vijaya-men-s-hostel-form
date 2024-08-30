import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
const Form = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" Component={App} />
          <Route path="app" Component={App} />
        </Routes>
      </Router>
    </>
  );
};
export default Form;
