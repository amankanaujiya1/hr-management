import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  if (!token) {
    return <Navigate to='/' replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to correct portal based on role
    if (user?.role === 'employee') {
      return <Navigate to='/employee-portal' replace />
    } else {
      return <Navigate to='/dashboard' replace />
    }
  }

  return children
}

export default ProtectedRoute