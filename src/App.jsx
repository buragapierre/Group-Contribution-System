import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './data/UserContext';
import './index.css';

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}

export default App;
