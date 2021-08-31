import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { List } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * @param {{
 *  leftIcon: string | undefined,
 *  onPress: (stillLoad: (doLoad: boolean) => void) => void
 * }} props
 */
export default (props) => {
  const { leftIcon } = props;
  const [loading, setLoading] = useState(false);

  const press = () => {
    if (!props.onPress) return;
    props.onPress(function (d) {
      setLoading(d);
    });
  };

  return (
    <TouchableOpacity onPress={press}>
      <View style={[styles.item, props.style]}>
        {leftIcon ? (
          <List.Icon style={styles.leftIcon} icon={leftIcon} />
        ) : null}
        <Text style={styles.itemText}>{props.text}</Text>
        {props.loading || loading ? (
          <ActivityIndicator size="small" style={{ marginRight: 30 }} />
        ) : (
          <FontAwesome5 name="chevron-right" style={styles.chevron} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemText: {
    fontSize: 16,
  },
  item: {
    paddingLeft: 15,
    paddingVertical: 15,
    width: '100%',
    borderBottomColor: '#CCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  chevron: {
    marginLeft: 'auto',
    marginRight: 30,
    color: 'gray',
    fontSize: 15,
  },
  leftIcon: {
    height: '16px',
  },
});
