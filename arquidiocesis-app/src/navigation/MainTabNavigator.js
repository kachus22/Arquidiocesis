import {
  Acompanantes,
  Capacitaciones,
  Coordinadores,
  Grupos,
  Parroquias,
  Parrocos,
  ZonasList,
} from '../screens';

export const ZONAS_TAB_NAME = 'Zonas';
export const PARROQUIAS_TAB_NAME = 'Parroquias';
export const ACOMPANANTES_TAB_NAME = 'Acompañantes';
export const COORDINA_TAB_NAME = 'Coordina';
export const PARROCOS_TAB_NAME = 'Parrocos';
export const HEMA_TAB_NAME = 'HeMa';
export const CAPACITACION_TAB_NAME = 'Capacitación';

const TabScreens = {
  [ZONAS_TAB_NAME]: ZonasList,
  [PARROQUIAS_TAB_NAME]: Parroquias,
  [ACOMPANANTES_TAB_NAME]: Acompanantes,
  [COORDINA_TAB_NAME]: Coordinadores,
  [PARROCOS_TAB_NAME]: Parrocos,
  [HEMA_TAB_NAME]: Grupos,
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
    return filteredTabs([HEMA_TAB_NAME]);
  }

  if (userType === 'acompañante_zona' || userType === 'acompañante_decanato') {
    return filteredTabs([COORDINA_TAB_NAME, CAPACITACION_TAB_NAME]);
  }

  if (userType === 'parroco') {
    return filteredTabs([HEMA_TAB_NAME]);
  }

  if (userType === 'capacitacion') {
    return filteredTabs([CAPACITACION_TAB_NAME]);
  }

  return {};
}

export function getTabBarIconName(routeName) {
  let iconName;
  switch (routeName) {
    case ZONAS_TAB_NAME:
      iconName = 'map-marked-alt';
      break;
    case PARROQUIAS_TAB_NAME:
      iconName = 'church';
      break;
    case ACOMPANANTES_TAB_NAME:
      iconName = 'people-arrows';
      break;
    case COORDINA_TAB_NAME:
      iconName = 'user-circle';
      break;
    case HEMA_TAB_NAME:
      iconName = 'users';
      break;
    case CAPACITACION_TAB_NAME:
      iconName = 'chalkboard-teacher';
      break;
    case PARROCOS_TAB_NAME:
      iconName = 'cross';
      break;
    default:
      iconName = 'exclamation-circle';
  }

  return iconName;
}
