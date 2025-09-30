import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Warning,
  CheckCircle,
  ExpandMore,
  Upload,
  Person,
  AccountBalance,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface DashboardStats {
  total_transactions: number;
  fraud_transactions: number;
  pending_alerts?: number;
  fraud_rate: number;
  model_status: string;
}

interface Transaction {
  id: number;
  transaction_id?: number;
  amount: number;
  user_id?: string;
  merchant_id?: string;
  merchant?: string;
  is_fraud: boolean;
  fraud_score: number;
  timestamp: string;
  transaction_type?: string;
  risk_level?: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Transaction | null>(null);

  // New state for enhanced features
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customMerchant, setCustomMerchant] = useState('');
  const [customTransactionType, setCustomTransactionType] = useState('UPI');
  const [bulkTransactions, setBulkTransactions] = useState<any[]>([]);
  const [bulkResults, setBulkResults] = useState<any[]>([]);

  // Settings state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  // Updated API URL to match our working backend
  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedHighContrast = localStorage.getItem('highContrast');
    
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
    
    if (savedHighContrast !== null) {
      setIsHighContrast(JSON.parse(savedHighContrast));
    }
  }, []);

  // Apply dark mode theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, [isDarkMode]);

  // Apply high contrast
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.style.filter = 'contrast(150%)';
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.style.filter = 'none';
    }
  }, [isHighContrast]);

  // Handle Dark Mode toggle
  const handleDarkModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    console.log(`Dark Mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Handle High Contrast toggle
  const handleHighContrastToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsHighContrast(newValue);
    localStorage.setItem('highContrast', JSON.stringify(newValue));
    console.log(`High Contrast ${newValue ? 'enabled' : 'disabled'}`);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/api/stats`);
      const statsData = await statsResponse.json();

      // Add missing fields with defaults
      const enhancedStats = {
        ...statsData,
        pending_alerts: statsData.recent_alerts || 0,
        fraud_rate: statsData.fraud_rate || 0
      };

      setStats(enhancedStats);
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch dashboard data: ${err}`);
      setLoading(false);
    }
  };

  const generateSampleData = async () => {
    try {
      // Test with a high-value transaction to trigger fraud detection
      await testFraudDetection(15000, "Luxury Store Sample");
      fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to generate sample data');
    }
  };

  const testFraudDetection = async (amount: number, merchant: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          merchant: merchant,
          card_type: 'credit'
        })
      });

      const result = await response.json();

      // Convert result to Transaction interface
      const transaction: Transaction = {
        id: result.transaction_id || Date.now(),
        transaction_id: result.transaction_id,
        amount: result.amount,
        merchant: result.merchant || merchant,
        is_fraud: result.is_fraud,
        fraud_score: result.fraud_score,
        risk_level: result.risk_level,
        timestamp: new Date().toISOString(),
        transaction_type: 'credit_card'
      };

      setTestResult(transaction);
    } catch (err) {
      setError(`Failed to test fraud detection: ${err}`);
    }
  };

  // New function for custom transaction testing
  const testCustomTransaction = async () => {
    if (!customAmount || !customMerchant) {
      setError('Please enter both amount and merchant');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(customAmount),
          merchant: customMerchant,
          transaction_type: customTransactionType
        })
      });

      const result = await response.json();

      const transaction: Transaction = {
        id: Date.now(),
        transaction_id: result.transaction_id,
        amount: result.amount,
        merchant: result.merchant,
        is_fraud: result.is_fraud,
        fraud_score: result.fraud_score,
        risk_level: result.risk_level,
        timestamp: new Date().toISOString(),
        transaction_type: customTransactionType
      };

      setTestResult(transaction);
      setCustomDialogOpen(false);
      setCustomAmount('');
      setCustomMerchant('');
    } catch (err) {
      setError(`Failed to test custom transaction: ${err}`);
    }
  };

  // New function for bulk transaction processing
  const processBulkTransactions = async () => {
    if (bulkTransactions.length === 0) {
      setError('Please add transactions to process');
      return;
    }

    const results = [];
    for (const transaction of bulkTransactions) {
      try {
        const response = await fetch(`${API_BASE}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });

        const result = await response.json();
        results.push({
          ...transaction,
          ...result,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        results.push({
          ...transaction,
          error: `Failed to process: ${err}`,
          is_fraud: false,
          fraud_score: 0
        });
      }
    }

    setBulkResults(results);
  };

  // Add sample bulk transactions
  const addSampleBulkTransactions = () => {
    const samples = [
      { amount: 100, merchant: "Amazon", transaction_type: "UPI" },
      { amount: 50000, merchant: "Suspicious Store", transaction_type: "UPI" },
      { amount: 25, merchant: "Coffee Shop", transaction_type: "UPI" },
      { amount: 150000, merchant: "Luxury Cars", transaction_type: "UPI" },
      { amount: 500, merchant: "Grocery Store", transaction_type: "UPI" }
    ];
    setBulkTransactions(samples);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          🛡️ Fraud Detection Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Real-time AI-powered fraud monitoring for financial transactions
        </Typography>
      </Box>

      {/* Enhanced Action Buttons */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => testFraudDetection(15000, "Luxury Store")}
                color="error"
                startIcon={<Warning />}
              >
                Test High-Risk ($15,000)
              </Button>
              <Button
                variant="contained"
                onClick={() => testFraudDetection(50, "Coffee Shop")}
                color="success"
                startIcon={<CheckCircle />}
              >
                Test Normal ($50)
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCustomDialogOpen(true)}
                startIcon={<Person />}
              >
                Custom Transaction
              </Button>
              <Button
                variant="outlined"
                onClick={() => setBulkDialogOpen(true)}
                startIcon={<AccountBalance />}
              >
                Bulk Checker
              </Button>
              <Button
                variant="outlined"
                onClick={fetchDashboardData}
              >
                Refresh Data
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats?.total_transactions || 0}</Typography>
                  <Typography color="text.secondary">Total Transactions</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning color="error" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats?.fraud_transactions || 0}</Typography>
                  <Typography color="text.secondary">Fraud Detected</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Security color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats?.pending_alerts || 0}</Typography>
                  <Typography color="text.secondary">Pending Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats?.fraud_rate || 0}%</Typography>
                  <Typography color="text.secondary">Fraud Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Transactions
            </Typography>

            {recentTransactions.length === 0 && !testResult ? (
              <Alert severity="info">
                No transactions found. Generate some sample data to get started!
              </Alert>
            ) : (
              <Box>
                {/* Show test result if available */}
                {testResult && (
                  <Card sx={{ mb: 2, border: '2px solid', borderColor: testResult.is_fraud ? 'error.main' : 'success.main' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Latest Test Result</Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="h6">
                            ${testResult.amount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testResult.merchant || testResult.transaction_type || 'Unknown'}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Typography variant="body1">
                            {testResult.user_id || 'Test User'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            User ID
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Chip
                            label={testResult.is_fraud ? 'FRAUD' : 'LEGITIMATE'}
                            color={testResult.is_fraud ? 'error' : 'success'}
                            variant={testResult.is_fraud ? 'filled' : 'outlined'}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Score: {(testResult.fraud_score * 100).toFixed(1)}%
                            {testResult.risk_level && ` (${testResult.risk_level})`}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(testResult.timestamp).toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Show regular transactions */}
                {recentTransactions.map((transaction) => (
                  <Card key={transaction.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="h6">
                            ${transaction.amount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.transaction_type || 'Transaction'}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Typography variant="body1">
                            {transaction.user_id || `ID: ${transaction.id}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            User ID
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Chip
                            label={transaction.is_fraud ? 'FRAUD' : 'LEGITIMATE'}
                            color={transaction.is_fraud ? 'error' : 'success'}
                            variant={transaction.is_fraud ? 'filled' : 'outlined'}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Score: {(transaction.fraud_score * 100).toFixed(1)}%
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* System Status */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              System Status
            </Typography>
            <Alert severity="success">
              ✅ Backend API: Connected to {API_BASE}
            </Alert>
            <Alert severity="info" sx={{ mt: 1 }}>
              🤖 ML Model: {stats?.model_status === 'active' ? 'Production RandomForest model loaded' : 'Using fallback rules'}
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Settings Section - NEW ADDITION */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box mb={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Settings
                </Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
                Configure your FraudGuard Pro preferences
              </Typography>
            </Box>

            {/* Appearance Section */}
            <Box mb={3}>
              <Typography variant="h6" component="h3" gutterBottom>
                ⚫ Appearance
              </Typography>
              
              <Divider sx={{ mb: 3 }} />

              {/* Dark Mode Setting */}
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" component="h4">
                      Dark Mode
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toggle between light and dark themes
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isDarkMode}
                        onChange={handleDarkModeToggle}
                        name="darkMode"
                        color="primary"
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* High Contrast Setting */}
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" component="h4">
                      High Contrast
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Increase contrast for better visibility
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isHighContrast}
                        onChange={handleHighContrastToggle}
                        name="highContrast"
                        color="primary"
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>
              </Box>

              {/* Status Display */}
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Settings are automatically saved and will persist across browser sessions
              </Alert>

              <Box mt={2} p={2} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Settings Status:
                </Typography>
                <Typography variant="body2">
                  🌙 Dark Mode: {isDarkMode ? 'Enabled' : 'Disabled'}
                </Typography>
                <Typography variant="body2">
                  🔆 High Contrast: {isHighContrast ? 'Enabled' : 'Disabled'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Custom Transaction Dialog */}
      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Person sx={{ mr: 1 }} />
            Custom Transaction Test
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="e.g., 5000"
            />
            <TextField
              fullWidth
              label="Merchant/Recipient"
              value={customMerchant}
              onChange={(e) => setCustomMerchant(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="e.g., Amazon, Grocery Store"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={customTransactionType}
                onChange={(e) => setCustomTransactionType(e.target.value)}
                label="Transaction Type"
              >
                <MenuItem value="UPI">UPI Transfer</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
                <MenuItem value="net_banking">Net Banking</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              💡 Test with real amounts you would transfer. Our AI model will analyze the transaction pattern.      
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
          <Button onClick={testCustomTransaction} variant="contained">Test Transaction</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Transaction Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AccountBalance sx={{ mr: 1 }} />
            Bulk Transaction Checker (Bank Feature)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              🏦 Banks can upload transaction batches to check for potential fraud patterns
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={addSampleBulkTransactions}
                startIcon={<Upload />}
                sx={{ mr: 2 }}
              >
                Add Sample Transactions
              </Button>
              <Button
                variant="contained"
                onClick={processBulkTransactions}
                disabled={bulkTransactions.length === 0}
              >
                Analyze All Transactions
              </Button>
            </Box>

            {bulkTransactions.length > 0 && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Transactions to Process ({bulkTransactions.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Amount</TableCell>
                          <TableCell>Merchant</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bulkTransactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>₹{transaction.amount}</TableCell>
                            <TableCell>{transaction.merchant}</TableCell>
                            <TableCell>{transaction.transaction_type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}

            {bulkResults.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Analysis Results ({bulkResults.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Amount</TableCell>
                          <TableCell>Merchant</TableCell>
                          <TableCell>Risk Level</TableCell>
                          <TableCell>Fraud Score</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bulkResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell>₹{result.amount}</TableCell>
                            <TableCell>{result.merchant}</TableCell>
                            <TableCell>
                              <Chip
                                label={result.risk_level || 'UNKNOWN'}
                                color={result.risk_level === 'HIGH' ? 'error' : 'success'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{(result.fraud_score * 100).toFixed(1)}%</TableCell>
                            <TableCell>
                              <Chip
                                label={result.is_fraud ? 'SUSPICIOUS' : 'LEGITIMATE'}
                                color={result.is_fraud ? 'error' : 'success'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
