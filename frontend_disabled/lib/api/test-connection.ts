import { checkApiHealth } from './client';

export async function testConnection() {
  console.log('Testing API connection...');
  const isHealthy = await checkApiHealth();
  
  if (isHealthy) {
    console.log('✅ API is connected and healthy');
    return true;
  } else {
    console.error('❌ API connection failed');
    return false;
  }
}