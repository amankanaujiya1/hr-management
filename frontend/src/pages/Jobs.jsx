import { useNavigate } from 'react-router-dom'

import API from '../api/axios'
import { useEffect, useState } from 'react'

const Jobs = () => {
  const navigate = useNavigate()
  const [jobs, setJobs]=useState([])
  const [selectedJob, setSelectdJob]=useState(null)
  const [ShowApplyingForm,  setShowApplyForm]=useState(false)
  const [application, setApplication]= useState({
    name:'', email:'', phone:'',experience:'',
    resumeLink:'', coverLetter:''

  })

  useEffect(()=>{
    const fetchJobs =async()=>{
      try{
      const res=await API.get('/jobs')
      setJobs(res.data)
    }catch(error){
      console.error('Error fetching jobs:',error);
      
    }
    } 

    fetchJobs()
    
    
  },[])

  const handdleApply=async ()=>{
    try{
      await API.post('/applicants',{
        jobId: selectedJob._id,
        ...application
      })
      alert('Application submitted successfully!')
      setShowApplyForm(false)
      setApplication({
        name:'', email:'', phone:'',
        experience:'', resumeLink:'', coverLetter:''
      })
    }catch(error){
      alert(error.respons?.data?.message || 'Error submitting application')
    }
  }


  return (
    <div className='min-h-screen bg-gray-50'>
      
      {/* NAVBAR */}
      <nav className='bg-primary-900 text-white px-10 py-4 flex justify-between items-center shadow-md'>
        <div className='flex items-center gap-2'>
          <span className='text-4xl'>🏢</span>
          <h1 className='text-xl font-bold'>HR Management System</h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className='bg-primary-500 hover:bg-primary-400 text-white px-5 py-2 rounded-lg cursor-pointer transition'>
          Login
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div className='px-10 py-8'>
        <h2 className='text-2xl font-bold text-primary-900 mb-2'>Available Jobs</h2>
        <p className='text-gray-500 mb-6'>Find your dream job and apply today!</p>

        {/* JOB CARDS WILL GO HERE */}
        <div className='grid grid-cols-3 gap-6'>
          {/* we'll add job cards next */}
          {jobs.map(job =>(
            <div key={job._id} className='bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition '>
            <h1 className='text-xl font-bold text-primary-900 mb-2'>{job.title}</h1>
            <p className='text-gray-600 text-sm mb-1'>{job.department}</p>
            <p className='text-gray-600 text-sm mb-1'>📍{job.location}</p>
            <p className='text-gray-600 text-sm mb-1'>₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()} </p>
            <p className='text-gray-600 text-sm mb-1 capitalize'>{job.jobType} </p>
            <p className='text-gray-600 text-sm mb-1 line-clamp-2'>{job.description} </p>
            
            <button 
              onClick={()=>{setSelectdJob(job); setShowApplyForm(true)}}
              className='w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg cursor-pointer transition'>
              Apply Now
            </button>

          </div>
          ))}

          {jobs.length === 0 && (
            <p className='text-gray-400 col-span-3 text-center'>No jobs available right now</p>
          )}
          
        </div>

        {/* Apply form */}
        {ShowApplyingForm && selectedJob &&(
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 w-[600px] max-h-[90vh] overflow-y-auto '>
          <h3 className='text-xl font-bold text-primary-900 mb-1'>Apply for {selectedJob.title}</h3>
          <p className='text-gray-500 text-sm  mb-6'>{selectedJob.department} . {selectedJob.location}</p>
          <div className='flex flex-col gap-4'>
            <input placeholder='Full Name' className='border p-2 rounded-md'
            value={application.name}
            onChange={e=>setApplication({...application, name:e.target.value})}/>
            <input placeholder='Email' type='email' className='border p-2 rounded-md'
            value={application.email}
            onChange={e=>setApplication({...application, email:e.target.value})}/>
            <input placeholder='Phone Number' className='border p-2 rounded-md'
            value={application.phone}
            onChange={e=>setApplication({...application, phone:e.target.value})}/>
            <input placeholder='Years of Experience (e.g. 2 years in React)' className='border p-2 rounded-md'
            value={application.experience}
            onChange={e=>setApplication({...application, experience:e.target.value})}/>
            <input placeholder='Resume Link (Google Drive / LinkedIn)' className='border p-2 rounded-md'
            value={application.resumeLink}
            onChange={e=>setApplication({...application, resumeLink:e.target.value})}/>
            <textarea placeholder='cover letter (optional)'className='border p-2 rounded-md' rows={3}
            value={application.coverLetter}
            onChange={e=> setApplication({...application, coverLetter:e.target.value})}></textarea>

          </div>
          <div className='flex gap-3 mt-6'>
            <button onClick={handdleApply}
            className='bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer'>

              Submit Application

            </button>
            <button onClick={()=>setShowApplyForm(false)}
              className='border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
              Cancel

            </button>
          </div>

          </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Jobs