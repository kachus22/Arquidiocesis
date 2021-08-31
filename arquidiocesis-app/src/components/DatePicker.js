import React, { useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Input from './Input';
import DatePicker from '@react-native-community/datetimepicker';
import moment from 'moment/min/moment-with-locales';

export default (props) => {
  const pickerRef = useRef(null);

  const formatDate = (a) => {
    const f = moment(a, 'YYYY-MM-DD').format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  const mobilePicker = () => {
    return (
      <View>
        <Input
          value={formatDate(props.date)}
          name={props.name}
          readonly
          onPress={pressInput}
        />
        <DatePicker
          ref={pickerRef}
          date={props.date}
          mode="date"
          format="YYYY-MM-DD"
          confirmBtnText="Confirmar"
          cancelBtnText="Cancelar"
          customStyles={{
            dateIcon: { display: 'none' },
            dateInput: { display: 'none' },
          }}
          locale={'es'}
          onDateChange={props.onDateChange}
        />
      </View>
    );
  };

  const webPicker = () => {
    return (
      <View style={{ marginBottom: 10, width: '100%' }}>
        <Text style={styles.label}>
          {props.name || 'Input'}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <input
          type="date"
          onChange={webChange}
          ref={pickerRef}
          value={props.date}
          pattern={'d{4}-d{2}-d{2}'}
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
            backgroundColor: '#FDFDFD',
            height: 45,
            fontSize: 20,
            borderRadius: 4,
            border: 0,
            borderColor: '#CCC',
            borderStyle: 'solid',
            width: '100%',
            borderWidth: StyleSheet.hairlineWidth,
          }}
        />
      </View>
    );
  };

  const datePicker = () => {
    return Platform.select({
      ios: mobilePicker(),
      android: mobilePicker(),
      web: webPicker(),
    });
  };

  const pressInput = () => {
    pickerRef.current.onPressDate();
  };

  const webChange = (v) => {
    if (props.onDateChange) props.onDateChange(v.target.value);
  };

  const required =
    typeof props.required !== 'undefined' && props.required !== false;

  return Platform.select({
    ios: mobilePicker(),
    android: mobilePicker(),
    web: datePicker(),
  });
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'grey',
    fontWeight: '500',
  },
  required: {
    color: '#c42727',
    fontWeight: 'bold',
  },
});
