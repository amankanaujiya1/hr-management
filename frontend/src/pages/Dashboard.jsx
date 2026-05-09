import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import API from '../api/axios'

const Dashboard = () => {
  const [workingHoursData, setWorkingHoursData] = useState([
  { day: 'Mon', hours: 0 },
  { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
])
  const user = JSON.parse(localStorage.getItem('user'))
  const [activePage, setActivePage] = useState('Dashboard')
  const navigate = useNavigate()

  // Stats state
  const [stats, setStats]=useState({
    totalEmployees:0,
    openJobs:0,
    pendingLeaves:0,
    presentToday:0,
  })

 

  const [employees, setEmployees]=useState([])
  const [showAddForm, setShowAddForm]=useState(false)
  const [newEmployee, setNewEmployee]=useState({
    name:'', email:'', password:'', employeeId:'', department:'', designation:'', phone:'', address:'',
    dateOfJoining:'', salary:''
  })
  const [editEmployee, setEditEmployee] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [jobs, setJobs] = useState([])
  const [newJob, setNewJob] = useState({
    title: '', department: '', description: '',
    requirements: '', location: '',
    salary: { min: '', max: '' },
    jobType: 'full-time'
  })

  const [applicants, setApplicants] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])

  const [payrolls, setPayrolls] = useState([])
  const [showPayrollForm, setShowPayrollForm] = useState(false)
  const [newPayroll, setNewPayroll] = useState({
  employeeId: '', month: '', year: '',
  allowances: { hra: '', transport: '', medical: '', other: '' },
  deductions: { tax: '', providentFund: '', other: '' } 
  })

  const [editPayroll, setEditPayroll] = useState(null)

  //Feting the data

  useEffect(()=>{
    
    const fetchStats =async ()=>{
      try{
        const empRes = await API.get('/employees')
        setEmployees(empRes.data)
        const jobRes= await API.get('/jobs')
        setJobs(jobRes.data) 
        const leavesRes = await API.get('/leaves')
        setLeaves(leavesRes.data)
        const pendingLeaves = leavesRes.data.filter(l => l.status =='pending').length
        const attendanceRes = await API.get('/attendance')
        setAttendance(attendanceRes.data)
        // Calculate real working hours for this week
        const today = new Date().toDateString()
        const presentToday = attendanceRes.data.filter(a=> new Date(a.date).toDateString()=== today && (a.status=='present' || a.status =='late')).length
        const applicantRes = await API.get('/applicants')
        const payrollRes = await API.get('/payroll')
        setPayrolls(payrollRes.data)
        setApplicants(applicantRes.data)
        setStats({
          totalEmployees: empRes.data.length,
          openJobs: jobRes.data.length,
          pendingLeaves: pendingLeaves,
          presentToday: presentToday
        })

        

// Calculate real working hours for this week
const currentDate = new Date()
const dayOfWeek = currentDate.getDay() // 0=Sun, 1=Mon...

// Get last 7 days
const last7Days = []
for (let i = 6; i >= 0; i--) {
  const date = new Date()
  date.setDate(currentDate.getDate() - i)
  last7Days.push(date)
}

// Map attendance data to chart format
const chartData = last7Days.map(date => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dateString = date.toDateString()

  // Find all attendance records for this day
  const dayAttendance = attendanceRes.data.filter(a =>
    new Date(a.date).toDateString() === dateString
  )

  // Calculate average work hours for that day
  const totalHours = dayAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0)
  const avgHours = dayAttendance.length > 0
    ? parseFloat((totalHours / dayAttendance.length).toFixed(1))
    : 0

  return { day: dayName, hours: avgHours }
})

setWorkingHoursData(chartData)

        


      } catch (error){
        console.error('Error fetching stats:',error)
      }
    }

    fetchStats()
  }, [])

  const handleAddEmployee = async()=>{
    try{
      const res = await API.post('/employees',newEmployee)
      setEmployees([...employees, res.data])
      setShowAddForm(false)
      setNewEmployee({
        name:'', email:'', password:'', employeeId:'', department:'', designation:'', phone:'', address:'',
        dateOfJoining:'', salary:''
      })
      alert('Employee added successfully!')

    }catch (error){
      alert(error.respose?.data?.message || 'Error adding employee')

    }
  }

  const handleDeleteEmployee = async (id)=>{
    if(!window.confirm('Are you sure you want to delete this employee?'))return
    try{
      await API.delete(`/employees/${id}`)
      setEmployees(employees.filter(emp=>emp._id !==id))
      alert('Eployee deleted successfully!')
    }catch(error){
      alert('Error deleting employee')
    }
  }



const filteredEmployees = employees.filter(emp => {
  const matchesSearch =
    emp.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(search.toLowerCase())

  const matchesStatus = filterStatus === 'all' || emp.status === filterStatus
  return matchesSearch && matchesStatus
})

  
  const handleLogout=()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleEditEmployee = async () => {
  try {
    const res = await API.put(`/employees/${editEmployee._id}`, {
      employeeId: editEmployee.employeeId,
      department: editEmployee.department,
      designation: editEmployee.designation,
      phone: editEmployee.phone,
      address: editEmployee.address,
      salary: editEmployee.salary,
      status: editEmployee.status
    })
    setEmployees(employees.map(emp => emp._id === editEmployee._id ? res.data : emp))
    setEditEmployee(null)
    alert('Employee updated successfully!')
  } catch (error) {
    alert('Error updating employee')
  }

  
  
}

const handleAddJob = async () => {
  try {
    const res = await API.post('/jobs', newJob)
    setJobs([...jobs, res.data])
    setShowAddJobForm(false)
    setNewJob({
      title: '', department: '', description: '',
      requirements: '', location: '',
      salary: { min: '', max: '' },
      jobType: 'full-time'
    })
    alert('Job posted successfully!')
  } catch (error) {
    alert(error.response?.data?.message || 'Error posting job')
  }
}

const handleDeleteJob = async (id) => {
  if (!window.confirm('Are you sure you want to delete this job?')) return
  try {
    await API.delete(`/jobs/${id}`)
    setJobs(jobs.filter(job => job._id !== id))
    alert('Job deleted successfully!')
  } catch (error) {
    alert('Error deleting job')
  }
}

const handleToggleJobStatus = async (job) => {
  try {
    const res = await API.put(`/jobs/${job._id}`, {
      status: job.status === 'open' ? 'closed' : 'open'
    })
    setJobs(jobs.map(j => j._id === job._id ? res.data : j))
  } catch (error) {
    alert('Error updating job status')
  }
}

const handleUpdateApplicantStatus = async (id, status) => {
  try {
    await API.put(`/applicants/${id}`, { status })
    setApplicants(applicants.map(app => 
      app._id === id 
        ? { ...app, status: status }
        : app
    ))
  } catch (error) {
    alert('Error updating status')
  }
}

const handleUpdateAttendanceStatus =async (id, status)=>{
try{
  await API.put(`/attendance/${id}`,{status})
  setAttendance(attendance.map(att=>
    att._id === id
    ?{...att, status:status}
    : att
  ))
}catch (error) {
  alert('Error marking attandance')
}
}

const handleUpdateLeaveStatus = async (id, status) => {
  try {
    const reviewNote = status === 'approved' ? 'Approved by Admin' : 'Rejected by Admin'
    const res = await API.put(`/leaves/${id}`, { status, reviewNote })
    setLeaves(leaves.map(leave =>
      leave._id === id
        ? { ...leave, status: status, reviewNote: reviewNote }
        : leave
    ))
  } catch (error) {
    alert('Error updating leave status')
  }
}

const handleGeneratePayroll = async () => {
  try {
    const payload = {
      month: parseInt(newPayroll.month),
      year: parseInt(newPayroll.year),
      allowances: {
        hra: newPayroll.allowances.hra ? parseFloat(newPayroll.allowances.hra) : undefined,
        transport: newPayroll.allowances.transport ? parseFloat(newPayroll.allowances.transport) : undefined,
        medical: newPayroll.allowances.medical ? parseFloat(newPayroll.allowances.medical) : undefined,
        other: newPayroll.allowances.other ? parseFloat(newPayroll.allowances.other) : undefined,
      },
      deductions: {
        tax: newPayroll.deductions.tax ? parseFloat(newPayroll.deductions.tax) : undefined,
        providentFund: newPayroll.deductions.providentFund ? parseFloat(newPayroll.deductions.providentFund) : undefined,
        other: newPayroll.deductions.other ? parseFloat(newPayroll.deductions.other) : undefined,
      }
    }
    const res = await API.post(`/payroll/generate/${newPayroll.employeeId}`, payload)
    setPayrolls([...payrolls, res.data])
    setShowPayrollForm(false)
    setNewPayroll({
      employeeId: '', month: '', year: '',
      allowances: { hra: '', transport: '', medical: '', other: '' },
      deductions: { tax: '', providentFund: '', other: '' }
    })
    alert('Payroll generated successfully!')
  } catch (error) {
    alert(error.response?.data?.message || 'Error generating payroll')
  }
}

const handleMarkAsPaid = async (id) => {
  try {
    const res = await API.put(`/payroll/${id}`)
    setPayrolls(payrolls.map(p => p._id === id ? res.data : p))
    alert('Salary marked as paid!')
  } catch (error) {
    alert('Error marking as paid')
  }
}

const handleDeletePayroll = async (id) => {
  if (!window.confirm('Are you sure you want to delete this payroll record?')) return
  try {
    await API.delete(`/payroll/${id}`)
    setPayrolls(payrolls.filter(p => p._id !== id))
    alert('Payroll deleted successfully!')
  } catch (error) {
    alert('Error deleting payroll')
  }
}

const handleEditPayroll = async () => {
  try {
    const res = await API.put(`/payroll/edit/${editPayroll._id}`, {
      allowances: editPayroll.allowances,
      deductions: editPayroll.deductions
    })
    setPayrolls(payrolls.map(p => p._id === editPayroll._id ? res.data : p))
    setEditPayroll(null)
    alert('Payroll updated successfully!')
  } catch (error) {
    alert('Error updating payroll')
  }
}





  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="border w-[15%] p-4 flex flex-col">
        <div>
          <h2 className="font-bold">Welcome, {user?.name}! 👋</h2>
        </div>
        <br />
        <div className="flex flex-col">
          {['Dashboard', 'Employees', 'Jobs', 'Applicants', 'Attendance', 'Leave', 'Payroll'].map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer text-left
                ${activePage === item ? 'bg-primary-600 text-white' : 'hover:bg-primary-300 mt-5'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-[85%] border p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">{activePage}</h1>
        <button onClick={handleLogout} className='ml-280  bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>Logout</button>

       {activePage === 'Dashboard' && (
  <div>
    {/* STATS CARDS */}
    <div className='flex gap-4 mt-4'>
      <div className='w-[23%] border p-5 rounded-lg shadow-sm'>
        <p className='text-gray-500 text-sm'>Total Employees</p>
        <h1 className='text-3xl font-bold mt-1 text-primary-600'>{stats.totalEmployees}</h1>
      </div>
      <div className='w-[23%] border p-5 rounded-lg shadow-sm'>
        <p className='text-gray-500 text-sm'>Open Jobs</p>
        <h1 className='text-3xl font-bold mt-1 text-primary-600'>{stats.openJobs}</h1>
      </div>
      <div className='w-[23%] border p-5 rounded-lg shadow-sm'>
        <p className='text-gray-500 text-sm'>Pending Leaves</p>
        <h1 className='text-3xl font-bold mt-1 text-primary-600'>{stats.pendingLeaves}</h1>
      </div>
      <div className='w-[23%] border p-5 rounded-lg shadow-sm'>
        <p className='text-gray-500 text-sm'>Present Today</p>
        <h1 className='text-3xl font-bold mt-1 text-primary-600'>{stats.presentToday}</h1>
      </div>
    </div>

    {/* AVG WORKING HOURS SECTION */}
<div className='border rounded-lg shadow-sm p-6 mt-6'>
  <h2 className='font-bold text-lg text-primary-900 mb-4'>
    Average Working Hours This Week
  </h2>

  {/* SUB CARDS */}
<div className='flex gap-4 mb-6'>
  <div className='bg-primary-50 border border-primary-100 rounded-lg p-4 w-[20%]'>
    <p className='text-gray-500 text-sm'>Today's Average</p>
    <h1 className='text-3xl font-bold mt-1 text-primary-600'>
      {workingHoursData.find(d => 
        d.day === new Date().toLocaleDateString('en-US', { weekday: 'short' })
      )?.hours || 0}h
    </h1>
  </div>
  <div className='bg-primary-50 border border-primary-100 rounded-lg p-4 w-[20%]'>
    <p className='text-gray-500 text-sm'>This Week Avg</p>
    <h1 className='text-3xl font-bold mt-1 text-primary-600'>
      {workingHoursData.filter(d => d.hours > 0).length > 0
        ? parseFloat((workingHoursData.reduce((sum, d) => sum + d.hours, 0) /
            workingHoursData.filter(d => d.hours > 0).length).toFixed(1))
        : 0}h
    </h1>
  </div>
  <div className='bg-primary-50 border border-primary-100 rounded-lg p-4 w-[20%]'>
    <p className='text-gray-500 text-sm'>Total Hours This Week</p>
    <h1 className='text-3xl font-bold mt-1 text-primary-600'>
      {parseFloat(workingHoursData.reduce((sum, d) => sum + d.hours, 0).toFixed(1))}h
    </h1>
  </div>
</div>

  {/* BAR CHART */}
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={workingHoursData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis domain={[0, 10]} unit="h" />
      <Tooltip formatter={(value) => [`${value}h`, 'Avg Hours']} />
      <Bar dataKey="hours" fill="#068cf9" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
  </div>
)}
        {activePage === 'Employees' && (
          
          <div>
            
            
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold text-primary-900'>All Employees
                <span className='ml-2 bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full'>
                {filteredEmployees.length}
              </span>
              </h2>
              <button
              onClick={()=>setShowAddForm(!showAddForm)}
              className='bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer mt-5'
              
              >+ Add Employee</button>
            </div>
            {/* SEARCH AND FILTER BAR */}
    <div className='flex gap-4 mb-4'>
      <input
        type='text'
        placeholder='🔍 Search by name, email, department...'
        className='border p-2 rounded-lg w-[60%] focus:outline-none focus:ring-2 focus:ring-primary-400'
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className='border p-2 rounded-lg w-[20%] focus:outline-none focus:ring-2 focus:ring-primary-400'
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
      >
        <option value='all'>All Status</option>
        <option value='active'>Active</option>
        <option value='inactive'>Inactive</option>
        <option value='terminated'>Terminated</option>
      </select>
    </div>
            {showAddForm &&(
              <div className='border border-primary-100 rounded-lg p-6 mb-6  bg-primary-50'>
                <h3 className='font-bold text-lg mb-4 text-primary-900 '>New Employee</h3>
                <div className='grid grid-cols-3 gap-4'>
                  <input placeholder='Full Name' className='border p-2 rounded-ml'
                  value={newEmployee.name} onChange={e=> setNewEmployee({...newEmployee, name:e.target.value})} />
                  <input placeholder='Email' className='border p-2 rounded-ml'
                  value={newEmployee.email} onChange={e=> setNewEmployee({...newEmployee, email:e.target.value})} />
                  <input placeholder='Password' className='border p-2 rounded-ml'
                  value={newEmployee.password} onChange={e=> setNewEmployee({...newEmployee, password:e.target.value})} />
                  <input placeholder='Emp_Id( e.g. EMP002)' className='border p-2 rounded-ml'
                  value={newEmployee.employeeId} onChange={e=> setNewEmployee({...newEmployee, employeeId:e.target.value})} />
                  <input placeholder='Department' className='border p-2 rounded-ml'
                  value={newEmployee.department} onChange={e=> setNewEmployee({...newEmployee, department:e.target.value})} />
                   <input placeholder='Designation' className='border p-2 rounded-md'
                    value={newEmployee.designation} onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})} />
                  <input placeholder='Phone' className='border p-2 rounded-md'
                    value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                  <input placeholder='Address' className='border p-2 rounded-md'
                    value={newEmployee.address} onChange={e => setNewEmployee({...newEmployee, address: e.target.value})} />
                  <input placeholder='Date of Joining' type='date' className='border p-2 rounded-md'
                    value={newEmployee.dateOfJoining} onChange={e => setNewEmployee({...newEmployee, dateOfJoining: e.target.value})} />
                  <input placeholder='Salary' type='number' className='border p-2 rounded-md'
                    value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})} />

                </div>
                <div className='flex gap-3 mt-4'>
                  <button onClick={handleAddEmployee}
                  className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700'>Save Employee</button>
                  <button onClick={()=>
                    setShowAddForm(false)} 
                    className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100'>
                      Cancel
                    </button>
                </div>
              </div>
            )}

            {editEmployee && (
              <div className='border border-primary-100 rounded-lg p-6 mb-6 bg-primary-50'>
                <h3 className='font-bold text-lg mb-4 text-primary-900'>Edit Employee — {editEmployee.user?.name}</h3>
                <div className='grid grid-cols-3 gap-4'>
                   <input placeholder='Employee ID' className='border p-2 rounded-md'
                    value={editEmployee.employeeId}
                    onChange={e => setEditEmployee({...editEmployee, employeeId: e.target.value})} />

                  <input placeholder='Department' className='border p-2 rounded-md'
                    value={editEmployee.department}
                    onChange={e => setEditEmployee({...editEmployee, department: e.target.value})} />
                  <input placeholder='Designation' className='border p-2 rounded-md'
                    value={editEmployee.designation}
                    onChange={e => setEditEmployee({...editEmployee, designation: e.target.value})} />
                  <input placeholder='Phone' className='border p-2 rounded-md'
                    value={editEmployee.phone}
                    onChange={e => setEditEmployee({...editEmployee, phone: e.target.value})} />
                  <input placeholder='Address' className='border p-2 rounded-md'
                    value={editEmployee.address}
                    onChange={e => setEditEmployee({...editEmployee, address: e.target.value})} />
                  <input placeholder='Salary' type='number' className='border p-2 rounded-md'
                    value={editEmployee.salary}
                    onChange={e => setEditEmployee({...editEmployee, salary: e.target.value})} />
                  <select className='border p-2 rounded-md'
                    value={editEmployee.status}
                    onChange={e => setEditEmployee({...editEmployee, status: e.target.value})}>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                    <option value='terminated'>Terminated</option>
                  </select>
                </div>
                <div className='flex gap-3 mt-4'>
                  <button onClick={handleEditEmployee}
                    className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
                    Update Employee
                  </button>
                  <button onClick={() => setEditEmployee(null)}
                    className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          
            <div className='overflow-x-auto'>
            
              <table className="w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-primary-600 text-white">
                    <th className="p-3 text-left">Emp ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Designation</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Salary</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                 {filteredEmployees.map((emp, index)=>(
                  <tr key={emp._id}
                  className={index%2==0? 'bg-white':'bg-primary-50'}>
                  <td className='p-3'>{emp.employeeId}</td>
                  <td className='p-3'>{emp.user?.name}</td>
                  <td className='p-3'>{emp.user?.email}</td>
                  <td className='p-3'>{emp.department}</td>
                  <td className='p-3'>{emp.designation}</td>
                  <td className='p-3'>{emp.phone}</td>
                  <td className='p-3'>{emp.salary.toLocaleString()}</td>
                  <td className='p-3 '>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {emp.status}
                        </span>
                  </td>
                  
                  <td className='p-3 flex gap-2'>
                    <button
                      onClick={() => setEditEmployee(emp)}
                      className='bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700 cursor-pointer'>
                      Edit
                    </button>
                    <button onClick={()=>handleDeleteEmployee(emp._id)} className='bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 cursor-pointer'>
                      Delete
                    </button>
                  </td>
                  </tr>
                 ))}
                 
                </tbody>
              </table>
            </div>
            
            


          </div>
        )}

      {activePage === 'Jobs' && (
  <div className='mt-5'>

    {/* HEADER */}
    <div className='flex items-center justify-between mb-4'>
      <h2 className='text-xl font-bold text-primary-900'>
        Job Listings
        <span className='ml-2 bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full'>
          {jobs.length}
        </span>
      </h2>
      <button
        onClick={() => setShowAddJobForm(!showAddJobForm)}
        className='px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer'>
        {showAddJobForm ? 'Cancel' : '+ Post New Job'}
      </button>
    </div>

    {/* ADD JOB FORM */}
    {showAddJobForm && (
      <div className='p-6 bg-primary-50 border border-primary-100 rounded-lg mb-6 shadow-sm'>
        <h3 className='font-bold text-lg mb-4 text-primary-900'>Post New Job</h3>
        <div className='grid grid-cols-3 gap-4'>
          <input type='text' placeholder='Job Title' className='p-2 border rounded-md'
            value={newJob.title}
            onChange={e => setNewJob({...newJob, title: e.target.value})} />
          <input type='text' placeholder='Department' className='p-2 border rounded-md'
            value={newJob.department}
            onChange={e => setNewJob({...newJob, department: e.target.value})} />
          <input type='text' placeholder='Location' className='p-2 border rounded-md'
            value={newJob.location}
            onChange={e => setNewJob({...newJob, location: e.target.value})} />
          <input type='number' placeholder='Min Salary' className='p-2 border rounded-md'
            value={newJob.salary.min}
            onChange={e => setNewJob({...newJob, salary: {...newJob.salary, min: e.target.value}})} />
          <input type='number' placeholder='Max Salary' className='p-2 border rounded-md'
            value={newJob.salary.max}
            onChange={e => setNewJob({...newJob, salary: {...newJob.salary, max: e.target.value}})} />
          <select className='p-2 border rounded-md'
            value={newJob.jobType}
            onChange={e => setNewJob({...newJob, jobType: e.target.value})}>
            <option value='full-time'>Full Time</option>
            <option value='part-time'>Part Time</option>
            <option value='internship'>Internship</option>
            <option value='contract'>Contract</option>
          </select>
          <textarea placeholder='Job Description' className='p-2 border rounded-md col-span-3'
            rows={2} value={newJob.description}
            onChange={e => setNewJob({...newJob, description: e.target.value})} />
          <textarea placeholder='Requirements' className='p-2 border rounded-md col-span-3'
            rows={2} value={newJob.requirements}
            onChange={e => setNewJob({...newJob, requirements: e.target.value})} />
        </div>
        <div className='flex gap-3 mt-4'>
          <button onClick={handleAddJob}
            className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
            Post Job
          </button>
          <button onClick={() => setShowAddJobForm(false)}
            className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* JOBS TABLE */}
    <div className='overflow-x-auto'>
      <table className='w-full border rounded-lg overflow-hidden'>
        <thead>
          <tr className='bg-primary-600 text-white'>
            <th className='p-3 text-left'>Title</th>
            <th className='p-3 text-left'>Department</th>
            <th className='p-3 text-left'>Location</th>
            <th className='p-3 text-left'>Salary Range</th>
            <th className='p-3 text-left'>Job Type</th>
            <th className='p-3 text-left'>Status</th>
            <th className='p-3 text-left'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => (
            <tr key={job._id}
              className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
              <td className='p-3 font-medium'>{job.title}</td>
              <td className='p-3'>{job.department}</td>
              <td className='p-3'>{job.location}</td>
              <td className='p-3'>₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()}</td>
              <td className='p-3 capitalize'>{job.jobType}</td>
              <td className='p-3'>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {job.status}
                </span>
              </td>
              <td className='p-3 flex gap-2'>
                <button
                  onClick={() => handleToggleJobStatus(job)}
                  className='bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 cursor-pointer'>
                  {job.status === 'open' ? 'Close' : 'Open'}
                </button>
                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className='bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 cursor-pointer'>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan='7' className='p-6 text-center text-gray-400'>
                No jobs posted yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

        {activePage === 'Applicants' && (
          <div >
            <div className='flex'>
              <h1 className='text-xl font-bold text-primary-900 '>All Applicants</h1>
               <span className='ml-2 bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full'>
                {applicants.length}
              </span>
            </div>

            {/* Applicants TABLE */}
    <div className='overflow-x-auto mt-4'>
      <table className='w-full border rounded-lg overflow-hidden'>
        <thead>
          <tr className='bg-primary-600 text-white'>
            <th className='p-3 text-left'>Name</th>
            <th className='p-3 text-left'>Email</th>
            <th className='p-3 text-left'>Phone Number</th>
            <th className='p-3 text-left'>Job Applied For</th>
            <th className='p-3 text-left'>Experience</th>
            <th className='p-3 text-left'>Status</th>
            <th className='p-3 text-left'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((app, index)=>(
            <tr key={app._id}
            className={index % 2==0? 'bg-white': 'bg-primary-50' }>
              <td className='p-3'>{app.name}</td>
              <td className='p-3'>{app.email}</td>
              <td className='p-3'>{app.phone}</td>
              <td className='p-3'>{app.job?.title || 'N/A'}</td>
              <td className='p-3'>{app.experience}</td>
              <td className='p-3'>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${app.status ==='selected'? 'bg-green-100 text-green-700':
                    app.status ==='rejected' ? 'bg-red-100 text-red-700':
                    app.status ==='shortlisted'? 'bg-blue-100 text-blue-700':
                    app.status ==='interviewed' ? 'bg-yellow-100 text-yellow-700':
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {app.status}
                </span>
              </td>
              <td className='p-3'>
                <select 
                value={app.status}
                onChange={e=> handleUpdateApplicantStatus(app._id, e.target.value)}
                className='border p-1 rounded-sm focus:outline-none focus:ring-primary-400 '>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviwed</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                </select>

              </td>
            </tr>
          ))}
          {applicants.length==0 && (
            <tr>
              <td colSpan='7' className='p-6 text-center text-gray-400'> No Applicants yet</td>
            </tr>
          )}
          </tbody>
          </table>
        </div>
            

        </div>
        )}

        {activePage === 'Attendance' && (
          <div>
            <div className='flex items-center mb-4'>
              <h1 className='text-xl font-bold text-primary-900'>Total Attendance</h1>
              <span className='ml-2 bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full'>
                {attendance.length}
              </span>
            </div>

            <div className='overflow-x-auto mt-4'>
              <table className='w-full border rounded-lg overflow-hidden'>
                <thead>
                  <tr className='bg-primary-600 text-white'>
                    <th className='p-3 text-left'>Name</th>
                    <th className='p-3 text-left'>Date</th>
                    <th className='p-3 text-left'>Check In</th>
                    <th className='p-3 text-left'>Check Out</th>
                    <th className='p-3 text-left'>Work Hours</th>
                    <th className='p-3 text-left'>Status</th>
                    <th className='p-3 text-left'>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((att, index) => (
                    <tr key={att._id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                      <td className='p-3'>{att.employee?.user?.name || 'N/A'}</td>
                      <td className='p-3'>{new Date(att.date).toLocaleDateString()}</td>
                      <td className='p-3'>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '-'}</td>
                      <td className='p-3'>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '-'}</td>
                      <td className='p-3'>{att.workHours ? `${att.workHours}h` : '-'}</td>
                      <td className='p-3'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${att.status === 'present' ? 'bg-green-100 text-green-700' :
                            att.status === 'absent' ? 'bg-red-100 text-red-700' :
                            att.status === 'half-day' ? 'bg-blue-100 text-blue-700' :
                            att.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'}`}>
                          {att.status}
                        </span>
                      </td>
                      <td className='p-3'>
                        <select
                          value={att.status}
                          onChange={e => handleUpdateAttendanceStatus(att._id, e.target.value)}
                          className='border p-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'>
                          <option value='present'>Present</option>
                          <option value='absent'>Absent</option>
                          <option value='half-day'>Half Day</option>
                          <option value='late'>Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan='7' className='p-6 text-center text-gray-400'>No attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

          {activePage === 'Leave' && (
  <div>
    <div className='flex items-center mb-4'>
      <h1 className='text-xl font-bold text-primary-900'>Total Leaves</h1>
      <span className='ml-2 bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full'>
        {leaves.length}
      </span>
    </div>

    <div className='overflow-x-auto mt-4'>
      <table className='w-full border rounded-lg overflow-hidden'>
        <thead>
          <tr className='bg-primary-600 text-white'>
            <th className='p-3 text-left'>Name</th>
            <th className='p-3 text-left'>Leave Type</th>
            <th className='p-3 text-left'>Start Date</th>
            <th className='p-3 text-left'>End Date</th>
            <th className='p-3 text-left'>Total Days</th>
            <th className='p-3 text-left'>Reason</th>
            <th className='p-3 text-left'>Status</th>
            <th className='p-3 text-left'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave, index) => (
            <tr key={leave._id}
              className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
              <td className='p-3'>{leave.employee?.user?.name || 'N/A'}</td>
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
              
            <td className='p-3'>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleUpdateLeaveStatus(leave._id, 'approved')}
                  className='bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 cursor-pointer'>
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateLeaveStatus(leave._id, 'rejected')}
                  className='bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 cursor-pointer'>
                  Reject
                </button>
              </div>
            </td>
            </tr>
          ))}
          {leaves.length === 0 && (
            <tr>
              <td colSpan='8' className='p-6 text-center text-gray-400'>
                No leave requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

        {activePage === 'Payroll' && (
  <div>
    {/* HEADER */}
    <div className='flex justify-between items-center mb-4 mt-4'>
      <div className='flex items-center'>
        <h1 className='text-xl font-bold text-primary-900'>Payroll</h1>
        <span className='ml-2 bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full'>
          {payrolls.length}
        </span>
      </div>
      <button
        onClick={() => setShowPayrollForm(!showPayrollForm)}
        className='bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
        + Generate Payroll
      </button>
    </div>

    {/* GENERATE PAYROLL FORM */}
    {showPayrollForm && (
  <div className='border border-primary-100 rounded-lg p-6 mb-6 bg-primary-50'>
    <h3 className='font-bold text-lg mb-4 text-primary-900'>Generate Payroll</h3>
    
    {/* BASIC INFO */}
    <div className='grid grid-cols-3 gap-4 mb-4'>
      <select
        className='border p-2 rounded-md'
        value={newPayroll.employeeId}
        onChange={e => setNewPayroll({...newPayroll, employeeId: e.target.value})}>
        <option value=''>Select Employee</option>
        {employees.map(emp => (
          <option key={emp._id} value={emp._id}>
            {emp.user?.name} ({emp.employeeId})
          </option>
        ))}
      </select>
      <select
        className='border p-2 rounded-md'
        value={newPayroll.month}
        onChange={e => setNewPayroll({...newPayroll, month: e.target.value})}>
        <option value=''>Select Month</option>
        <option value='1'>January</option>
        <option value='2'>February</option>
        <option value='3'>March</option>
        <option value='4'>April</option>
        <option value='5'>May</option>
        <option value='6'>June</option>
        <option value='7'>July</option>
        <option value='8'>August</option>
        <option value='9'>September</option>
        <option value='10'>October</option>
        <option value='11'>November</option>
        <option value='12'>December</option>
      </select>
      <input
        type='number'
        placeholder='Year (e.g. 2026)'
        className='border p-2 rounded-md'
        value={newPayroll.year}
        onChange={e => setNewPayroll({...newPayroll, year: e.target.value})} />
    </div>

    {/* ALLOWANCES */}
    <h4 className='font-semibold text-primary-800 mb-2 mt-4'>
      Allowances 
      <span className='text-gray-400 text-xs ml-2'>(leave blank to use default)</span>
    </h4>
    <div className='grid grid-cols-4 gap-4 mb-4'>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>HRA</label>
        <input
          type='number' placeholder='Auto (40% of basic)'
          className='border p-2 rounded-md w-full'
          value={newPayroll.allowances.hra}
          onChange={e => setNewPayroll({...newPayroll, allowances: {...newPayroll.allowances, hra: e.target.value}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Transport</label>
        <input
          type='number' placeholder='Auto (₹2000)'
          className='border p-2 rounded-md w-full'
          value={newPayroll.allowances.transport}
          onChange={e => setNewPayroll({...newPayroll, allowances: {...newPayroll.allowances, transport: e.target.value}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Medical</label>
        <input
          type='number' placeholder='Auto (₹1500)'
          className='border p-2 rounded-md w-full'
          value={newPayroll.allowances.medical}
          onChange={e => setNewPayroll({...newPayroll, allowances: {...newPayroll.allowances, medical: e.target.value}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Other</label>
        <input
          type='number' placeholder='0'
          className='border p-2 rounded-md w-full'
          value={newPayroll.allowances.other}
          onChange={e => setNewPayroll({...newPayroll, allowances: {...newPayroll.allowances, other: e.target.value}})} />
      </div>
    </div>

    {/* DEDUCTIONS */}
    <h4 className='font-semibold text-primary-800 mb-2 mt-2'>
      Deductions
      <span className='text-gray-400 text-xs ml-2'>(leave blank to use default)</span>
    </h4>
    <div className='grid grid-cols-3 gap-4 mb-4'>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Tax</label>
        <input
          type='number' placeholder='Auto (10% of basic)'
          className='border p-2 rounded-md w-full'
          value={newPayroll.deductions.tax}
          onChange={e => setNewPayroll({...newPayroll, deductions: {...newPayroll.deductions, tax: e.target.value}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Provident Fund</label>
        <input
          type='number' placeholder='Auto (12% of basic)'
          className='border p-2 rounded-md w-full'
          value={newPayroll.deductions.providentFund}
          onChange={e => setNewPayroll({...newPayroll, deductions: {...newPayroll.deductions, providentFund: e.target.value}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Other</label>
        <input
          type='number' placeholder='0'
          className='border p-2 rounded-md w-full'
          value={newPayroll.deductions.other}
          onChange={e => setNewPayroll({...newPayroll, deductions: {...newPayroll.deductions, other: e.target.value}})} />
      </div>
    </div>

    <div className='flex gap-3 mt-4'>
      <button
        onClick={handleGeneratePayroll}
        className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
        Generate Payroll
      </button>
      <button
        onClick={() => setShowPayrollForm(false)}
        className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
        Cancel
      </button>
    </div>
  </div>
)}

    {editPayroll && (
  <div className='border border-primary-100 rounded-lg p-6 mb-6 bg-primary-50'>
    <h3 className='font-bold text-lg mb-4 text-primary-900'>
      Edit Payroll — {editPayroll.employee?.user?.name}
    </h3>

    {/* ALLOWANCES */}
    <h4 className='font-semibold text-primary-800 mb-2'>Allowances</h4>
    <div className='grid grid-cols-4 gap-4 mb-4'>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>HRA</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.allowances.hra}
          onChange={e => setEditPayroll({...editPayroll,
            allowances: {...editPayroll.allowances, hra: parseFloat(e.target.value)}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Transport</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.allowances.transport}
          onChange={e => setEditPayroll({...editPayroll,
            allowances: {...editPayroll.allowances, transport: parseFloat(e.target.value)}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Medical</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.allowances.medical}
          onChange={e => setEditPayroll({...editPayroll,
            allowances: {...editPayroll.allowances, medical: parseFloat(e.target.value)}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Other</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.allowances.other}
          onChange={e => setEditPayroll({...editPayroll,
            allowances: {...editPayroll.allowances, other: parseFloat(e.target.value)}})} />
      </div>
    </div>

    {/* DEDUCTIONS */}
    <h4 className='font-semibold text-primary-800 mb-2'>Deductions</h4>
    <div className='grid grid-cols-3 gap-4 mb-4'>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Tax</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.deductions.tax}
          onChange={e => setEditPayroll({...editPayroll,
            deductions: {...editPayroll.deductions, tax: parseFloat(e.target.value)}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Provident Fund</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.deductions.providentFund}
          onChange={e => setEditPayroll({...editPayroll,
            deductions: {...editPayroll.deductions, providentFund: parseFloat(e.target.value)}})} />
      </div>
      <div>
        <label className='text-xs text-gray-500 mb-1 block'>Other</label>
        <input type='number' className='border p-2 rounded-md w-full'
          value={editPayroll.deductions.other}
          onChange={e => setEditPayroll({...editPayroll,
            deductions: {...editPayroll.deductions, other: parseFloat(e.target.value)}})} />
      </div>
    </div>

    <div className='flex gap-3 mt-4'>
      <button onClick={handleEditPayroll}
        className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>
        Update Payroll
      </button>
      <button onClick={() => setEditPayroll(null)}
        className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
        Cancel
      </button>
    </div>
  </div>
)}

    {/* PAYROLL TABLE */}
    <div className='overflow-x-auto'>
      <table className='w-full border rounded-lg overflow-hidden'>
        <thead>
          <tr className='bg-primary-600 text-white'>
            <th className='p-3 text-left'>Employee</th>
            <th className='p-3 text-left'>Month/Year</th>
            <th className='p-3 text-left'>Basic Salary</th>
            <th className='p-3 text-left'>Allowances</th>
            <th className='p-3 text-left'>Deductions</th>
            <th className='p-3 text-left'>Net Salary</th>
            <th className='p-3 text-left'>Status</th>
            <th className='p-3 text-left'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((payroll, index) => (
            <tr key={payroll._id}
              className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
              <td className='p-3'>{payroll.employee?.user?.name || 'N/A'}</td>
              <td className='p-3'>
                {new Date(0, payroll.month - 1).toLocaleString('default', { month: 'long' })} {payroll.year}
              </td>
              <td className='p-3'>₹{payroll.basicSalary?.toLocaleString()}</td>
              <td className='p-3 text-green-600'>+₹{payroll.totalAllowances?.toLocaleString()}</td>
              <td className='p-3 text-red-600'>-₹{payroll.totalDeductions?.toLocaleString()}</td>
              <td className='p-3 font-bold text-primary-700'>₹{payroll.netSalary?.toLocaleString()}</td>
              <td className='p-3'>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${payroll.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'}`}>
                  {payroll.status}
                </span>
              </td>
             <td className='p-3'>
              <div className='flex gap-2 flex-wrap'>
                {payroll.status === 'generated' ? (
                  <>
                    <button
                      onClick={() => handleMarkAsPaid(payroll._id)}
                      className='bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 cursor-pointer'>
                      Mark Paid
                    </button>
                    <button
                      onClick={() => setEditPayroll(payroll)}
                      className='bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700 cursor-pointer'>
                      Edit
                    </button>
                  </>
                ) : (
                  <span className='text-gray-400 text-sm'>
                    Paid on {new Date(payroll.paidOn).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleDeletePayroll(payroll._id)}
                  className='bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 cursor-pointer'>
                  Delete
                </button>
              </div>
            </td>
            </tr>
          ))}
          {payrolls.length === 0 && (
            <tr>
              <td colSpan='8' className='p-6 text-center text-gray-400'>
                No payroll records found
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

export default Dashboard