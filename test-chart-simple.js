const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');

// Mock data for testing
const mockData = {
  times: [
    '2024-01-01', '2024-01-15', '2024-02-01', '2024-02-15',
    '2024-03-01', '2024-03-15', '2024-04-01', '2024-04-15',
    '2024-05-01', '2024-05-15', '2024-06-01', '2024-06-15'
  ],
  values: [2.1, 2.3, 2.8, 3.1, 3.4, 3.2, 2.9, 2.7, 2.4, 2.1, 1.8, 1.9]
};

async function testSimpleChart() {
  try {
    console.log('Creating simple chart test...');
    
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Bitcoin MVRV - Teste Simples', width / 2, 30);
    
    // Draw zones
    const zoneHeight = height / 4;
    
    // Red zone (top)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, zoneHeight);
    
    // Orange zone
    ctx.fillStyle = 'rgba(255, 140, 0, 0.2)';
    ctx.fillRect(0, zoneHeight, width, zoneHeight);
    
    // Yellow zone
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.fillRect(0, zoneHeight * 2, width, zoneHeight);
    
    // Green zone (bottom)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.fillRect(0, zoneHeight * 3, width, zoneHeight);
    
    // Draw MVRV line
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const stepX = width / (mockData.values.length - 1);
    const maxValue = Math.max(...mockData.values);
    const minValue = Math.min(...mockData.values);
    const valueRange = maxValue - minValue;
    
    mockData.values.forEach((value, index) => {
      const x = index * stepX;
      const y = height - ((value - minValue) / valueRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('test-simple-chart.png', buffer);
    
    console.log('Simple chart test completed! Check test-simple-chart.png');
    
  } catch (error) {
    console.error('Error in simple chart test:', error);
  }
}

testSimpleChart(); 