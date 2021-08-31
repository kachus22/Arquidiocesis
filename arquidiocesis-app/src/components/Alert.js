import { Alert, Platform } from 'react-native';

var mobileAlert = (title, message, buttons) => {
  Alert.alert(title, message, buttons);
};

var webAlert = (title, message, buttons) => {
  if (buttons) {
    var a = confirm(title + '\n' + message);
    var c = buttons.find((b) => (a ? b.style != 'cancel' : b.style == 'cancel'));
    if (c && c.onPress) c.onPress();
  } else {
    alert(message);
  }
};

export default {
  alert: Platform.select({
    web: webAlert,
    android: mobileAlert,
    ios: mobileAlert,
  }),
};
