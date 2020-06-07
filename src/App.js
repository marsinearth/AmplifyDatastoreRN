import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Button, InputItem} from '@ant-design/react-native';
import React, {useEffect, useState} from 'react';

import {ColorPicker} from 'react-native-color-picker';
import {DataStore} from '@aws-amplify/datastore';
import {Message} from './models';

const initialState = {color: '#000000', title: ''};

const MessageItem = ({item, onDelete}) => (
  <View style={[styles.messageStyle, {backgroundColor: item.color}]}>
    <View style={styles.messageBg}>
      <Text style={styles.messageTitle}>{item.title}</Text>
      <Button type="warning" onPress={() => onDelete(item.id)}>
        Delete
      </Button>
    </View>
  </View>
);

const App = () => {
  const [formState, updateFormState] = useState(initialState);
  const [messages, updateMessages] = useState([]);
  const [showPicker, updateShowPicker] = useState(false);

  const onChange = title => {
    updateFormState({...formState, title});
  };

  const onChangeColor = color => {
    updateFormState({...formState, color});
  };

  const fetchMessages = async () => {
    const ms = await DataStore.query(Message);
    updateMessages(ms);
  };

  const createMessage = async () => {
    if (!formState.title) {
      return;
    }
    await DataStore.save(new Message({...formState}));
    updateFormState(initialState);
    fetchMessages();
  };

  const deleteMessage = async id => {
    const [{title}] = await DataStore.delete(Message, m => m.id('eq', id));
    Alert.alert('Deleted', `${title} has been deleted successfully.`);
  };

  useEffect(() => {
    fetchMessages();
    const subscription = DataStore.observe(Message).subscribe(() =>
      fetchMessages(),
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>Real Time Message Board</Text>
        <InputItem
          value={formState.title}
          onChange={onChange}
          placeholder="Message Title"
          style={styles.input}
        />
        <View>
          <Button
            onPress={() => updateShowPicker(!showPicker)}
            style={styles.button}>
            Toggle Color Picker
          </Button>
          <View>
            <Text>
              Color:
              <Text
                style={{
                  fontWeight: 'bold',
                  color: formState.color,
                }}>
                {formState.color}
              </Text>
            </Text>
          </View>
          {!!showPicker && (
            <ColorPicker
              style={{height: 300}}
              onColorSelected={onChangeColor}
            />
          )}
          <Button type="primary" onPress={createMessage}>
            Create Message
          </Button>
        </View>
      </View>
      <FlatList
        data={messages}
        keyExtractor={({id}) => id}
        renderItem={({item}) => (
          <MessageItem item={item} onDelete={deleteMessage} />
        )}
        contentContainerStyle={styles.flatListContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 40,
    maxWidth: 900,
    flex: 1,
  },
  innerContainer: {
    flexGrow: 0,
  },
  flatListContentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginBottom: 10,
  },
  heading: {
    fontWeight: 'normal',
    fontSize: 24,
  },
  messageBg: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  messageStyle: {
    padding: 20,
    marginTop: 7,
    borderRadius: 4,
  },
  messageTitle: {
    margin: 0,
    padding: 9,
    fontSize: 20,
  },
  color: {
    fontWeight: 'bold',
  },
});

export default App;
