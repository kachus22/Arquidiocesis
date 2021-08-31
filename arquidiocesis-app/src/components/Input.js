import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default (props) => {
  const { extraProps } = props;
  const multiline =
    typeof props.multiline !== 'undefined' && props.multiline !== false;
  const readonly = !(
    typeof props.readonly === 'undefined' || props.readonly === false
  );
  const required =
    typeof props.required !== 'undefined' && props.required !== false;

  return (
    <View style={[styles.container, props.style]}>
      {!props.noTextOver ? (
        <Text style={styles.label}>
          {props.name || 'Input'}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      ) : null}

      {!readonly ? (
        <TextInput
          multiline={multiline}
          style={[styles.input, { height: props.height || 45, fontSize: 20 }]}
          placeholder={props.placeholder || props.name}
          value={props.value}
          onChangeText={props.onChangeText}
          textContentType={props.textContentType}
          keyboardType={props.keyboard}
          secureTextEntry={typeof props.password !== 'undefined'}
          {...extraProps}
        />
      ) : (
        <TouchableWithoutFeedback onPress={props.onPress}>
          <View
            style={[
              styles.input,
              {
                justifyContent: 'center',
                height: props.height || 45,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}>
            <Text
              style={[
                {
                  flexGrow: 1,
                  fontSize: 20,
                  color:
                    !props.value || props.value.length === 0 ? 'gray' : 'black',
                },
                props.textStyle,
              ]}>
              {!props.value || props.value.length === 0
                ? props.placeholder && props.placeholder.length > 0
                  ? props.placeholder
                  : props.name
                : props.value}
            </Text>
            {props.icon && (
              <FontAwesome5 name={props.icon} solid size={18} color={'gray'} />
            )}
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FDFDFD',
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderColor: '#CCC',
    borderWidth: StyleSheet.hairlineWidth,
  },
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
