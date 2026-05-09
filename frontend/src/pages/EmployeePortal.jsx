import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import jsPDF from 'jspdf'

const EmployeePortal = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('Profile')

  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [payslips, setPayslips] = useState([])
  const [newLeave, setNewLeave] = useState({
    leaveType: 'sick', startDate: '', endDate: '', reason: ''
  })
  const [showLeaveForm, setShowLeaveForm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attendanceRes = await API.get('/attendance/my')
        setAttendance(attendanceRes.data)

        const leavesRes = await API.get('/leaves/my')
        setLeaves(leavesRes.data)

        const payslipsRes = await API.get('/payroll/my')
        setPayslips(payslipsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleCheckIn = async () => {
    try {
      await API.post('/attendance/checkin')
      alert('✅ Checked in successfully!')
      const res = await API.get('/attendance/my')
      setAttendance(res.data)
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking in')
    }
  }

  const handleCheckOut = async () => {
    try {
      await API.put('/attendance/checkout')
      alert('✅ Checked out successfully!')
      const res = await API.get('/attendance/my')
      setAttendance(res.data)
    } catch (error) {
      try {
        const todayRecord = attendance.find(a =>
          new Date(a.date).toDateString() === new Date().toDateString()
        )
        if (todayRecord) {
          await API.put(`/attendance/${todayRecord._id}`, {
            status: 'present',
            checkOut: new Date()
          })
          const res = await API.get('/attendance/my')
          setAttendance(res.data)
          alert('✅ Checkout updated successfully!')
        }
      } catch (err) {
        alert('Error updating checkout')
      }
    }
  }

  const handleApplyLeave = async () => {
    try {
      const res = await API.post('/leaves', newLeave)
      setLeaves([...leaves, res.data])
      setShowLeaveForm(false)
      setNewLeave({ leaveType: 'sick', startDate: '', endDate: '', reason: '' })
      alert('Leave applied successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying leave')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleDownloadPayslip = (pay) => {
    const doc = new jsPDF()

    doc.setFillColor(4, 84, 149)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('HR Management System', 105, 18, { align: 'center' })
    doc.setFontSize(12)
    doc.text('SALARY SLIP', 105, 30, { align: 'center' })

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Employee Details', 14, 55)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Name: ${user?.name}`, 14, 65)
    doc.text(`Email: ${user?.email}`, 14, 73)
    doc.text(`Month: ${new Date(0, pay.month - 1).toLocaleString('default', { month: 'long' })} ${pay.year}`, 14, 81)

    doc.setDrawColor(4, 84, 149)
    doc.setLineWidth(0.5)
    doc.line(14, 88, 196, 88)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(4, 84, 149)
    doc.text('Earnings', 14, 98)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Basic Salary', 14, 108)
    doc.text(`Rs. ${pay.basicSalary?.toLocaleString()}`, 150, 108)
    doc.text('HRA', 14, 116)
    doc.text(`Rs. ${pay.allowances?.hra?.toLocaleString()}`, 150, 116)
    doc.text('Transport Allowance', 14, 124)
    doc.text(`Rs. ${pay.allowances?.transport?.toLocaleString()}`, 150, 124)
    doc.text('Medical Allowance', 14, 132)
    doc.text(`Rs. ${pay.allowances?.medical?.toLocaleString()}`, 150, 132)
    doc.text('Other Allowances', 14, 140)
    doc.text(`Rs. ${pay.allowances?.other?.toLocaleString()}`, 150, 140)

    doc.setFont('helvetica', 'bold')
    doc.setFillColor(232, 244, 255)
    doc.rect(14, 144, 182, 8, 'F')
    doc.text('Total Earnings', 14, 150)
    doc.text(`Rs. ${(pay.basicSalary + pay.totalAllowances)?.toLocaleString()}`, 150, 150)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(4, 84, 149)
    doc.text('Deductions', 14, 165)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Tax', 14, 175)
    doc.text(`Rs. ${pay.deductions?.tax?.toLocaleString()}`, 150, 175)
    doc.text('Provident Fund', 14, 183)
    doc.text(`Rs. ${pay.deductions?.providentFund?.toLocaleString()}`, 150, 183)
    doc.text('Other Deductions', 14, 191)
    doc.text(`Rs. ${pay.deductions?.other?.toLocaleString()}`, 150, 191)

    doc.setFont('helvetica', 'bold')
    doc.setFillColor(255, 232, 232)
    doc.rect(14, 195, 182, 8, 'F')
    doc.text('Total Deductions', 14, 201)
    doc.text(`Rs. ${pay.totalDeductions?.toLocaleString()}`, 150, 201)

    doc.setFillColor(4, 84, 149)
    doc.rect(14, 215, 182, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.text('NET SALARY', 14, 223)
    doc.text(`Rs. ${pay.netSalary?.toLocaleString()}`, 150, 223)

    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('This is a system generated payslip.', 105, 270, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 276, { align: 'center' })

    doc.save(`Payslip_${user?.name}_${new Date(0, pay.month - 1).toLocaleString('default', { month: 'long' })}_${pay.year}.pdf`)
  }

  return (
    <div className='flex h-screen'>

      {/* SIDEBAR */}
      <div className='border w-[15%] p-4 flex flex-col'>
        <div className='mb-6'>
          <h2 className='font-bold text-sm'>Welcome,</h2>
          <p className='font-bold text-primary-600'>{user?.name} 👋</p>
          <span className='text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full mt-1 inline-block'>
            Employee
          </span>
        </div>

        <div className='flex flex-col gap-2'>
          {['Profile', 'Attendance', 'Leaves', 'Payslips'].map(item => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`p-3 rounded-md cursor-pointer text-left text-sm font-medium
                ${activePage === item
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-primary-100'}`}>
              {item}
            </button>
          ))}
        </div>

        <div className='mt-auto'>
          <button
            onClick={handleLogout}
            className='w-full p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm cursor-pointer'>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className='w-[85%] p-6 overflow-y-auto bg-gray-50'>

        {/* PROFILE PAGE */}
        {activePage === 'Profile' && (
          <div>
            <h1 className='text-2xl font-bold text-primary-900 mb-6'>My Profile</h1>
            <div className='bg-white border rounded-lg p-6 max-w-2xl'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className='text-xl font-bold text-primary-900'>{user?.name}</h2>
                  <p className='text-gray-500'>{user?.email}</p>
                  <span className='text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full'>
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-primary-50 p-4 rounded-lg'>
                  <p className='text-gray-500 text-sm'>Total Leaves</p>
                  <p className='text-2xl font-bold text-primary-600'>{leaves.length}</p>
                </div>
                <div className='bg-primary-50 p-4 rounded-lg'>
                  <p className='text-gray-500 text-sm'>Attendance Records</p>
                  <p className='text-2xl font-bold text-primary-600'>{attendance.length}</p>
                </div>
                <div className='bg-primary-50 p-4 rounded-lg'>
                  <p className='text-gray-500 text-sm'>Payslips</p>
                  <p className='text-2xl font-bold text-primary-600'>{payslips.length}</p>
                </div>
                <div className='bg-primary-50 p-4 rounded-lg'>
                  <p className='text-gray-500 text-sm'>Pending Leaves</p>
                  <p className='text-2xl font-bold text-primary-600'>
                    {leaves.filter(l => l.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE PAGE */}
        {activePage === 'Attendance' && (
          <div>
            <h1 className='text-2xl font-bold text-primary-900 mb-4'>My Attendance</h1>

            {/* CHECK IN / CHECK OUT */}
            <div className='flex gap-4 mb-6'>

              {/* LEFT CARD - Buttons */}
              <div className='bg-white border rounded-lg p-5 flex flex-col items-center w-[220px] shadow-sm'>
                <p className='text-gray-500 text-sm mb-3 font-medium'>Mark Today's Attendance</p>
                {(() => {
                  const todayRecord = attendance.find(a =>
                    new Date(a.date).toDateString() === new Date().toDateString()
                  )

                  // No record at all — show Check In
                  if (!todayRecord) return (
                    <button
                      onClick={handleCheckIn}
                      className='w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg cursor-pointer font-medium'>
                      ✅ Check In
                    </button>
                  )

                  // Admin marked as absent — show absent message only
                  if (todayRecord.status === 'absent') return (
                    <div className='text-center'>
                      <p className='text-4xl mb-2'>🚫</p>
                      <p className='text-red-500 text-sm font-medium'>Marked Absent</p>
                      <p className='text-gray-400 text-xs mt-1'>by Admin</p>
                    </div>
                  )

                  // Checked in but not checked out — show Check Out
                  if (todayRecord.checkIn && !todayRecord.checkOut) return (
                    <div className='w-full'>
                      <p className='text-green-600 text-xs text-center mb-2 font-medium'>
                        ✅ Checked in at {new Date(todayRecord.checkIn).toLocaleTimeString()}
                      </p>
                      <button
                        onClick={handleCheckOut}
                        className='w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg cursor-pointer font-medium'>
                        🚪 Check Out
                      </button>
                    </div>
                  )

                  // Admin changed to half-day or late — allow update checkout
                  if (todayRecord.checkIn && todayRecord.checkOut &&
                    ['half-day', 'late'].includes(todayRecord.status)) return (
                    <div className='w-full'>
                      <p className='text-yellow-600 text-xs text-center mb-2 font-medium'>
                        ⚠️ Status: "{todayRecord.status}" by Admin
                      </p>
                      <button
                        onClick={handleCheckOut}
                        className='w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg cursor-pointer font-medium'>
                        🔄 Update Checkout
                      </button>
                    </div>
                  )

                  // Admin changed to present — allow update checkout
                  if (todayRecord.checkIn && todayRecord.checkOut &&
                    todayRecord.status === 'present') return (
                    <div className='w-full'>
                      <p className='text-green-600 text-xs text-center mb-2 font-medium'>
                        ✅ Status: "present" by Admin
                      </p>
                      <button
                        onClick={handleCheckOut}
                        className='w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg cursor-pointer font-medium'>
                        🔄 Update Checkout
                      </button>
                    </div>
                  )

                  // Fully completed naturally — show completion message
                  return (
                    <div className='text-center'>
                      <p className='text-green-600 text-xs font-medium mb-1'>✅ Checked in</p>
                      <p className='text-red-500 text-xs font-medium mb-1'>🚪 Checked out</p>
                      <p className='text-gray-400 text-xs'>Attendance complete!</p>
                    </div>
                  )
                })()}
              </div>

              {/* RIGHT CARD - Today's Status Info */}
              <div className='bg-white border rounded-lg p-5 shadow-sm flex-1'>
                <p className='text-gray-500 text-sm mb-3 font-medium'>Today's Status</p>
                {(() => {
                  const todayRecord = attendance.find(a =>
                    new Date(a.date).toDateString() === new Date().toDateString()
                  )
                  if (!todayRecord) return (
                    <p className='text-yellow-600 font-medium'>
                      Not marked yet — click Check In!
                    </p>
                  )

                  // Absent — no check in/out times
                  if (todayRecord.status === 'absent') return (
                    <div className='flex gap-8'>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Status</p>
                        <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'>
                          absent
                        </span>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Check In</p>
                        <p className='text-gray-400'>-</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Check Out</p>
                        <p className='text-gray-400'>-</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Work Hours</p>
                        <p className='text-gray-400'>-</p>
                      </div>
                    </div>
                  )

                  return (
                    <div className='flex gap-8'>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Check In</p>
                        <p className='font-bold text-primary-700'>
                          {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Check Out</p>
                        <p className='font-bold text-primary-700'>
                          {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : 'Not yet'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Work Hours</p>
                        <p className='font-bold text-primary-700'>
                          {todayRecord.workHours ? `${todayRecord.workHours}h` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${todayRecord.status === 'present' ? 'bg-green-100 text-green-700' :
                            todayRecord.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          {todayRecord.status}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* ATTENDANCE TABLE */}
            <div className='overflow-x-auto'>
              <table className='w-full border rounded-lg overflow-hidden'>
                <thead>
                  <tr className='bg-primary-600 text-white'>
                    <th className='p-3 text-left'>Date</th>
                    <th className='p-3 text-left'>Check In</th>
                    <th className='p-3 text-left'>Check Out</th>
                    <th className='p-3 text-left'>Work Hours</th>
                    <th className='p-3 text-left'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((att, index) => (
                    <tr key={att._id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                      <td className='p-3'>{new Date(att.date).toLocaleDateString()}</td>
                      <td className='p-3'>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '-'}</td>
                      <td className='p-3'>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '-'}</td>
                      <td className='p-3'>{att.workHours ? `${att.workHours}h` : '-'}</td>
                      <td className='p-3'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${att.status === 'present' ? 'bg-green-100 text-green-700' :
                            att.status === 'absent' ? 'bg-red-100 text-red-700' :
                            att.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan='5' className='p-6 text-center text-gray-400'>
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LEAVES PAGE */}
        {activePage === 'Leaves' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-primary-900'>My Leaves</h1>
              <button
                onClick={() => setShowLeaveForm(!showLeaveForm)}
                className='bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
                + Apply Leave
              </button>
            </div>

            {showLeaveForm && (
              <div className='border border-primary-100 rounded-lg p-6 mb-6 bg-primary-50'>
                <h3 className='font-bold text-lg mb-4 text-primary-900'>Apply for Leave</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <select className='border p-2 rounded-md'
                    value={newLeave.leaveType}
                    onChange={e => setNewLeave({...newLeave, leaveType: e.target.value})}>
                    <option value='sick'>Sick Leave</option>
                    <option value='casual'>Casual Leave</option>
                    <option value='earned'>Earned Leave</option>
                    <option value='maternity'>Maternity Leave</option>
                    <option value='paternity'>Paternity Leave</option>
                    <option value='unpaid'>Unpaid Leave</option>
                  </select>
                  <input type='date' className='border p-2 rounded-md'
                    value={newLeave.startDate}
                    onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} />
                  <input type='date' className='border p-2 rounded-md'
                    value={newLeave.endDate}
                    onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} />
                  <input placeholder='Reason' className='border p-2 rounded-md'
                    value={newLeave.reason}
                    onChange={e => setNewLeave({...newLeave, reason: e.target.value})} />
                </div>
                <div className='flex gap-3 mt-4'>
                  <button onClick={handleApplyLeave}
                    className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
                    Submit
                  </button>
                  <button onClick={() => setShowLeaveForm(false)}
                    className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className='overflow-x-auto'>
              <table className='w-full border rounded-lg overflow-hidden'>
                <thead>
                  <tr className='bg-primary-600 text-white'>
                    <th className='p-3 text-left'>Leave Type</th>
                    <th className='p-3 text-left'>Start Date</th>
                    <th className='p-3 text-left'>End Date</th>
                    <th className='p-3 text-left'>Total Days</th>
                    <th className='p-3 text-left'>Reason</th>
                    <th className='p-3 text-left'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave, index) => (
                    <tr key={leave._id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                      <td className='p-3 capitalize'>{leave.leaveType}</td>
                      <td className='p-3'>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td className='p-3'>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className='p-3'>{leave.totalDays} days</td>
                      <td className='p-3'>{leave.reason}</td>
                      <td className='p-3'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                            leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan='6' className='p-6 text-center text-gray-400'>
                        No leave requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYSLIPS PAGE */}
        {activePage === 'Payslips' && (
          <div>
            <h1 className='text-2xl font-bold text-primary-900 mb-6'>My Payslips</h1>
            <div className='overflow-x-auto'>
              <table className='w-full border rounded-lg overflow-hidden'>
                <thead>
                  <tr className='bg-primary-600 text-white'>
                    <th className='p-3 text-left'>Month/Year</th>
                    <th className='p-3 text-left'>Basic Salary</th>
                    <th className='p-3 text-left'>Allowances</th>
                    <th className='p-3 text-left'>Deductions</th>
                    <th className='p-3 text-left'>Net Salary</th>
                    <th className='p-3 text-left'>Status</th>
                    <th className='p-3 text-left'>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((pay, index) => (
                    <tr key={pay._id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                      <td className='p-3'>
                        {new Date(0, pay.month - 1).toLocaleString('default', { month: 'long' })} {pay.year}
                      </td>
                      <td className='p-3'>₹{pay.basicSalary?.toLocaleString()}</td>
                      <td className='p-3 text-green-600'>+₹{pay.totalAllowances?.toLocaleString()}</td>
                      <td className='p-3 text-red-600'>-₹{pay.totalDeductions?.toLocaleString()}</td>
                      <td className='p-3 font-bold text-primary-700'>₹{pay.netSalary?.toLocaleString()}</td>
                      <td className='p-3'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className='p-3'>
                        <button
                          onClick={() => handleDownloadPayslip(pay)}
                          className='bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700 cursor-pointer'>
                          📄 Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payslips.length === 0 && (
                    <tr>
                      <td colSpan='7' className='p-6 text-center text-gray-400'>
                        No payslips found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default EmployeePortal