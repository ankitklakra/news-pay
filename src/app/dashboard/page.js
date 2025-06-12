"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import jsPDF from "jspdf";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useDispatch, useSelector } from 'react-redux';
import { fetchGuardianNews } from '@/lib/guardianSlice';

// Update the CustomPieLabel component
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      className="text-foreground"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { articles, loading, error: guardianError } = useSelector((state) => state.guardian);
  const [data, setData] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isExportingToSheets, setIsExportingToSheets] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load saved payout rates from localStorage if available
    const savedRates = JSON.parse(localStorage.getItem("authorPayoutRates") || "{}");

    // Fetch Guardian articles with pageSize=10
    const fetchData = async () => {
      try {
        setError(null);
        await dispatch(fetchGuardianNews({ pageSize: 10 }));
      } catch (error) {
        console.error("Error fetching Guardian data:", error);
        setError("Error fetching data. Please try again later.");
      }
    };

    fetchData();
  }, [dispatch]);

  // Process articles when they are loaded
  useEffect(() => {
    if (articles.length > 0) {
      const savedRates = JSON.parse(localStorage.getItem("authorPayoutRates") || "{}");
      
      // Group articles by author
      const authorGroups = articles.reduce((acc, article) => {
        const author = article.author || "Unknown";
        if (!acc[author]) {
          acc[author] = {
            author,
            articlesCount: 0,
            payoutRate: savedRates[author] || 20, // Default rate of 20 if not set
            payout: 0
          };
        }
        acc[author].articlesCount += 1;
        acc[author].payout = acc[author].articlesCount * acc[author].payoutRate;
        return acc;
      }, {});

      const processedData = Object.values(authorGroups);
      setData(processedData);
      setTotalArticles(articles.length);
      setTotalPayout(processedData.reduce((sum, item) => sum + item.payout, 0));
    }
  }, [articles]);

  const handlePayoutRateChange = (author, newRate) => {
    const rate = newRate === '' ? 0 : parseInt(newRate) || 0;
    
    // Update the data with new rate
    const updatedData = data.map(item => {
      if (item.author === author) {
        return {
          ...item,
          payoutRate: rate,
          payout: item.articlesCount * rate
        };
      }
      return item;
    });
    
    setData(updatedData);
    
    // Update total payout
    setTotalPayout(updatedData.reduce((sum, item) => sum + item.payout, 0));
    
    // Save to localStorage
    const savedRates = JSON.parse(localStorage.getItem("authorPayoutRates") || "{}");
    savedRates[author] = rate;
    localStorage.setItem("authorPayoutRates", JSON.stringify(savedRates));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title and summary
    doc.setFontSize(16);
    doc.text("Author Payouts", 14, 15);
    
    doc.setFontSize(12);
    doc.text(`Total Articles: ${totalArticles}`, 14, 25);
    doc.text(`Total Payout: $${totalPayout}`, 14, 35);

    // Add table headers
    doc.setFontSize(12);
    doc.setFillColor(41, 128, 185);
    doc.rect(14, 45, 50, 10, 'F');
    doc.rect(64, 45, 30, 10, 'F');
    doc.rect(94, 45, 30, 10, 'F');
    doc.rect(124, 45, 30, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.text("Author", 17, 52);
    doc.text("Articles", 67, 52);
    doc.text("Rate", 97, 52);
    doc.text("Payout", 127, 52);

    // Add table content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    data.forEach((item, index) => {
      const y = 55 + (index * 10);
      
      // Draw cell borders
      doc.rect(14, y, 50, 10);
      doc.rect(64, y, 30, 10);
      doc.rect(94, y, 30, 10);
      doc.rect(124, y, 30, 10);
      
      // Add content
      doc.text(item.author.length > 20 ? item.author.substring(0, 17) + '...' : item.author, 17, y + 7);
      doc.text(item.articlesCount.toString(), 67, y + 7);
      doc.text(`$${item.payoutRate}`, 97, y + 7);
      doc.text(`$${item.payout}`, 127, y + 7);
    });

    doc.save("payouts.pdf");
  };

  const exportToCSV = () => {
    // Prepare the data for CSV
    const csvRows = [
      ['Author Payouts Report'],
      ['Total Articles:', totalArticles],
      ['Total Payout:', `$${totalPayout}`],
      [], // Empty row for spacing
      ['Author', 'Articles Count', 'Payout Rate', 'Payout'], // Headers
      ...data.map(item => [
        // Escape author name by wrapping in quotes and handling any existing quotes
        `"${item.author.replace(/"/g, '""')}"`,
        item.articlesCount.toString(),
        `$${item.payoutRate}`,
        `$${item.payout}`
      ])
    ];

    // Convert to CSV string with proper line endings
    const csvContent = csvRows.map(row => row.join(',')).join('\r\n');
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'payouts.csv');
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showPreviewModal = () => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const uploadToGoogleSheets = async () => {
    try {
      setIsExportingToSheets(true);

      // Convert data to CSV format
      const csvRows = [
        ['Author Payouts Report'],
        ['Total Articles:', totalArticles],
        ['Total Payout:', `$${totalPayout}`],
        [], // Empty row for spacing
        ['Author', 'Articles Count', 'Payout'], // Headers
        ...data.map(item => [
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
      window.open('https://sheets.google.com/create', '_blank');
      
      alert('CSV file has been downloaded. Please import it into Google Sheets.');
    } catch (error) {
      console.error('Error preparing data for Google Sheets:', error);
      alert('Error preparing data for Google Sheets. Please try again.');
    } finally {
      setIsExportingToSheets(false);
    }
  };

  // Add this function to determine text color based on background
  const getContrastColor = (index) => {
    const hue = index * 360 / data.length;
    const saturation = 70;
    const lightness = 50;
    // Calculate relative luminance
    const r = Math.cos(hue * Math.PI / 180) * saturation / 100;
    const g = Math.cos((hue + 120) * Math.PI / 180) * saturation / 100;
    const b = Math.cos((hue + 240) * Math.PI / 180) * saturation / 100;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {(error || guardianError) && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
          <p>{error || guardianError}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="mt-4 mb-4 flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={showPreviewModal}
              className="hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
            >
              Preview Export
            </Button>
            <Button 
              variant="secondary" 
              onClick={exportToPDF}
              className="hover:bg-secondary/80 w-full sm:w-auto"
            >
              Export to PDF
            </Button>
            <Button 
              variant="secondary" 
              onClick={exportToCSV}
              className="hover:bg-secondary/80 w-full sm:w-auto"
            >
              Export to CSV
            </Button>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Total Articles: {totalArticles}</p>
              <p>Total Payout: ${totalPayout}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Author Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Author</TableHead>
                      <TableHead className="min-w-[120px] text-center">Articles Count</TableHead>
                      <TableHead className="min-w-[150px] text-center">Payout Rate ($)</TableHead>
                      <TableHead className="min-w-[120px] text-center">Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.author}</TableCell>
                        <TableCell className="text-center">{item.articlesCount}</TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              value={item.payoutRate || ''}
                              onChange={(e) => handlePayoutRateChange(item.author, e.target.value)}
                              placeholder="Set rate"
                              min="0"
                              className="w-24"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">${item.payout}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Payout Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="author" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="payout" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payout Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payout Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            dataKey="payout"
                            nameKey="author"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={CustomPieLabel}
                            labelLine={false}
                          >
                            {data.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`hsl(${index * 360 / data.length}, 70%, 50%)`}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `$${value}`}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-background border rounded shadow p-2">
                                    <p className="font-medium text-foreground">{payload[0].name}</p>
                                    <p className="text-sm text-muted-foreground">Payout: ${payload[0].value}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend 
                            layout="vertical" 
                            align="right"
                            wrapperStyle={{paddingBottom: "15px"}}
                            verticalAlign="middle"
                            formatter={(value) => (
                              <span className="text-sm text-foreground">
                                {value.length > 15 ? value.substring(0, 12) + '...' : value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Article Count Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Article Count by Author</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="author" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="articlesCount" fill="#8884d8" name="Articles" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Payout Rate Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payout Rate Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="author" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value}`} />
                          <Bar dataKey="payoutRate" fill="#82ca9d" name="Rate per Article" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Author Performance (Articles vs Payout) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Author Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="author" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="articlesCount" 
                            stroke="#8884d8" 
                            name="Articles"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="payout" 
                            stroke="#82ca9d" 
                            name="Payout"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Card className="w-1/2 max-h-96 overflow-y-auto">
                <CardHeader>
                  <CardTitle>Preview Export Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Articles: {totalArticles}</p>
                  <p>Total Payout: ${totalPayout}</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Author</TableHead>
                        <TableHead>Articles Count</TableHead>
                        <TableHead>Payout Rate</TableHead>
                        <TableHead>Payout</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>{item.articlesCount}</TableCell>
                          <TableCell>${item.payoutRate}</TableCell>
                          <TableCell>${item.payout}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(false)} 
                    className="mt-4 hover:bg-accent hover:text-accent-foreground"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
} 