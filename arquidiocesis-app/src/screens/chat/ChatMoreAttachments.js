import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import ChatChannelAttachment from '../../components/chat/ChatChannelAttachment';
import { NavigationProps } from '../../navigation/NavigationPropTypes';

function ChatMoreAttachments({ route }) {
  const { attachments } = route.params;
  const [screenWidth, setScreenWidth] = useState(500);

  const onMeasure = (e) => {
    setScreenWidth(e.nativeEvent.layout.width);
  };

  return (
    <ScrollView style={styles.root}>
      <View style={styles.attachmentContainer} onLayout={onMeasure}>
        {attachments.map((attachment, idx) => (
          <ChatChannelAttachment
            key={idx}
            attachment={attachment}
            size={screenWidth / 3 - 16}
          />
        ))}
      </View>
    </ScrollView>
  );
}

ChatMoreAttachments.propTypes = {
  ...NavigationProps,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  attachmentContainer: {
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
});

export default React.memo(ChatMoreAttachments);
