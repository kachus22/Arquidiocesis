import * as React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';

function ChatChannelCreatePostOptionRow({
  iconName,
  title,
  onPress,
  hasTopBorder = true,
}) {
  return (
    <TouchableOpacity
      style={[styles.root, { borderTopWidth: hasTopBorder ? 1 : 0 }]}
      onPress={onPress}>
      <FontAwesome5 name={iconName} size={18} solid color="black" />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

ChatChannelCreatePostOptionRow.propTypes = {
  iconName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  hasTopBorder: PropTypes.bool,
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#CBCBCB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 12,
  },
  text: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default React.memo(ChatChannelCreatePostOptionRow);
