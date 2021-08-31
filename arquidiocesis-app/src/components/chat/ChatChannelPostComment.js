import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

function ChatChannelPostComment({ comment }) {
  return (
    <View style={styles.root}>
      <Text style={styles.authorLabel}>{comment.authorName}</Text>

      <View style={styles.bubble}>
        <Text style={styles.content}>{comment.content}</Text>
        <Text style={styles.dateLabel}>{comment.date.toLocaleString()}</Text>
      </View>
    </View>
  );
}

ChatChannelPostComment.propTypes = {
  comment: PropTypes.shape({
    authorName: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
  }),
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  authorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  bubble: {
    backgroundColor: '#E7E7E7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateLabel: {
    fontSize: 11,
    color: 'gray',
    marginTop: 2,
  },
});

export default React.memo(ChatChannelPostComment);
