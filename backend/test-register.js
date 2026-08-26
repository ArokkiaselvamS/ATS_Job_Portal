const FormData = require('form-data');
const axios = require('axios');

const form = new FormData();
form.append('companyName', 'Test Company');
form.append('officialEmail', 'test4@testcompany.com');
form.append('password', 'TestPass123!');
form.append('industry', 'Technology & Software');
form.append('companySize', '11-50 employees');
form.append('foundedYear', '2020');
form.append('website', 'https://testcompany.com');
form.append('description', 'This is a test company description that is long enough to meet the minimum requirements.');
form.append('country', 'United States');
form.append('state', 'California');
form.append('city', 'San Francisco');
form.append('address', '123 Test Street');
form.append('contactName', 'John Doe');
form.append('designation', 'CEO');
form.append('contactPhone', '+15551234567');
form.append('contactEmail', 'contact4@testcompany.com');

console.log('Headers:', form.getHeaders());

axios.post('http://localhost:5000/api/company/register', form, {
  headers: form.getHeaders()
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response data:', response.data);
})
.catch(error => {
  console.error('Error:', error.response?.data || error.message);
});