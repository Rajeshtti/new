const express = require('express');
const bodyParser = require('body-parser');
const { ET_Client } = require('salesforce-marketing-cloud');

const app = express();
app.use(bodyParser.json());

// Environment variables
const {
  SFMC_CLIENT_ID,
  SFMC_CLIENT_SECRET,
  SFMC_AUTH_URL,
  SFMC_SOAP_URL,
  SFMC_REST_URL,
  AUTH_TOKEN
} = process.env;

// Initialize SFMC client
const client = new ET_Client(
  SFMC_CLIENT_ID,
  SFMC_CLIENT_SECRET,
  SFMC_AUTH_URL,
  { 
    origin: SFMC_REST_URL, 
    authOrigin: SFMC_AUTH_URL, 
    soapOrigin: SFMC_SOAP_URL 
  }
);

// Endpoint for DOI Verification update
app.post('/update-doi-status', async (req, res) => {
  try {
    // Authentication check
    if (req.headers.authorization !== `Bearer ${AUTH_TOKEN}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get data from payload
    const { subscriberKey, uniqueId } = req.body;

    if (!subscriberKey || !uniqueId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both subscriberKey and uniqueId are required' 
      });
    }

    // Update Data Extension
    const deName = 'DOI Verification email_MyRyobi';
    const result = await updateVerificationStatus(subscriberKey, uniqueId, deName);

    res.status(200).json({
      success: true,
      message: 'DOI Verification status updated to unverified',
      result
    });
  } catch (error) {
    console.error('Error updating DOI Verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update DOI Verification',
      error: error.message
    });
  }
});

// Function to update verification status
async function updateVerificationStatus(subscriberKey, uniqueId, deName) {
  const deRow = {
    keys: { 
      SubscriberKey: subscriberKey,
      UniqueId: uniqueId
    },
    values: { 
      VerificationStatus: 'unverified',
      ModifiedDate: new Date().toISOString()
    }
  };

  const response = await client.dataExtensionRow.update({ Name: deName }, [deRow]);
  
  if (response.results[0].StatusCode !== 'OK') {
    throw new Error(response.results[0].StatusMessage);
  }

  return response.results[0];
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
