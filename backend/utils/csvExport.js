// @desc    Export attendance to CSV
exports.exportToCSV = (attendanceData) => {
  const headers = ['Employee Name', 'Employee ID', 'Date', 'Status', 'Check In', 'Check Out', 'Total Hours'];
  
  const rows = attendanceData.map(record => {
    return [
      record.user?.name || 'N/A',
      record.user?.employeeId || 'N/A',
      new Date(record.date).toLocaleDateString(),
      record.status,
      record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
      record.totalHours ? `${record.totalHours}h` : '-'
    ];
  });

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};