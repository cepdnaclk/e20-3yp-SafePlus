import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const screenWidth = Dimensions.get('window').width;

export default function GraphCard({ title, data }) {
  const graphLineColor = '#5c4b1e';
  const pointWidth = 60;
  const chartWidth = Math.max(screenWidth, data.labels.length * pointWidth);
  const scrollRef = useRef(null);
  console.log('RAW LABELS:', data.labels);
  // Parse date and time from each label (assuming label is hourWindowStart)
  const parsedLabels = data.labels.map((hourWindowStart, idx) => {
    const dt = dayjs(hourWindowStart );
    return {
      idx,
      datetime: dt,
      dateStr: dt.isValid() ? dt.format('YYYY-MM-DD') : '',
      timeStr: dt.isValid() ? dt.format('HH:mm') : hourWindowStart,
    };
  });
  console.log('Parsed labels:', parsedLabels);
  // Find indices where the date changes (for dividers and date labels)
  const dateChangeIndices = [];
  let lastDate = '';
  parsedLabels.forEach((entry, idx) => {
    if (entry.dateStr && entry.dateStr !== lastDate) {
      if (idx !== 0) dateChangeIndices.push(idx);
      lastDate = entry.dateStr;
    }
  });

  // For date labels below x-axis
  const dateLabelSpans = [];
  lastDate = '';
  let startIdx = 0;
  parsedLabels.forEach((entry, idx) => {
    if (entry.dateStr !== lastDate) {
      if (idx !== 0) {
        dateLabelSpans.push({ date: lastDate, start: startIdx, end: idx - 1 });
        startIdx = idx;
      }
      lastDate = entry.dateStr;
    }
    if (idx === parsedLabels.length - 1) {
      dateLabelSpans.push({ date: entry.dateStr, start: startIdx, end: idx });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ x: chartWidth - screenWidth, animated: false });
      }, 0);
    }
  }, [chartWidth]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ flexDirection: 'row', paddingLeft: 4 }}>
        <View style={{ alignItems: 'center', marginRight: 2 }}>
          <Text style={styles.yAxisLabel}>{data.unit || ''}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 24 }}
          ref={scrollRef}
        >
          <View style={{ width: chartWidth }}>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: data.values, color: () => graphLineColor }],
              }}
              width={chartWidth}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: { r: '0' },
                propsForBackgroundLines: {
                  stroke: '#d3d3d3',
                  strokeDasharray: '4',
                },
              }}
              bezier
              withVerticalLabels={false}
              withInnerLines={true}
              yAxisSuffix={data.unit || ''}
              fromZero={true}
              style={{ marginBottom: 0 }}
            />

            {/* Dotted dividers for each new date */}
            {dateChangeIndices.map((idx, i) => (
              <View
                key={`divider-${i}`}
                style={{
                  position: 'absolute',
                  left: idx * pointWidth -0.5,
                  top: 0,
                  height: 180,
                  borderLeftWidth: 1,
                  borderColor: '#5d4b1f',
                  borderStyle: 'dashed',
                  zIndex: 10,
                }}
              />
            ))}

            {/* Rotated x-axis labels */}
            <View style={{ flexDirection: 'row', width: chartWidth, marginTop: 0, alignItems: 'flex-end' }}>
              {parsedLabels.map((entry, idx) => (
                <View key={idx} style={{ width: pointWidth, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      transform: [{ rotate: '-45deg' }],
                      marginTop: -4,
                      width: pointWidth,
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {entry.timeStr}
                  </Text>
                </View>
              ))}
            </View>

            {/* Date labels below x-axis */}
            <View style={{ flexDirection: 'row', width: chartWidth, marginTop: 10 }}>
              {dateLabelSpans.map((span, i) => (
                <View
                  key={`datelabel-${i}`}
                  style={{
                    width: pointWidth * (span.end - span.start + 1),
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.dateLabel}>{span.date}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 12,
    marginVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#555',
    transform: [{ rotate: '-90deg' }],
    width: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: '#444',
    fontWeight: 'bold',
    marginTop: 2,
  },
});