import {Routes, Route} from 'react-router-dom';
import LoginPage from './LoginPage';
import MainPage from './MainPage';
import RegistrationPage from './RegistrationPage';

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
  );
}
