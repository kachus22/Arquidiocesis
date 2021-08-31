import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ChatChannelPost from '../../components/chat/ChatChannelPost';
import { NavigationProps } from '../../navigation/NavigationPropTypes';
import { FontAwesome5 } from '@expo/vector-icons';
import { useChannelPostsStore } from '../../context/ChannelPostsStore';
import Alert from '../../components/Alert';
import PostsAPI from '../../lib/apiV2/PostsAPI';
import PostCommentsAPI from '../../lib/apiV2/PostCommentsAPI';
import useCurrentUser from '../../lib/apiV2/useCurrentUser';
import { LoadingView } from '../../components';

function ChatChannelPostDetails({ navigation, route }) {
  const { channelName, id } = route.params;
  const postIndex = route.params.postIndex ?? 0;
  const [inputHeight, setInputHeight] = useState();
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts, editingPostIndex] = useChannelPostsStore();
  const post = posts[postIndex];
  const user = useCurrentUser();

  useEffect(() => {
    (async () => {
      if (id != null) {
        const res = await PostsAPI.getOne(id);
        if (!res.error) {
          setPosts([
            {
              id: res.data.id,
              authorName: `${res.data.authorInfo.nombre} ${
                res.data.authorInfo.apellido_paterno ?? ''
              } ${res.data.authorInfo.apellido_materno ?? ''}`,
              date: new Date(res.data.creation_timestamp._seconds * 1000),
              textContent: res.data.post_text,
              attachments: res.data.post_files,
              commentCount: (res.data.post_comments ?? []).length,
            },
          ]);
        }
      }

      const res = await PostCommentsAPI.getForPost(id ?? post.id);
      if (!res.error) {
        setComments(
          res.data
            .map((comment) => ({
              id: comment.id,
              authorName: `${comment.authorInfo.nombre} ${
                comment.authorInfo.apellido_paterno ?? ''
              } ${comment.authorInfo.apellido_materno ?? ''}`,
              date: new Date(comment.creation_timestamp._seconds * 1000),
              content: comment.comment_text,
            }))
            .sort((first, second) => second.date - first.date)
        );
      }
    })();
  }, []);

  navigation.setOptions({
    headerTitle: channelName ?? 'Publicación',
  });

  const onEditPress = () => {
    editingPostIndex.current = postIndex;
    navigation.navigate('ChatChannelCreatePost', {
      post,
    });
  };

  const onDeletePress = () => {
    Alert.alert('Confirmar', '¿Seguro que deseas borrar esta publicación?', [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: null,
      },
      {
        text: 'Confirmar',
        onPress: async () => {
          const id = id ?? posts[postIndex].id;
          const res = await PostsAPI.remove(id);
          if (!res.error) {
            setPosts((prev) => prev.filter((post) => post.id !== id));
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const onReplyPress = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (text === '') {
      Alert.alert('Llenar comentario', 'Un comentario no puede estar vacío.');
      return;
    }

    setIsSubmitting(true);
    const res = await PostCommentsAPI.add({
      authorID: user.id,
      postID: post.id,
      text,
    });
    if (!res.error) {
      setComments((prev) => [
        {
          id: res.data,
          authorName:
            `${user.nombre} ${user.apellido_paterno} ` +
            (user.apellido_materno ?? ''),
          date: new Date(),
          content: text,
        },
        ...prev,
      ]);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, commentCount: p.commentCount + 1 } : p
        )
      );
      setIsSubmitting(false);
    }
    setText('');
  }, [user, text, isSubmitting]);

  if (post == null) {
    return <LoadingView />;
  }

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingBottom: 60 }}>
        <ChatChannelPost
          post={post}
          showComments={true}
          comments={comments}
          onEditPress={onEditPress}
          onDeletePress={onDeletePress}
        />
      </ScrollView>
      <View style={styles.replyContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { minHeight: inputHeight }]}
            placeholder="Escribir mensaje..."
            multiline
            onContentSizeChange={(event) =>
              setInputHeight(event.nativeEvent.contentSize.height)
            }
            value={text}
            onChangeText={setText}
          />
        </View>
        <TouchableOpacity style={styles.iconContainer} onPress={onReplyPress}>
          <FontAwesome5 name="reply" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
}

ChatChannelPostDetails.propTypes = {
  ...NavigationProps,
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#EDEDED',
    paddingTop: 10,
    flex: 1,
  },
  replyContainer: {
    flexDirection: 'row',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#D6D6D6',
    alignItems: 'flex-end',
  },
  input: {
    outlineWidth: 0,
  },
  inputContainer: {
    backgroundColor: '#E7E7E7',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#002E60',
    borderRadius: 19,
    width: 38,
    height: 38,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

export default React.memo(ChatChannelPostDetails);
