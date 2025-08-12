import { createCanvas } from '@napi-rs/canvas';
import { Chart, ChartConfiguration } from 'chart.js';
import { format } from 'date-fns';
import { Logger } from '../utils/logger';
import { ensureFontsLoaded, DEFAULT_FONT_FAMILY } from './fonts';

interface ChartData {
  times: string[];
  values: number[];
}

export class ChartService {
  async generateMVRVChart(data: ChartData): Promise<Buffer> {
    try {
      Logger.info('Generating MVRV chart with data', {
        numberOfPoints: data.times.length,
        firstDate: data.times[0],
        lastDate: data.times[data.times.length - 1],
        dateRange: `${Math.round((new Date(data.times[data.times.length - 1]).getTime() - 
                                 new Date(data.times[0]).getTime()) / (1000 * 60 * 60 * 24))} days`
      });

      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Import Chart.js v3 with configuration
      const { Chart: ChartJS } = await import('./chart-config');

      // Ensure fonts are available in serverless envs (Vercel)
      await ensureFontsLoaded();
      
      // Create background gradients with more vibrant colors
      const redZoneGradient = ctx.createLinearGradient(0, 0, 0, height);
      redZoneGradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');  // More vibrant red
      redZoneGradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');

      const orangeZoneGradient = ctx.createLinearGradient(0, 0, 0, height);
      orangeZoneGradient.addColorStop(0, 'rgba(255, 140, 0, 0.2)');  // More vibrant orange
      orangeZoneGradient.addColorStop(1, 'rgba(255, 140, 0, 0.2)');

      const yellowZoneGradient = ctx.createLinearGradient(0, 0, 0, height);
      yellowZoneGradient.addColorStop(0, 'rgba(255, 255, 0, 0.25)');  // More vibrant yellow
      yellowZoneGradient.addColorStop(1, 'rgba(255, 255, 0, 0.25)');

      const greenZoneGradient = ctx.createLinearGradient(0, 0, 0, height);
      greenZoneGradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');  // More vibrant green
      greenZoneGradient.addColorStop(1, 'rgba(0, 255, 0, 0.2)');

      // Set pure white background with 100% opacity
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      const configuration: ChartConfiguration = {
        type: 'line',
        data: {
          labels: data.times.map(time => format(new Date(time), 'dd/MM')),
          datasets: [
            // MVRV line first (will be drawn on top)
            {
              label: 'MVRV',
              data: data.values,
              borderColor: 'rgb(0, 150, 255)',  // More vibrant blue
              borderWidth: 2.5,  // Slightly thicker line
              tension: 0.4,
              pointRadius: 0,
              fill: false,
              yAxisID: 'y'
            },
            // Background datasets for zones
            {
              label: 'Red Zone (>3.5)',
              data: Array(data.times.length).fill(4),
              backgroundColor: redZoneGradient,
              borderColor: 'transparent',
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'Orange Zone (3.0-3.5)',
              data: Array(data.times.length).fill(3.5),
              backgroundColor: orangeZoneGradient,
              borderColor: 'transparent',
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'Yellow Zone (1.0-3.0)',
              data: Array(data.times.length).fill(3.0),
              backgroundColor: yellowZoneGradient,
              borderColor: 'transparent',
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'Green Zone (<1.0)',
              data: Array(data.times.length).fill(1.0),
              backgroundColor: greenZoneGradient,
              borderColor: 'transparent',
              fill: true,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 30,
              bottom: 20
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Bitcoin MVRV - Últimos 180 dias',
              font: {
                size: 20,
                family: DEFAULT_FONT_FAMILY,
                weight: 'bold'
              },
              color: '#000000',  // Pure black for text
              padding: 20
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  family: DEFAULT_FONT_FAMILY,
                  weight: 'bold'
                },
                color: '#000000'  // Pure black for text
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: DEFAULT_FONT_FAMILY,
                  size: 10,
                  weight: 'bold'
                },
                color: '#000000',  // Pure black for text
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false,
                callback: function(val, index) {
                  const date = new Date(data.times[index]);
                  
                  // Show only first day of each month
                  return date.getDate() === 1 ? format(date, 'MMM') : '';
                }
              }
            }
          }
        }
      };

      // Create chart with proper context
      new ChartJS(ctx as any, configuration);

      const buffer = canvas.toBuffer('image/png');
      Logger.info('Chart generated successfully');
      return buffer;
    } catch (error) {
      Logger.error('Failed to generate chart', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
} 