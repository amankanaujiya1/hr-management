import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import EmployeePortal from './pages/EmployeePortal'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/jobs' element={<Jobs />} />
        <Route path='/dashboard' element={
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/employee-portal' element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeePortal />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App