import {
  Acompanantes,
  Calendar,
  Capacitaciones,
  Coordinadores,
  Grupos,
  Parroquias,
} from '../screens';

export const PARROQUIAS_TAB_NAME = 'Parroquias';
export const ACOMPANANTES_TAB_NAME = 'Acompañantes';
export const COORDINA_TAB_NAME = 'Coordina';
export const HEMA_TAB_NAME = 'HeMa';
export const CALENDARIO_TAB_NAME = 'Calendario';
export const CAPACITACION_TAB_NAME = 'Capacitación';

const TabScreens = {
  [PARROQUIAS_TAB_NAME]: Parroquias,
  [ACOMPANANTES_TAB_NAME]: Acompanantes,
  [COORDINA_TAB_NAME]: Coordinadores,
  [HEMA_TAB_NAME]: Grupos,
  [CALENDARIO_TAB_NAME]: Calendar,
  [CAPACITACION_TAB_NAME]: Capacitaciones,
};

function filteredTabs(tabNamesToFilter) {
  return Object.keys(TabScreens)
    .filter((key) => tabNamesToFilter.includes(key))
    .reduce((res, key) => {
      res[key] = TabScreens[key];
      return res;
    }, {});
}

export function getTabScreens(userType) {
  if (userType === 'admin' || userType === 'integrante_chm') {
    return TabScreens;
  }

  if (userType === 'coordinador') {
    return filteredTabs([HEMA_TAB_NAME, CALENDARIO_TAB_NAME]);
  }

  if (userType === 'acompañante_zona' || userType === 'acompañante_decanato') {
    return filteredTabs([
      COORDINA_TAB_NAME,
      CALENDARIO_TAB_NAME,
      CAPACITACION_TAB_NAME,
    ]);
  }

  if (userType === 'capacitacion') {
    return filteredTabs([CALENDARIO_TAB_NAME, CAPACITACION_TAB_NAME]);
  }

  return {};
}

export function getTabBarIconName(routeName) {
  let iconName;
  switch (routeName) {
    case PARROQUIAS_TAB_NAME:
      iconName = 'church';
      break;
    case ACOMPANANTES_TAB_NAME:
      iconName = 'globe-americas';
      break;
    case COORDINA_TAB_NAME:
      iconName = 'user-circle';
      break;
    case HEMA_TAB_NAME:
      iconName = 'users';
      break;
    case CALENDARIO_TAB_NAME:
      iconName = 'calendar';
      break;
    case CAPACITACION_TAB_NAME:
      iconName = 'chalkboard-teacher';
      break;
    default:
      iconName = 'exclamation-circle';
  }

  return iconName;
}
