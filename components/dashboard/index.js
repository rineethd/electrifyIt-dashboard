import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const columns = [
  { key: "LicensePlate", label: "License Plate" },
  { key: "Make", label: "Make" },
  { key: "VIN", label: "VIN" },
  { key: "Model", label: "Model" },
  { key: "Type", label: "Type" },
  { key: "Date", label: "Date" },
  { key: "MilesDriven", label: "Miles Driven" },
];

const Dashboard = () => {
  const [totalMilesDriven, setTotalMilesDriven] = useState(0);
  const [frequency, setFrequency] = useState('Daily');
  const [timeFrame, setTimeFrame] = useState({ startDate: null, endDate: null });
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
 
  useEffect(() => {
    const today = new Date();
    setTimeFrame(prevState => ({ ...prevState, endDate: today }));
  }, []); 

  useEffect(() => {
    const fetchData = async () => {
      try {  
        const startDate = timeFrame?.startDate?.toISOString();
        const endDate = timeFrame?.endDate?.toISOString();
    
        const response = await fetch(`http://localhost:5000/data?frequency=${frequency}&startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
          throw new Error('Fetch Failed');
        }
  
        const data = await response.json();
        if (frequency === 'Daily') {
            setDaily(data.groupedData.All);
            setTotalMilesDriven(data.totals.daily);
          } else if (frequency === 'Weekly') {
            setWeekly(data.groupedData);
            setTotalMilesDriven(data.totals.weekly);
          } else if (frequency === 'Monthly') {
            setMonthly(data.groupedData);
            setTotalMilesDriven(data.totals.monthly);
          } else if (frequency === 'Yearly') {
            setYearly(data.groupedData);
            setTotalMilesDriven(data.totals.yearly);
          }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [frequency, timeFrame]);

  const getTotalMiles = (items) => {
    return items.reduce((total, item) => total + item.MilesDriven, 0);
  };
  
  const handleFrequencyChange = (e) => {
    setFrequency(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setTimeFrame({ ...timeFrame, startDate: new Date(e.target.value) });
  };

  const handleEndDateChange = (e) => {
    setTimeFrame({ ...timeFrame, endDate: new Date(e.target.value) });
  };

  return (
    <div className="mx-auto p-4 flex flex-col text-black -mt-60">
      <div className="flex flex-col lg:flex-row lg:justify-between mb-4">
        <div className="flex flex-col lg:flex-row items-center lg:mr-4 mb-2 lg:mb-0">
          <label htmlFor="frequency" className="mr-2 font-semibold lg:w-24 lg:text-right">Frequency:</label>
          <select id="frequency" value={frequency} onChange={handleFrequencyChange} className="px-2 py-1 border rounded text-black">
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
        <div className="flex flex-col lg:flex-row items-center lg:mr-4 mb-2 lg:mb-0 text-black">
          <label htmlFor="startDate" className="mr-2 font-semibold lg:w-24 lg:text-right">Start Date:</label>
          <input type="date" id="startDate" value={timeFrame.startDate ? timeFrame.startDate.toISOString().split('T')[0] : ''} onChange={handleStartDateChange} className="px-2 py-1 border rounded" />
        </div>
        <div className="flex flex-col lg:flex-row items-center text-black">
          <label htmlFor="endDate" className="mr-2 font-semibold lg:w-24 lg:text-right">End Date:</label>
          <input type="date" id="endDate" value={timeFrame.endDate ? timeFrame.endDate.toISOString().split('T')[0] : ''} onChange={handleEndDateChange} className="px-2 py-1 border rounded" />
        </div>
      </div>
      {frequency && (
        <div className="overflow-y-auto h-[585px]  bg-gradient-to-r from-orange-800 to-purple-600 rounded-lg opacity-75 transition duration-1000 animate-tilt">
          <table className="table-auto w-full">
            <thead>
              <tr>
                {columns?.map(column => (
                  <th key={column.key} className="px-5 py-3 text-md tracking-widest uppercase text-white">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className='text-black bg-gradient-to-r from-orange-800 to-purple-600 rounded-lg opacity-75 transition duration-1000 animate-tilt'>
              {frequency === 'Daily' && daily?.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white shadow-md hover:shadow-lg"
                >
                  {columns?.map(column => (
                    <td key={column.key} className="border px-6 py-4 text-sm">{item[column.key]}</td>
                  ))}
                </motion.tr>
              ))}
              {frequency !== 'Daily' && Object.entries(frequency === 'Weekly' ? weekly : frequency === 'Monthly' ? monthly : yearly)?.map(([period, items]) => (
                <React.Fragment key={period}>
                  <tr className="bg-white text-black font-bold text-md uppercase mt-4 mb-2">
                    <td colSpan={columns.length}>{frequency === 'Weekly' ? `Week ${period}` : frequency === 'Monthly' ? `Month ${period}` : `Year ${period}`}</td>
                  </tr>
                  {items?.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white shadow-md hover:shadow-lg"
                    >
                      {columns?.map(column => (
                        <td key={column.key} className="border px-6 py-4 text-sm">{item[column.key]}</td>
                      ))}
                    </motion.tr>
                  ))}
                  <tr>
                    <td colSpan={columns.length} className="text-right">
                      <span className="font-semibold uppercase tracking-widest">Miles Driven:</span> {getTotalMiles(items)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="bg-white mt-4 px-6 py-4 text-right text-black">
        <span className="font-semibold uppercase tracking-widest ">Total Miles Driven:</span> {totalMilesDriven}
      </div>
    </div>
  );
};

export default Dashboard;
