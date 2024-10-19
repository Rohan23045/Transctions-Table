import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Statistics = ({ selectedMonth }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth]);

  const fetchStatistics = async () => {
    const { data } = await axios.get(`/api/statistics`, { params: { month: selectedMonth } });
    setStats(data);
  };

  return (
    <div>
      <h2>Statistics for {selectedMonth}</h2>
      <p>Total Sales Amount: {stats.totalSaleAmount}</p>
      <p>Total Sold Items: {stats.totalSoldItems}</p>
      <p>Total Not Sold Items: {stats.totalNotSoldItems}</p>
    </div>
  );
};

export default Statistics;
