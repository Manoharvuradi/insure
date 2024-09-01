// PieChart.js
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ data, labels, width, height }: any) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup function to destroy the previous chart when the component unmounts
    let prevChart: any = null;

    // Create a new chart
    const ctx = chartRef.current.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 205, 86, 0.7)",
              // Add more colors as needed
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // This allows you to control the aspect ratio of the chart
      },
    });

    // Save the current chart instance
    chartRef.current = newChart;

    // Cleanup function to destroy the previous chart when the component unmounts or is updated

    if (prevChart) {
      prevChart.destroy();
    }
  }, [data, labels, width, height]);

  return <canvas ref={chartRef} width={width} height={height} />;
};

export default PieChart;
