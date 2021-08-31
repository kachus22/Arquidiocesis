import PropTypes from 'prop-types';

export const NavigationPropType = {
  navigate: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  setParams: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  setOptions: PropTypes.func.isRequired,
  isFocused: PropTypes.func.isRequired,
  addListener: PropTypes.func.isRequired,
};

export const NavigationRoutePropType = {
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
};

/*
  Use this object as A COPY, not as a reference.
  For example:
  MyScreen.propTypes = {
    ...NavigationProps,
  };

  Instead of:
  MyScreen.propTypes = NavigationProps;
*/
export const NavigationProps = {
  navigation: PropTypes.shape({ ...NavigationPropType }),
  route: PropTypes.shape({ ...NavigationRoutePropType }),
};
