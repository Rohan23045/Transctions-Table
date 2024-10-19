import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchBarChartData();
  }, [selectedMonth]);

  const fetchBarChartData = async () => {
    const { data } = await axios.get(`/api/bar-chart`, { params: { month: selectedMonth } });
    const labels = data.map(item => item.range);
    const counts = data.map(item => item.count);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Price Ranges',
          data: counts,
          backgroundColor: 'rgba(75,192,192,0.4)',
        },
      ],
    });
  };

  return <Bar data={chartData} />;
};

export default BarChart;
