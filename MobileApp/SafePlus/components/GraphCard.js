import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
const screenWidth = Dimensions.get('window').width;

export default function GraphCard({ title, data, colors, isSafe }) {
  const borderColor = isSafe ? '#80e27e' : '#ef5350'; // Green if safe, Red if unsafe
  const chartLineColor = isSafe ? 'rgba(33, 150, 243, 1)' : 'rgba(239, 83, 80, 1)'; // Blue or Red

  return (
    <View style={[styles.outerBorder, { borderColor }]}>
      <LinearGradient
        colors={isSafe ? ['#d0f0c0', '#a5d6a7'] : ['#ffcdd2', '#ef9a9a']}
        style={styles.card}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: data.labels,
              datasets: [{ data: data.values, color: () => chartLineColor }],
            }}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: chartLineColor,
              },
              propsForBackgroundLines: {
                stroke: '#e3e3e3',
              },
            }}
            bezier
            style={styles.chart}
            formatXLabel={(label) => {
              if (!label) return '';
              return moment(label).format('HH:mm');
          }}
            labelRotation={-45}  // Rotate labels by -45 degrees
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 3,
    borderRadius: 16,
    marginVertical: 12,
    padding: 2,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
  },
  chart: {
    borderRadius: 10,
  },
});
