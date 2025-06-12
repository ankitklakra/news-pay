import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Convert data to CSV format
    const csvRows = [
      ['Author Payouts Report'],
      ['Total Articles:', data.totalArticles],
      ['Total Payout:', `$${data.totalPayout}`],
      [], // Empty row for spacing
      ['Author', 'Articles Count', 'Payout'], // Headers
      ...data.rows.map(item => [
        item.author,
        item.articlesCount.toString(),
        `$${item.payout}`
      ])
    ];

    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'payouts_for_sheets.csv');
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Open Google Sheets in a new tab
    const sheetsUrl = 'https://sheets.google.com/create';
    
    return NextResponse.json({ 
      success: true, 
      sheetsUrl
    });
  } catch (error) {
    console.error('Error preparing data for Google Sheets:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 